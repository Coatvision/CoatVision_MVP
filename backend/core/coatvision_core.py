# backend/core/coatvision_core.py
import base64
import io
import os
from typing import Dict, Optional

import cv2
import numpy as np


def decode_base64_image(base64_str: str) -> np.ndarray:
    """Decode a base64 string to an OpenCV image."""
    img_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def encode_image_base64(img: np.ndarray) -> str:
    """Encode an OpenCV image to a base64 string."""
    _, buffer = cv2.imencode('.png', img)
    return base64.b64encode(buffer).decode('utf-8')


def analyze_coating(image: np.ndarray) -> Dict:
    """
    OpenCV-based coating analysis pipeline.
    Returns CVI (Coating Visual Index), CQI (Coating Quality Index), 
    coverage estimation, and other metrics.
    """
    if image is None:
        raise ValueError("Image could not be loaded")
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Convert to HSV for color analysis
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # 1. Edge detection for surface texture analysis
    edges = cv2.Canny(gray, 50, 150)
    edge_density = float(np.count_nonzero(edges) / edges.size)
    
    # 2. Color uniformity analysis (standard deviation of hue)
    hue_channel = hsv[:, :, 0]
    hue_std = float(np.std(hue_channel))
    color_uniformity = max(0, 1 - (hue_std / 90))  # Normalize to 0-1
    
    # 3. Saturation analysis for coating presence
    saturation = hsv[:, :, 1]
    mean_saturation = float(np.mean(saturation))
    saturation_score = mean_saturation / 255.0
    
    # 4. Value/brightness analysis
    value = hsv[:, :, 2]
    mean_brightness = float(np.mean(value))
    brightness_score = mean_brightness / 255.0
    
    # 5. Coverage estimation using thresholding
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    coverage = float(np.count_nonzero(binary) / binary.size)
    
    # 6. Surface smoothness (using Laplacian variance)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    laplacian_var = float(laplacian.var())
    smoothness = max(0, 1 - (laplacian_var / 5000))  # Normalize
    
    # Calculate CVI (Coating Visual Index) - weighted combination
    cvi = (
        color_uniformity * 0.3 +
        saturation_score * 0.25 +
        smoothness * 0.25 +
        (1 - edge_density) * 0.2
    ) * 100
    
    # Calculate CQI (Coating Quality Index)
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
        "note": "OpenCV-based heuristic analysis - no ML model"
    }


def process_image_file(file_path: str, output_dir: Optional[str] = None) -> Dict:
    """
    Process an image file and return analysis results.
    Optionally saves processed output to output_dir.
    """
    image = cv2.imread(file_path)
    if image is None:
        raise ValueError(f"Could not read image: {file_path}")
    
    metrics = analyze_coating(image)
    
    if output_dir:
        # Create visualization overlay
        overlay = create_analysis_overlay(image, metrics)
        output_path = os.path.join(output_dir, f"analyzed_{os.path.basename(file_path)}")
        cv2.imwrite(output_path, overlay)
        metrics["output_path"] = output_path
    
    return metrics


def create_analysis_overlay(image: np.ndarray, metrics: Dict) -> np.ndarray:
    """Create a visualization overlay showing analysis results."""
    result = image.copy()
    
    # Add edge detection overlay
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    
    # Create colored edge overlay
    edge_overlay = np.zeros_like(image)
    edge_overlay[edges > 0] = [0, 255, 0]  # Green for edges
    
    # Blend with original
    result = cv2.addWeighted(result, 0.7, edge_overlay, 0.3, 0)
    
    # Add text overlay with metrics
    font = cv2.FONT_HERSHEY_SIMPLEX
    y_offset = 30
    for key in ['cvi', 'cqi', 'coverage']:
        if key in metrics:
            text = f"{key.upper()}: {metrics[key]}%"
            cv2.putText(result, text, (10, y_offset), font, 0.7, (255, 255, 255), 2)
            y_offset += 30
    
    return result
