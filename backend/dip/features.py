import cv2
import numpy as np
from typing import Dict, Any, List, Tuple
from dip.preprocessing import encode_img_to_base64

def extract_sift_features(
    img_gray: np.ndarray,
    img_color: np.ndarray,
    nfeatures: int = 2000,
    contrastThreshold: float = 0.04,
    edgeThreshold: float = 10.0,
    sigma: float = 1.6
) -> Dict[str, Any]:
    """
    Detects keypoints and calculates 128-dimensional SIFT descriptors.
    Also produces a visual output with keypoints drawn as scale/orientation vectors.
    """
    sift = cv2.SIFT_create(
        nfeatures=nfeatures,
        contrastThreshold=contrastThreshold,
        edgeThreshold=edgeThreshold,
        sigma=sigma
    )

    keypoints, descriptors = sift.detectAndCompute(img_gray, None)

    if keypoints is None or len(keypoints) == 0:
        keypoints = []
        descriptors = np.array([])

    # Visualize keypoints with scale and orientation flags
    vis_img = cv2.drawKeypoints(
        img_color,
        keypoints,
        None,
        flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
    )

    vis_b64 = encode_img_to_base64(vis_img)

    return {
        "keypoints": keypoints,
        "descriptors": descriptors,
        "num_keypoints": len(keypoints),
        "descriptor_shape": list(descriptors.shape) if descriptors.ndim > 1 else [0, 0],
        "visualization_b64": vis_b64
    }
