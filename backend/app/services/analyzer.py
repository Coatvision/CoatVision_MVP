from pathlib import Path
from typing import Dict, Any, Tuple


def analyze_image(input_path: Path, output_dir: Path) -> Tuple[Path, Dict[str, Any]]:
    """
    Kjernefunksjon for CoatVision Core.
    - Leser bilde
    - Kjører foreløpig enkel prosessering (placeholder)
    - Lager et output-bilde
    - Returnerer (sti_til_output, metrics)
    """
    # Lazy import to avoid startup failures on platforms missing system libs for OpenCV
    try:
        import cv2  # type: ignore
        import numpy as np  # type: ignore
    except Exception as e:
        raise RuntimeError(f"OpenCV unavailable: {e}")

    img = cv2.imread(str(input_path))
    if img is None:
        raise ValueError(f"Kunne ikke lese bilde: {input_path}")

    # Enkel "AI"-placeholder: kantdeteksjon
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)

    # Lag grønt overlay for å simulere coating-markering
    overlay = np.zeros_like(img)
    overlay[..., 1] = edges  # grønn kanal

    blended = cv2.addWeighted(img, 0.8, overlay, 0.7, 0)

    output_path = output_dir / f"{input_path.stem}_cv_output.png"
    cv2.imwrite(str(output_path), blended)

    coverage = float(np.count_nonzero(edges) / edges.size)

    metrics: Dict[str, Any] = {
        "edge_coverage_ratio": coverage,
        "note": "Dummy-metrikk – byttes ut med ekte AI-modell senere.",
    }

    return output_path, metrics
