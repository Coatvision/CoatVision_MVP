from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from fastapi.responses import FileResponse

from .models import AnalyzeResponse
from .services.analyzer import analyze_image

# Basestier
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"
FRONTEND_DIR = BASE_DIR / "frontend"

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

app = FastAPI(title="CoatVision Core")

# Midlertidig åpen CORS – strammes inn senere
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "name": "CoatVision Core"}

@app.get("/ui")
def ui():
    """
    Enkel Modul 1-frontend.
    Serverer backend/frontend/index.html hvis den finnes.
    """
    index_file = FRONTEND_DIR / "index.html"
    if not index_file.exists():
        raise HTTPException(status_code=404, detail="Frontend not found")
    return FileResponse(index_file)

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(file: UploadFile = File(...)):
    # 1. Lagre opplastet fil
    save_path = UPLOAD_DIR / file.filename
    contents = await file.read()
    save_path.write_bytes(contents)

    # 2. Kjør analyse
    out_path, metrics = analyze_image(save_path, OUTPUT_DIR)

    # 3. Returner metadata til CoatVision-klienten
    return AnalyzeResponse(
        original_filename=file.filename,
        output_filename=out_path.name,
        metrics=metrics,
    )

@app.get("/outputs/{filename}")
def get_output_image(filename: str):
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Output file not found")
    return FileResponse(file_path)