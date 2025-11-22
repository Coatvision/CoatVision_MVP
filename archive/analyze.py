import os
import cv2
import numpy as np

def _ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def _resize_safely(img, max_side=1600):
    h, w = img.shape[:2]
    m = max(h, w)
    if m <= max_side:
        return img
    scale = max_side / m
    new_w = int(w * scale)
    new_h = int(h * scale)
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

def analyze_image(input_path: str, output_dir: str):
    """
    Leser bilde -> lager heatmap/overlay for tekstur/kontrast -> lagrer i outputs/
    Returnerer (filnavn_på_overlay, metrics_dict)
    """
    _ensure_dir(output_dir)

    # --- Les bilde ---
    img = cv2.imread(input_path)  # BGR
    if img is None:
        raise ValueError(f"Kunne ikke lese bildet: {input_path}")

    img = _resize_safely(img, max_side=1600)

    # --- Grått nivå og glatting ---
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_blur = cv2.GaussianBlur(gray, (3, 3), 0)

    # --- Enkle måltall (proxyer for glans/kontrast/tekstur) ---
    brightness = float(np.mean(gray))              # lysstyrke (0-255)
    contrast = float(np.std(gray))                 # standardavvik = kontrast
    lap = cv2.Laplacian(gray_blur, cv2.CV_64F)
    sharpness = float(lap.var())                   # var(Laplacian) = skarphet/tekstur
    edges = cv2.Canny(gray_blur, 50, 150)
    edge_density = float(np.count_nonzero(edges)) / edges.size  # andel kant-piksler

    # --- Heatmap ---
    lap_abs = np.abs(lap)
    heat_src = cv2.normalize(lap_abs, None, 0, 255, cv2.NORM_MINMAX).astype("uint8")
    heatmap = cv2.applyColorMap(heat_src, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)

    # --- Lagre resultat ---
    base = os.path.splitext(os.path.basename(input_path))[0]
    out_name = f"{base}_overlay.jpg"
    out_path = os.path.join(output_dir, out_name)
    cv2.imwrite(out_path, overlay, [int(cv2.IMWRITE_JPEG_QUALITY), 90])

    # --- Nøkkeltall ---
    metrics = {
        "brightness_mean": round(brightness, 2),
        "contrast_std": round(contrast, 2),
        "sharpness_var_laplacian": round(sharpness, 2),
        "edge_density": round(edge_density, 4),
        "notes": "Høyere verdier ~ mer tekstur/kanter (ofte ujevnheter/ikke-coating)."
    }

    return out_name, metrics
