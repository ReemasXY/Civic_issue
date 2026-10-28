import { pipeline } from "@huggingface/transformers";
import { predictImage } from "./aiService.js";
import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

let imageClassifier = null;

const YOLO_CATEGORIES = [
    "Road Damage",
    "Garbage / Waste"
];

const CLIP_CATEGORIES = {
    "Road Damage": [
        "a photo of a damaged public road",
        "a photo of a cracked public road",
        "a photo of a broken road surface",
        "a photo of road damage or pavement damage",
        "a photo of potholes, cracks, or damaged asphalt on a public street"
    ],

    "Garbage / Waste": [
        "a photo of garbage dumped on a public road",
        "a photo of litter or waste on a public street",
        "a photo of a pile of garbage in a public area",
        "a photo of waste or rubbish dumped beside a road",
        "a photo of public garbage or improperly dumped waste"
    ],

    "Streetlight Damage": [
        "a photo of a damaged streetlight",
        "a photo of a broken street light pole",
        "a photo of a damaged lamp post on a public road",
        "a photo of a fallen streetlight pole",
        "a photo of a leaning streetlight pole",
        "a photo of a bent streetlight pole",
        "a photo of a broken streetlight fixture",
        "a photo of a damaged street lamp",
        "a photo of a streetlight with a broken lamp",
        "a photo of a streetlight with a damaged light fixture",
        "a photo of a streetlight with exposed or damaged electrical wiring",
        "a photo of a fallen lamp post beside a road",
        "a photo of a tilted or unstable streetlight pole",
        "a photo of a streetlight pole that has been hit or physically damaged",
        "a photo of a missing or broken streetlight fixture",
        "a photo of a damaged public lighting pole",
        "a photo of a broken roadside lamp post",
        "a photo of a damaged or non-functional-looking streetlight"
    ],

    "Drainage": [
        "a photo of a blocked public drainage system",
        "a photo of an overflowing street drain",
        "a photo of a damaged roadside drain",
        "a photo of a blocked gutter beside a public road",
        "a photo of a damaged or overflowing sewer along a public street"
    ]
};

const NON_CIVIC_CATEGORIES = {
    Person: [
        "a photo of a person",
        "a photo mainly showing a human"
    ],

    Food: [
        "a photo of food",
        "a photo mainly showing food or a meal"
    ],

    Animal: [
        "a photo of an animal",
        "a photo mainly showing a pet or animal"
    ],

    Nature: [
        "a photo of nature",
        "a photo of mountains, trees, or forests without a civic issue",
        "a photo of a natural landscape"
    ],

    Indoor: [
        "a photo of an indoor room",
        "a photo of a household interior",
        "a photo taken inside a building"
    ],

    Vehicle: [
        "a photo mainly showing a normal car",
        "a photo mainly showing a bus or motorbike",
        "a photo of a normal vehicle without a civic issue"
    ],

    Building: [
        "a photo of a normal undamaged building",
        "a photo of a normal house or building",
        "a photo of a building without visible civic damage"
    ],

    "Private Property": [
        "a photo of a private home",
        "a photo of a private yard",
        "a photo of personal belongings rather than a public space"
    ],

    "Garbage Elsewhere": [
        "a photo of garbage in a river",
        "a photo of garbage in farmland",
        "a photo of garbage in a forest or field",
        "a photo of garbage in a private yard rather than a public road"
    ]
};

const MIN_YOLO_CONFIDENCE = 0.60;
const CLIP_THRESHOLD = 0.30;
const CLIP_MARGIN = 0.05;

const YOLO_CLASS_MAP = {
    Road_Damage: "Road Damage",
    Garbage_Waste: "Garbage / Waste"
};

const ALLOWED_CATEGORIES = [
    "Road Damage",
    "Garbage / Waste",
    "Drainage",
    "Streetlight Damage"
];

const ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
};

async function loadClipModel() {
    if (!imageClassifier) {
        console.log("Loading Hugging Face CLIP model...");

        imageClassifier = await pipeline(
            "zero-shot-image-classification",
            "Xenova/clip-vit-base-patch32"
        );

        console.log("CLIP model loaded.");
    }

    return imageClassifier;
}

async function verifyWithYOLO(
    imageBuffer,
    mimeType,
    selectedCategory
) {
    let imagePath;

    try {
        const extension = ALLOWED_MIME_TYPES[mimeType];

        imagePath = path.join(
            os.tmpdir(),
            `civic-${crypto.randomUUID()}${extension}`
        );

        await fs.writeFile(imagePath, imageBuffer);

        console.log("Using YOLO for:", selectedCategory);

        const result = await predictImage(imagePath);

        const predictedClass = result.predictedClass;
        const confidence = Number(result.confidence);

        if (
            !Number.isFinite(confidence) ||
            confidence < 0 ||
            confidence > 1
        ) {
            throw new Error("YOLO returned an invalid confidence score.");
        }

        const confidencePct = Number(
            (confidence * 100).toFixed(2)
        );

        if (predictedClass === "Non_Civic") {
            return {
                valid: false,
                status: "NOT_CIVIC_ISSUE",
                isCivicIssue: false,
                selectedCategory,
                predictedCategory: null,
                confidence: confidencePct,
                civicScore: 0,
                nonCivicScore: confidencePct,
                message:
                    "The uploaded image appears to be a non-civic image."
            };
        }

        const predictedCategory = YOLO_CLASS_MAP[predictedClass];

        if (!predictedCategory) {
            throw new Error(
                `Unexpected YOLO class: ${predictedClass}`
            );
        }

        if (confidence < MIN_YOLO_CONFIDENCE) {
            return {
                valid: false,
                status: "INVALID_CATEGORY",
                isCivicIssue: false,
                selectedCategory,
                predictedCategory,
                confidence: confidencePct,
                civicScore: confidencePct,
                nonCivicScore: 0,
                message:
                    "The model is not confident enough. Please upload a clearer image."
            };
        }

        const isMatch = predictedCategory === selectedCategory;

        return {
            valid: isMatch,
            status: isMatch ? "VALID" : "INVALID_CATEGORY",
            isCivicIssue: true,
            selectedCategory,
            predictedCategory,
            confidence: confidencePct,
            civicScore: confidencePct,
            nonCivicScore: 0,
            message: isMatch
                ? "The image matches the selected civic issue category."
                : `The image appears to show ${predictedCategory}, not ${selectedCategory}.`
        };
    } finally {
        if (imagePath) {
            await fs.unlink(imagePath).catch(() => {});
        }
    }
}

