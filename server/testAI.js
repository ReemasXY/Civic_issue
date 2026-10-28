import { predictImage } from "./utils/aiService.js";

const imagePath =
  "D:\\Civic_issue\\server\\uploads\\reports\\3b9f48f7-ea44-44a2-88ed-bdf8751fd665_1789723999022.jpg";

try {
  const result = await predictImage(imagePath);

  console.log("\nAI RESULT");
  console.log("====================");
  console.log(result);
  console.log("====================\n");
} catch (error) {
  console.error("AI ERROR:");
  console.error(error.message);
}