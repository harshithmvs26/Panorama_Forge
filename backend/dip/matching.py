import cv2
import numpy as np
from typing import Dict, Any, List, Tuple
from dip.preprocessing import encode_img_to_base64

def match_features_knn(
    kp1: List[cv2.KeyPoint],
    des1: np.ndarray,
    img1_color: np.ndarray,
    kp2: List[cv2.KeyPoint],
    des2: np.ndarray,
    img2_color: np.ndarray,
    ratio_threshold: float = 0.75
) -> Dict[str, Any]:
    """
    Performs KNN matching (k=2) using brute-force matcher with L2 distance,
    then applies Lowe's Ratio Test to reject ambiguous correspondences.
    """
    if des1 is None or des2 is None or len(des1) == 0 or len(des2) == 0:
        return {
            "raw_matches_count": 0,
            "good_matches_count": 0,
            "good_matches": [],
            "retention_rate": 0.0,
            "raw_vis_b64": "",
            "good_vis_b64": ""
        }

    # Brute-Force Matcher with L2 distance (suitable for float descriptors like SIFT)
    bf = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)
    matches = bf.knnMatch(des1, des2, k=2)

    good_matches = []
    raw_matches_draw = []

    for m_pair in matches:
        if len(m_pair) == 2:
            m, n = m_pair
            raw_matches_draw.append(m)
            # Lowe's Ratio Test condition
            if m.distance < ratio_threshold * n.distance:
                good_matches.append(m)
        elif len(m_pair) == 1:
            raw_matches_draw.append(m_pair[0])

    # Draw raw KNN matches (limit to max 200 for clean visualization if too dense)
    raw_sample = raw_matches_draw[:min(200, len(raw_matches_draw))]
    raw_vis = cv2.drawMatches(
        img1_color, kp1,
        img2_color, kp2,
        raw_sample, None,
        flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
    )

    # Draw good matches after Lowe's ratio test
    good_vis = cv2.drawMatches(
        img1_color, kp1,
        img2_color, kp2,
        good_matches, None,
        flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
    )

    retention_rate = (len(good_matches) / len(matches) * 100.0) if len(matches) > 0 else 0.0

    return {
        "raw_matches_count": len(matches),
        "good_matches_count": len(good_matches),
        "good_matches": good_matches,
        "ratio_threshold": ratio_threshold,
        "retention_rate": round(retention_rate, 2),
        "raw_vis_b64": encode_img_to_base64(raw_vis),
        "good_vis_b64": encode_img_to_base64(good_vis)
    }
