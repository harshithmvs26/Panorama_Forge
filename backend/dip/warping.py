import cv2
import numpy as np
from typing import Dict, Any, Tuple
from dip.preprocessing import encode_img_to_base64

def warp_perspective_pair(
    img1: np.ndarray,
    img2: np.ndarray,
    H: np.ndarray
) -> Dict[str, Any]:
    """
    Computes common canvas dimensions, translation offsets for negative coordinates,
    and warps img2 onto the aligned frame while placing img1 in the translated frame.
    """
    h1, w1 = img1.shape[:2]
    h2, w2 = img2.shape[:2]

    # Corner points of image 2 in homogeneous coordinates
    corners_img2 = np.float32([[0, 0], [0, h2], [w2, h2], [w2, 0]]).reshape(-1, 1, 2)
    # Map corners of image 2 through homography H
    warped_corners_img2 = cv2.perspectiveTransform(corners_img2, H)

    # Corner points of image 1 (reference image)
    corners_img1 = np.float32([[0, 0], [0, h1], [w1, h1], [w1, 0]]).reshape(-1, 1, 2)

    # All corner coordinates in panoramic canvas space
    all_corners = np.concatenate((corners_img1, warped_corners_img2), axis=0)

    # Calculate bounding box bounds
    [x_min, y_min] = np.int32(all_corners.min(axis=0).ravel() - 0.5)
    [x_max, y_max] = np.int32(all_corners.max(axis=0).ravel() + 0.5)

    # Translation offset matrix to shift negative coordinates to positive canvas space
    translation_offset = [-x_min if x_min < 0 else 0, -y_min if y_min < 0 else 0]

    offset_x = int(translation_offset[0])
    offset_y = int(translation_offset[1])

    H_translation = np.array([
        [1, 0, offset_x],
        [0, 1, offset_y],
        [0, 0, 1]
    ], dtype=np.float64)

    # Canvas dimensions
    canvas_w = int(x_max - x_min)
    canvas_h = int(y_max - y_min)

    # Safety check on canvas dimensions
    if canvas_w > 8000 or canvas_h > 8000 or canvas_w <= 0 or canvas_h <= 0:
        raise ValueError(f"Excessive or invalid canvas dimensions computed: ({canvas_w} x {canvas_h}).")

    # Warp image 2 using composite homography (H_translation * H)
    H_composite = H_translation.dot(H)
    img2_warped = cv2.warpPerspective(img2, H_composite, (canvas_w, canvas_h))

    # Place image 1 on the translated canvas
    img1_warped = np.zeros((canvas_h, canvas_w, 3), dtype=np.uint8)
    img1_warped[offset_y:offset_y + h1, offset_x:offset_x + w1] = img1

    return {
        "img1_warped": img1_warped,
        "img2_warped": img2_warped,
        "canvas_size": (canvas_w, canvas_h),
        "translation_offset": (offset_x, offset_y),
        "H_composite": H_composite,
        "warped_vis_b64": encode_img_to_base64(img2_warped),
        "ref_placed_b64": encode_img_to_base64(img1_warped)
    }
