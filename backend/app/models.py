from pydantic import BaseModel
from typing import Dict, Any


class AnalyzeResponse(BaseModel):
    original_filename: str
    output_filename: str
    metrics: Dict[str, Any]  # f.eks. {"coating_coverage": 0.87}
