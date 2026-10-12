import cv2
import numpy as np
from typing import Dict, Any
from dip.preprocessing import encode_img_to_base64

def weighted_distance_blend(
    img1_warped: np.ndarray,
    img2_warped: np.ndarray
) -> Dict[str, Any]:
    """
    Performs distance-transform feather blending between two aligned canvas images.
    Eliminates hard seams and exposure transition boundary artifacts.
    """
    # Create binary masks of non-zero pixel regions
    gray1 = cv2.cvtColor(img1_warped, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2_warped, cv2.COLOR_BGR2GRAY)

    mask1 = (gray1 > 0).astype(np.uint8)
    mask2 = (gray2 > 0).astype(np.uint8)

    # Compute Euclidean distance transform from mask edges inward
    dist1 = cv2.distanceTransform(mask1, cv2.DIST_L2, 5)
    dist2 = cv2.distanceTransform(mask2, cv2.DIST_L2, 5)

    # Calculate sum of distance weights with numerical stability constant
    sum_dist = dist1 + dist2
    sum_dist[sum_dist == 0] = 1e-5

    # Compute alpha weight map for img1 (0.0 to 1.0)
    alpha = dist1 / sum_dist
    alpha_3d = np.repeat(alpha[:, :, np.newaxis], 3, axis=2)

    # Perform linear interpolation blending
    blended = np.zeros_like(img1_warped, dtype=np.uint8)

    # Identify spatial regions
    only_img1 = (mask1 == 1) & (mask2 == 0)
    only_img2 = (mask1 == 0) & (mask2 == 1)
    overlap = (mask1 == 1) & (mask2 == 1)

    # Assign non-overlapping areas directly
    blended[only_img1] = img1_warped[only_img1]
    blended[only_img2] = img2_warped[only_img2]

    # Assign smooth distance-weighted values to overlap region
    blended_overlap = (img1_warped * alpha_3d + img2_warped * (1.0 - alpha_3d)).astype(np.uint8)
    blended[overlap] = blended_overlap[overlap]

    # Create visualization maps for explanation
    overlap_vis = np.zeros_like(img1_warped)
    overlap_vis[overlap] = [0, 255, 255] # Yellow highlight for overlap region

    dist1_norm = cv2.normalize(dist1, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
    dist1_colormap = cv2.applyColorMap(dist1_norm, cv2.COLORMAP_JET)

    return {
        "blended": blended,
        "mask1_b64": encode_img_to_base64((mask1 * 255).astype(np.uint8)),
        "mask2_b64": encode_img_to_base64((mask2 * 255).astype(np.uint8)),
        "overlap_vis_b64": encode_img_to_base64(overlap_vis),
        "distance_map_b64": encode_img_to_base64(dist1_colormap),
        "blended_b64": encode_img_to_base64(blended)
    }
