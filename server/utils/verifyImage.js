import { pipeline } from "@huggingface/transformers";

let imageClassifier = null;

/*
 * ============================================================
 * CIVIC ISSUE CATEGORIES
 * ============================================================
 */

const CIVIC_CATEGORIES = {
  Pothole:
    "a photo of a pothole or hole in a public street or village road, taken outdoors on a road surface",

  "Garbage / Waste":
    "a photo of garbage, litter, or waste dumped on a public road, street, roadside, or street corner in a city or village",

  "Water Supply":
    "a photo of a public water supply problem, such as a leaking or burst water pipe, damaged water tap, or broken water infrastructure along a street or in a neighborhood",

  Drainage:
    "a photo of a blocked, damaged, or overflowing public drainage system, gutter, or sewer along a street or in a neighborhood",

  "Road Damage":
    "a photo of a damaged, cracked, or broken public road, street, or village pathway",
};

/*
 * ============================================================
 * NON-CIVIC CATEGORIES
 *
 * Used only as "competition" so the model has something to
 * weigh civic labels against. We never report these directly.
 *
 * "Private Property" specifically exists to catch photos that
 * might otherwise LOOK like a civic category (a leak, a mess,
 * a crack) but are actually inside/on someone's private home
 * or land rather than a shared public space — those aren't
 * reportable civic issues even if visually similar.
 * ============================================================
 */

const NON_CIVIC_CATEGORIES = {
  Person: "a photo of a person",
  Food: "a photo of food",
  Animal: "a photo of an animal",
  Nature: "a photo of nature, mountains, trees, forests, or rural scenery with no infrastructure problem",
  Indoor: "a photo of an indoor room or household interior",
  Vehicle: "a photo mainly showing a normal car, bus, motorbike, or vehicle",
  Building: "a photo of a normal, undamaged building or house",
  "Private Property":
    "a photo of the inside of a private home, private yard, or personal belongings, not a shared public street or public space",
  "Garbage Elsewhere":
    "a photo of garbage, waste, or trash in a river, farmland, forest, field, empty plot, or private yard, but not on a public road or street",
};

/*
 * Minimum absolute confidence the best civic label must reach
 * (as a fraction of the FULL label set, civic + non-civic)
 * before we're willing to call something a civic issue at all.
 */
const CIVIC_THRESHOLD = 0.3;

/*
 * Minimum margin the best civic label must beat the best
 * non-civic label by. Prevents borderline "just barely won"
 * calls, e.g. civic 0.31 vs non-civic 0.29.
 */
const CIVIC_MARGIN = 0.05;

/*
 * ============================================================
 * LOAD MODEL
 * ============================================================
 */

export async function loadImageModel() {
  if (imageClassifier !== null) {
    return imageClassifier;
  }

  console.log("========================================");
  console.log("LOADING IMAGE AI MODEL");
  console.log("========================================");

  const loadedPipeline = await pipeline(
    "zero-shot-image-classification",
    "Xenova/clip-vit-base-patch32"
  );

  if (typeof loadedPipeline !== "function") {
    throw new Error("Invalid image classification pipeline.");
  }

  imageClassifier = loadedPipeline;

  console.log("Image AI model loaded successfully.");

  return imageClassifier;
}

/*
 * ============================================================
 * VERIFY IMAGE
 * ============================================================
 *
 * Single-pass detection:
 *
 *   1. Run CLIP ONCE over civic + non-civic labels together.
 *   2. Decide civic vs. not-civic from that one result set
 *      (threshold + margin over the best non-civic label).
 *   3. If civic, pick the category from the SAME result set —
 *      no second inference call. Confidence is renormalized
 *      over just the civic labels, which is mathematically
 *      exact because softmax renormalizes exactly under
 *      subset restriction: s_i / sum_civic(s_j) equals the
 *      score CLIP would have produced had it only been given
 *      the civic labels to begin with.
 *   4. Compare against the citizen's selected category.
 * ============================================================
 */

