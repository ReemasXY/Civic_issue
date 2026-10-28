import { spawn } from "child_process";
import path from "path";

export const predictImage = (imagePath) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "ai",
      "predict.py"
    );

    const python = spawn("py", [
      scriptPath,
      imagePath,
    ]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            errorOutput || "AI prediction failed."
          )
        );
        return;
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (error) {
        reject(
          new Error("Invalid response received from AI model.")
        );
      }
    });
  });
};