import os
import io
import time
import requests
import cv2
import numpy as np
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, HttpUrl

from dip.pipeline import run_panorama_pipeline
from utils.sample_generator import generate_sample_sets

app = FastAPI(
    title="PanoramaForge API",
    description="Backend Digital Image Processing Engine for Automatic Panorama Stitching",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLE_DIR = os.path.join(BASE_DIR, "sample_images")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

os.makedirs(SAMPLE_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Generate sample image sets if they don't exist yet
if not os.path.exists(os.path.join(SAMPLE_DIR, "campus", "img1.jpg")):
    generate_sample_sets(SAMPLE_DIR)

app.mount("/sample_images", StaticFiles(directory=SAMPLE_DIR), name="sample_images")


class UrlStitchRequest(BaseModel):
    urls: List[str]
    nfeatures: Optional[int] = 2000
    ratio_threshold: Optional[float] = 0.75
    ransac_threshold: Optional[float] = 4.0
    max_dimension: Optional[int] = 1200


class SampleStitchRequest(BaseModel):
    category: str
    nfeatures: Optional[int] = 2000
    ratio_threshold: Optional[float] = 0.75
    ransac_threshold: Optional[float] = 4.0
    max_dimension: Optional[int] = 1200


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "PanoramaForge DIP Processing Engine",
        "opencv_version": cv2.__version__,
        "numpy_version": np.__version__
    }


@app.get("/api/samples")
def get_sample_categories():
    categories = []
    if os.path.exists(SAMPLE_DIR):
        for name in sorted(os.listdir(SAMPLE_DIR)):
            cat_path = os.path.join(SAMPLE_DIR, name)
            if os.path.isdir(cat_path):
                images = [f"/sample_images/{name}/{img}" for img in sorted(os.listdir(cat_path)) if img.lower().endswith(('.jpg', '.jpeg', '.png'))]
                categories.append({
                    "id": name,
                    "name": name.capitalize(),
                    "images": images
                })
    return {"categories": categories}


@app.post("/api/stitch")
async def stitch_uploaded_files(
    files: List[UploadFile] = File(...),
    nfeatures: int = Form(2000),
    ratio_threshold: float = Form(0.75),
    ransac_threshold: float = Form(4.0),
    max_dimension: int = Form(1200)
):
    """
    Accepts 2-5 uploaded image files, validates them, and passes them to DIP processing pipeline.
    """
    if len(files) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 overlapping images must be uploaded to stitch a panorama."
        )
    if len(files) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 images are allowed per stitching run."
        )

    images_bgr = []
    for f in files:
        contents = await f.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{f.filename}' could not be decoded as a valid image."
            )
        images_bgr.append(img)

    try:
        results = run_panorama_pipeline(
            images_bgr=images_bgr,
            nfeatures=nfeatures,
            ratio_threshold=ratio_threshold,
            ransac_threshold=ransac_threshold,
            max_dimension=max_dimension
        )
        return JSONResponse(content=results)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@app.post("/api/stitch/url")
def stitch_from_urls(req: UrlStitchRequest):
    """
    Downloads images from valid public HTTP/HTTPS URLs with size & content validation.
    """
    if len(req.urls) < 2 or len(req.urls) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide between 2 and 5 public image URLs."
        )

    images_bgr = []
    for idx, url_str in enumerate(req.urls):
        if not (url_str.startswith("http://") or url_str.startswith("https://")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"URL #{idx+1} is invalid. Only HTTP/HTTPS URLs are supported."
            )
        try:
            resp = requests.get(url_str, timeout=10, stream=True)
            resp.raise_for_status()

            content_type = resp.headers.get("content-type", "")
            if not any(t in content_type.lower() for t in ["image", "octet-stream"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"URL #{idx+1} does not point to a supported image content type ({content_type})."
                )

            contents = resp.content
            if len(contents) > 15 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Image #{idx+1} exceeds maximum size limit of 15MB."
                )

            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Could not decode image from URL #{idx+1}."
                )
            images_bgr.append(img)
        except requests.RequestException as re:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch image from URL #{idx+1}: {str(re)}"
            )

    try:
        results = run_panorama_pipeline(
            images_bgr=images_bgr,
            nfeatures=req.nfeatures,
            ratio_threshold=req.ratio_threshold,
            ransac_threshold=req.ransac_threshold,
            max_dimension=req.max_dimension
        )
        return JSONResponse(content=results)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@app.post("/api/stitch/sample")
def stitch_from_sample_category(req: SampleStitchRequest):
    """
    Executes stitching using pre-loaded sample images from sample_images/ directory.
    """
    cat_dir = os.path.join(SAMPLE_DIR, req.category.lower())
    if not os.path.exists(cat_dir):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample category '{req.category}' not found."
        )

    file_names = sorted([f for f in os.listdir(cat_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    if len(file_names) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sample category '{req.category}' does not contain enough images."
        )

    images_bgr = []
    for fn in file_names:
        img_path = os.path.join(cat_dir, fn)
        img = cv2.imread(img_path)
        if img is not None:
            images_bgr.append(img)

    try:
        results = run_panorama_pipeline(
            images_bgr=images_bgr,
            nfeatures=req.nfeatures,
            ratio_threshold=req.ratio_threshold,
            ransac_threshold=req.ransac_threshold,
            max_dimension=req.max_dimension
        )
        return JSONResponse(content=results)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
