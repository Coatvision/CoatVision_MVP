# backend/app/core/coatvision_core.py
import base64
import os
from typing import Dict, Optional

import cv2
import numpy as np

# Analysis configuration constants
MAX_HUE_STD_DEVIATION = 90
MAX_LAPLACIAN_VARIANCE = 5000


def decode_base64_image(base64_str: str) -> np.ndarray:
    img_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Decoded image is None. The input may not be a valid base64-encoded image.")
    return img


def encode_image_base64(img: np.ndarray) -> str:
    _, buffer = cv2.imencode('.png', img)
    return base64.b64encode(buffer.tobytes()).decode('utf-8')


def analyze_coating(image: np.ndarray) -> Dict:
    if image is None:
        raise ValueError("Image could not be loaded")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    edges = cv2.Canny(gray, 50, 150)
    edge_density = float(np.count_nonzero(edges) / edges.size)

    hue_channel = hsv[:, :, 0].astype(np.float32)
    hue_std = float(np.std(hue_channel))
    color_uniformity = max(0, 1 - (hue_std / MAX_HUE_STD_DEVIATION))

    saturation = hsv[:, :, 1]
    mean_saturation = float(np.mean(saturation.astype(np.float32)))
    saturation_score = mean_saturation / 255.0

    value = hsv[:, :, 2]
    mean_brightness = float(np.mean(value.astype(np.float32)))
    brightness_score = mean_brightness / 255.0

    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    coverage = float(np.count_nonzero(binary) / binary.size)

    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    laplacian_var = float(laplacian.var())
    smoothness = max(0, 1 - (laplacian_var / MAX_LAPLACIAN_VARIANCE))

    cvi = (
        color_uniformity * 0.3 +
        saturation_score * 0.25 +
        smoothness * 0.25 +
        (1 - edge_density) * 0.2
    ) * 100

    cqi = (
        coverage * 0.35 +
        color_uniformity * 0.25 +
        smoothness * 0.25 +
        brightness_score * 0.15
    ) * 100

    return {
        "cvi": round(cvi, 2),
        "cqi": round(cqi, 2),
        "coverage": round(coverage * 100, 2),
        "color_uniformity": round(color_uniformity * 100, 2),
        "smoothness": round(smoothness * 100, 2),
        "edge_density": round(edge_density * 100, 2),
        "saturation_score": round(saturation_score * 100, 2),
        "brightness_score": round(brightness_score * 100, 2),
        "laplacian_variance": round(laplacian_var, 2),
        "note": "OpenCV-based heuristic analysis - no ML model",
    }


def process_image_file(file_path: str, output_dir: Optional[str] = None) -> Dict:
    image = cv2.imread(file_path)
    if image is None:
        raise ValueError(f"Could not read image: {file_path}")

    metrics = analyze_coating(image)

    if output_dir:
        overlay = create_analysis_overlay(image, metrics)
        output_path = os.path.join(output_dir, f"analyzed_{os.path.basename(file_path)}")
        cv2.imwrite(output_path, overlay)
        metrics["output_path"] = output_path

    return metrics


def create_analysis_overlay(image: np.ndarray, metrics: Dict) -> np.ndarray:
    result = image.copy()
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)

    edge_overlay = np.zeros_like(image)
    edge_overlay[edges > 0] = [0, 255, 0]

    result = cv2.addWeighted(result, 0.7, edge_overlay, 0.3, 0)

    font = cv2.FONT_HERSHEY_SIMPLEX
    y_offset = 30
    for key in ['cvi', 'cqi', 'coverage']:
        if key in metrics:
            text = f"{key.upper()}: {metrics[key]}%"
            cv2.putText(result, text, (10, y_offset), font, 0.7, (255, 255, 255), 2)
            y_offset += 30

    return result