async function verifyWithCLIP(
    imageBuffer,
    mimeType,
    selectedCategory
) {
    console.log(
        "Using Hugging Face CLIP for:",
        selectedCategory
    );

    const classifier = await loadClipModel();

    const imageBlob = new Blob(
        [new Uint8Array(imageBuffer)],
        { type: mimeType }
    );

    const civicEntries = Object.entries(CLIP_CATEGORIES);

    const civicPrompts = civicEntries.flatMap(
        ([category, prompts]) =>
            prompts.map(prompt => ({
                category,
                prompt
            }))
    );

    const nonCivicPrompts = Object.entries(
        NON_CIVIC_CATEGORIES
    ).flatMap(
        ([category, prompts]) =>
            prompts.map(prompt => ({
                category,
                prompt
            }))
    );

    const allPrompts = [
        ...civicPrompts,
        ...nonCivicPrompts
    ];

    const results = await classifier(
        imageBlob,
        allPrompts.map(item => item.prompt)
    );

    const civicResults = results
        .map(result => {
            const prompt = civicPrompts.find(
                item => item.prompt === result.label
            );

            return prompt
                ? {
                    ...prompt,
                    score: result.score
                }
                : null;
        })
        .filter(Boolean);

    const nonCivicResults = results
        .map(result => {
            const prompt = nonCivicPrompts.find(
                item => item.prompt === result.label
            );

            return prompt
                ? {
                    ...prompt,
                    score: result.score
                }
                : null;
        })
        .filter(Boolean);

    const categoryScores = {};

    for (const result of civicResults) {
        if (
            !categoryScores[result.category] ||
            result.score > categoryScores[result.category]
        ) {
            categoryScores[result.category] = result.score;
        }
    }

    const sortedCivicCategories = Object.entries(
        categoryScores
    ).sort((a, b) => b[1] - a[1]);

    const bestCivicCategory =
        sortedCivicCategories[0];

    const bestCivicScore =
        bestCivicCategory?.[1] ?? 0;

    const bestCivicName =
        bestCivicCategory?.[0] ?? null;

    const bestNonCivic = nonCivicResults
        .sort((a, b) => b.score - a.score)[0];

    const nonCivicScore =
        bestNonCivic?.score ?? 0;

    const civicScorePct = Number(
        (bestCivicScore * 100).toFixed(2)
    );

    const nonCivicScorePct = Number(
        (nonCivicScore * 100).toFixed(2)
    );

    console.log(
        "CLIP civic category scores:",
        categoryScores
    );

    console.log(
        "Best civic category:",
        bestCivicName,
        civicScorePct + "%"
    );

    console.log(
        "Best non-civic score:",
        nonCivicScorePct + "%"
    );

    const isCivic =
        bestCivicScore >= CLIP_THRESHOLD &&
        bestCivicScore - nonCivicScore >= CLIP_MARGIN;

    if (!isCivic) {
        return {
            valid: false,
            status: "NOT_CIVIC_ISSUE",
            isCivicIssue: false,
            selectedCategory,
            predictedCategory: null,
            confidence: civicScorePct,
            civicScore: civicScorePct,
            nonCivicScore: nonCivicScorePct,
            message:
                "The uploaded image does not appear to show a supported civic issue."
        };
    }

    const predictedCategory = bestCivicName;

    const civicTotal = sortedCivicCategories.reduce(
        (sum, [, score]) => sum + score,
        0
    );

    const confidence =
        civicTotal > 0
            ? Number(
                (
                    (bestCivicScore / civicTotal) *
                    100
                ).toFixed(2)
            )
            : civicScorePct;

    const isMatch =
        predictedCategory === selectedCategory;

    return {
        valid: isMatch,
        status: isMatch
            ? "VALID"
            : "INVALID_CATEGORY",
        isCivicIssue: true,
        selectedCategory,
        predictedCategory,
        confidence,
        civicScore: civicScorePct,
        nonCivicScore: nonCivicScorePct,
        message: isMatch
            ? "The image matches the selected civic issue category."
            : `The image appears to show ${predictedCategory}, not ${selectedCategory}.`
    };
}

export async function verifyImage(
    imageBuffer,
    mimeType,
    selectedCategory
) {
    if (
        typeof selectedCategory !== "string" ||
        !ALLOWED_CATEGORIES.includes(selectedCategory)
    ) {
        throw new Error(
            "Invalid or unsupported issue category."
        );
    }

    if (
        !Buffer.isBuffer(imageBuffer) ||
        imageBuffer.length === 0
    ) {
        throw new Error("Image data is missing.");
    }

    if (!ALLOWED_MIME_TYPES[mimeType]) {
        throw new Error(
            "Unsupported image format. Use JPG, PNG, or WEBP."
        );
    }

    if (YOLO_CATEGORIES.includes(selectedCategory)) {
        return verifyWithYOLO(
            imageBuffer,
            mimeType,
            selectedCategory
        );
    }

    return verifyWithCLIP(
        imageBuffer,
        mimeType,
        selectedCategory
    );
}