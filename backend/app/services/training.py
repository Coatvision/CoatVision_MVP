from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import List


class Phase(str, Enum):
    """
    Treningsfaser for CoatVision.
    Disse matcher planene dine:
    - Fase 1: base info (bil, panel, farge, kode)
    - Fase 2: coating vs ikke coating
    - Fase 3: ny avstand
    - Fase 4: bakgrunnsstøy
    - Fase 5: nytt lys
    """
    BASE_INFO = "phase_1_base_info"
    COATING_VS_NO = "phase_2_coating_vs_no"
    NEW_DISTANCE = "phase_3_new_distance"
    BACKGROUND_NOISE = "phase_4_background_noise"
    NEW_LIGHT = "phase_5_new_light"


@dataclass
class TrainingSession:
    """
    En treningsøkt for ett panel (f.eks. svart Tesla framskjerm).
    """
    id: str
    car_brand: str
    panel: str
    color: str
    color_code: str
    phase: Phase
    image_paths: List[Path] = field(default_factory=list)

    def add_image(self, img_path: Path) -> None:
        """Legger til et bilde i denne treningsøkta."""
        self.image_paths.append(img_path)
