import cv2
import numpy as np
import base64
from typing import Tuple, List, Dict, Any

def encode_img_to_base64(img: np.ndarray, format: str = ".jpg") -> str:
    """Helper to convert OpenCV image (BGR) to base64 data URI."""
    if img is None or img.size == 0:
        return ""
    success, buffer = cv2.imencode(format, img)
    if not success:
        return ""
    b64_str = base64.b64encode(buffer).decode("utf-8")
    mime_type = "image/jpeg" if format.lower() in [".jpg", ".jpeg"] else "image/png"
    return f"data:{mime_type};base64,{b64_str}"

def preprocess_image(img_bgr: np.ndarray, max_dimension: int = 1200) -> Dict[str, Any]:
    """
    Validates, resizes image if oversized while maintaining aspect ratio,
    and creates a grayscale version for feature detection.
    """
    if img_bgr is None or img_bgr.size == 0:
        raise ValueError("Invalid or empty image provided.")

    orig_h, orig_w, orig_c = img_bgr.shape
    h, w = orig_h, orig_w
    scale = 1.0

    # Resize if max dimension is exceeded to optimize memory & DIP processing speed
    if max(h, w) > max_dimension:
        if h > w:
            new_h = max_dimension
            new_w = int(w * (max_dimension / h))
        else:
            new_w = max_dimension
            new_h = int(h * (max_dimension / w))
        scale = new_w / w
        img_bgr = cv2.resize(img_bgr, (new_w, new_h), interpolation=cv2.INTER_AREA)
        h, w = new_h, new_w

    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    return {
        "color": img_bgr,
        "gray": img_gray,
        "original_dims": (orig_w, orig_h),
        "processed_dims": (w, h),
        "channels": orig_c,
        "scale_factor": scale,
        "gray_b64": encode_img_to_base64(img_gray),
        "color_b64": encode_img_to_base64(img_bgr)
    }
