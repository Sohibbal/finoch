import sys
import json
import os

def run_ocr(image_path):
    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image file not found: {image_path}"}))
        sys.exit(1)

    try:
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang='id', show_log=False)
        result = ocr.ocr(image_path, cls=True)
        lines = []
        if result and result[0]:
            for line in result[0]:
                text = line[1][0]
                confidence = float(line[1][1])
                lines.append({"text": text, "confidence": confidence})
        print(json.dumps({"success": True, "lines": lines}))
    except ImportError:
        # Fallback when paddleocr package is not installed in environment
        print(json.dumps({
            "success": False,
            "fallback": True,
            "message": "PaddleOCR not installed in current Python environment. Fall back to local parser."
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
    run_ocr(sys.argv[1])
