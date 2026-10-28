import sys
import json
from ultralytics import YOLO

MODEL_PATH = r"D:\Civic_issue\server\ai\best.pt"

if len(sys.argv) < 2:
    print(json.dumps({
        "success": False,
        "error": "No image path provided."
    }))
    sys.exit(1)

image_path = sys.argv[1]

try:
    model = YOLO(MODEL_PATH)

    results = model.predict(
        source=image_path,
        imgsz=128,
        device="cpu",
        verbose=False
    )

    result = results[0]

    predicted_class = result.names[result.probs.top1]
    confidence = float(result.probs.top1conf)

    response = {
        "success": True,
        "predictedClass": predicted_class,
        "confidence": confidence
    }

    print(json.dumps(response))

except Exception as error:
    print(json.dumps({
        "success": False,
        "error": str(error)
    }))
    sys.exit(1)