import cv2
import numpy as np
from typing import Dict, Any
from dip.preprocessing import encode_img_to_base64

def crop_black_borders(img_bgr: np.ndarray) -> Dict[str, Any]:
    """
    Detects valid non-black canvas region, draws green crop box visualization,
    and crops surrounding empty black borders.
    """
    if img_bgr is None or img_bgr.size == 0:
        return {
            "cropped": img_bgr,
            "cropped_b64": "",
            "crop_vis_b64": "",
            "before_dims": (0, 0),
            "after_dims": (0, 0),
            "crop_bbox": (0, 0, 0, 0)
        }

    h_before, w_before = img_bgr.shape[:2]

    # Convert to grayscale and threshold non-zero content
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 1, 255, cv2.THRESH_BINARY)

    # Find non-zero pixel coordinates
    non_zero_pts = cv2.findNonZero(thresh)
    if non_zero_pts is None:
        return {
            "cropped": img_bgr,
            "cropped_b64": encode_img_to_base64(img_bgr),
            "crop_vis_b64": encode_img_to_base64(img_bgr),
            "before_dims": (w_before, h_before),
            "after_dims": (w_before, h_before),
            "crop_bbox": (0, 0, w_before, h_before)
        }

    x, y, w, h = cv2.boundingRect(non_zero_pts)

    # Create visualization showing bright green crop bounding box on the original uncropped canvas
    crop_vis = img_bgr.copy()
    cv2.rectangle(crop_vis, (x, y), (x + w - 1, y + h - 1), (0, 255, 0), 4)

    # Add text overlay explaining green crop box
    cv2.putText(
        crop_vis,
        f"Crop Box: {w}x{h} px (Green Rectangle)",
        (x + 10, max(y + 35, 40)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2,
        cv2.LINE_AA
    )

    cropped = img_bgr[y:y+h, x:x+w]
    h_after, w_after = cropped.shape[:2]

    return {
        "cropped": cropped,
        "cropped_b64": encode_img_to_base64(cropped),
        "crop_vis_b64": encode_img_to_base64(crop_vis),
        "before_dims": (w_before, h_before),
        "after_dims": (w_after, h_after),
        "crop_bbox": (int(x), int(y), int(w), int(h))
    }