export async function verifyImage(imageBuffer, mimeType, selectedCategory) {
  try {
    console.log("========================================");
    console.log("IMAGE VERIFICATION STARTED");
    console.log("========================================");

    // ---------------------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------------------

    if (!selectedCategory) {
      throw new Error("Selected category is missing.");
    }

    if (!CIVIC_CATEGORIES[selectedCategory]) {
      throw new Error(`Invalid category: ${selectedCategory}`);
    }

    if (!imageBuffer) {
      throw new Error("Image buffer is missing.");
    }

    // ---------------------------------------------------------
    // LOAD MODEL
    // ---------------------------------------------------------

    const classifier = await loadImageModel();

    // ---------------------------------------------------------
    // CONVERT BUFFER -> BLOB
    // ---------------------------------------------------------

    const imageBytes = new Uint8Array(imageBuffer);
    const imageBlob = new Blob([imageBytes], { type: mimeType });

    // ---------------------------------------------------------
    // SINGLE CLIP PASS: civic + non-civic labels together
    // ---------------------------------------------------------

    console.log("----------------------------------------");
    console.log("STEP 1: SINGLE-PASS CLASSIFICATION");
    console.log("----------------------------------------");

    const civicEntries = Object.entries(CIVIC_CATEGORIES); // [name, prompt][]
    const civicLabels = civicEntries.map(([, prompt]) => prompt);
    const nonCivicLabels = Object.values(NON_CIVIC_CATEGORIES);
    const allLabels = [...civicLabels, ...nonCivicLabels];

    const results = await classifier(imageBlob, allLabels);
    results.sort((a, b) => b.score - a.score);

    console.log("Full result set:", results);

    const civicResults = results
      .filter((r) => civicLabels.includes(r.label))
      .sort((a, b) => b.score - a.score);

    const nonCivicResults = results
      .filter((r) => nonCivicLabels.includes(r.label))
      .sort((a, b) => b.score - a.score);

    const bestCivicResult = civicResults[0];
    const bestNonCivicResult = nonCivicResults[0];

    const bestCivicScore = bestCivicResult?.score ?? 0;
    const bestNonCivicScore = bestNonCivicResult?.score ?? 0;

    console.log("Best civic match:", bestCivicResult);
    console.log("Best non-civic match:", bestNonCivicResult);
    console.log("Civic score:", bestCivicScore);
    console.log("Non-civic score:", bestNonCivicScore);

    // ---------------------------------------------------------
    // CIVIC vs. NOT-CIVIC DECISION
    // ---------------------------------------------------------

    const passesThreshold = bestCivicScore >= CIVIC_THRESHOLD;
    const passesMargin =
      bestCivicScore - bestNonCivicScore >= CIVIC_MARGIN;

    const isCivicIssue = passesThreshold && passesMargin;

    const civicScorePct = Number((bestCivicScore * 100).toFixed(2));
    const nonCivicScorePct = Number((bestNonCivicScore * 100).toFixed(2));

    // ===========================================================
    // NOT CIVIC
    // ===========================================================

    if (!isCivicIssue) {
      const verification = {
        valid: false,
        status: "NOT_CIVIC_ISSUE",
        isCivicIssue: false,
        selectedCategory,
        predictedCategory: null,
        confidence: civicScorePct,
        civicScore: civicScorePct,
        nonCivicScore: nonCivicScorePct,
        message:
          "The uploaded image does not appear to show a supported civic issue.",
      };

      console.log("----------------------------------------");
      console.log("RESULT: NOT CIVIC ISSUE");
      console.log("----------------------------------------");
      console.log(verification);

      return verification;
    }

    // ===========================================================
    // STEP 2: IDENTIFY CIVIC CATEGORY (from the same pass)
    // ===========================================================

    console.log("----------------------------------------");
    console.log("STEP 2: IDENTIFYING CIVIC ISSUE CATEGORY");
    console.log("----------------------------------------");

    // Map the winning prompt back to its category name.
    let predictedCategory = null;
    for (const [category, prompt] of civicEntries) {
      if (bestCivicResult.label === prompt) {
        predictedCategory = category;
        break;
      }
    }

    // Exact renormalization over the civic subset only:
    // softmax(civic_i) = score_i / sum(civic scores)
    const civicScoreSum = civicResults.reduce((sum, r) => sum + r.score, 0);
    const predictedConfidence =
      civicScoreSum > 0
        ? Number(((bestCivicScore / civicScoreSum) * 100).toFixed(2))
        : civicScorePct;

    console.log("Civic-only ranking:", civicResults);
    console.log("Predicted category:", predictedCategory);
    console.log("Predicted confidence (renormalized):", predictedConfidence);

    // ===========================================================
    // STEP 3: COMPARE WITH CITIZEN-SELECTED CATEGORY
    // ===========================================================

    console.log("----------------------------------------");
    console.log("STEP 3: COMPARING SELECTED CATEGORY");
    console.log("----------------------------------------");
    console.log("Selected category:", selectedCategory);
    console.log("Predicted category:", predictedCategory);

    const isMatch = predictedCategory === selectedCategory;

    const verification = {
      valid: isMatch,
      status: isMatch ? "VALID" : "INVALID_CATEGORY",
      isCivicIssue: true,
      selectedCategory,
      predictedCategory,
      confidence: predictedConfidence,
      civicScore: civicScorePct,
      nonCivicScore: nonCivicScorePct,
      message: isMatch
        ? "The uploaded image is a civic issue and matches the selected category."
        : `The uploaded image appears to show ${predictedCategory}, not ${selectedCategory}.`,
    };

    console.log("----------------------------------------");
    console.log(`RESULT: ${verification.status}`);
    console.log("----------------------------------------");
    console.log(verification);

    return verification;
  } catch (error) {
    console.error("Error inside verifyImage():", error);
    throw error;
  }
}
