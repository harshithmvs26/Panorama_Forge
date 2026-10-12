import cv2
import numpy as np
from typing import Dict, Any, List, Tuple
from dip.preprocessing import encode_img_to_base64

def estimate_ransac_homography(
    kp1: List[cv2.KeyPoint],
    kp2: List[cv2.KeyPoint],
    good_matches: List[cv2.DMatch],
    img1_color: np.ndarray,
    img2_color: np.ndarray,
    ransac_reproj_threshold: float = 4.0
) -> Dict[str, Any]:
    """
    Estimates 3x3 Homography matrix using RANSAC algorithm.
    Filters out outlier feature matches and retains robust geometrically aligned inliers.
    """
    if len(good_matches) < 4:
        return {
            "success": False,
            "error": f"Insufficient matches for Homography. Found {len(good_matches)}, minimum required is 4.",
            "inliers_count": 0,
            "outliers_count": len(good_matches),
            "inlier_ratio": 0.0,
            "homography_matrix": None,
            "ransac_vis_b64": ""
        }

    # Extract coordinates from keypoints corresponding to good matches
    # src_pts: points in image 2 (to be warped)
    # dst_pts: points in image 1 (reference image canvas)
    src_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)

    # Compute Homography matrix H using RANSAC
    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, ransac_reproj_threshold)

    if H is None:
        return {
            "success": False,
            "error": "RANSAC failed to estimate a valid Homography matrix.",
            "inliers_count": 0,
            "outliers_count": len(good_matches),
            "inlier_ratio": 0.0,
            "homography_matrix": None,
            "ransac_vis_b64": ""
        }

    inliers_mask = mask.ravel().tolist()
    inliers_count = int(np.sum(inliers_mask))
    outliers_count = len(good_matches) - inliers_count
    inlier_ratio = (inliers_count / len(good_matches) * 100.0) if len(good_matches) > 0 else 0.0

    # Draw RANSAC visualization: Inliers (Green) vs Outliers (Red)
    inlier_matches = [m for idx, m in enumerate(good_matches) if inliers_mask[idx] == 1]
    outlier_matches = [m for idx, m in enumerate(good_matches) if inliers_mask[idx] == 0]

    # Create visualization canvas
    h1, w1 = img1_color.shape[:2]
    h2, w2 = img2_color.shape[:2]
    vis = np.zeros((max(h1, h2), w1 + w2, 3), dtype=np.uint8)
    vis[:h1, :w1] = img1_color
    vis[:h2, w1:w1+w2] = img2_color

    # Draw outliers in red
    for m in outlier_matches:
        pt1 = (int(kp1[m.queryIdx].pt[0]), int(kp1[m.queryIdx].pt[1]))
        pt2 = (int(kp2[m.trainIdx].pt[0]) + w1, int(kp2[m.trainIdx].pt[1]))
        cv2.line(vis, pt1, pt2, (0, 0, 255), 1, cv2.LINE_AA)

    # Draw inliers in green
    for m in inlier_matches:
        pt1 = (int(kp1[m.queryIdx].pt[0]), int(kp1[m.queryIdx].pt[1]))
        pt2 = (int(kp2[m.trainIdx].pt[0]) + w1, int(kp2[m.trainIdx].pt[1]))
        cv2.line(vis, pt1, pt2, (0, 255, 0), 1, cv2.LINE_AA)
        cv2.circle(vis, pt1, 4, (0, 255, 255), 1)
        cv2.circle(vis, pt2, 4, (0, 255, 255), 1)

    # Convert 3x3 matrix to standard list of lists format for JSON response
    H_list = [[round(float(val), 6) for val in row] for row in H]

    return {
        "success": True,
        "error": None,
        "inliers_count": inliers_count,
        "outliers_count": outliers_count,
        "inlier_ratio": round(inlier_ratio, 2),
        "ransac_threshold": ransac_reproj_threshold,
        "homography_matrix": H_list,
        "raw_H": H,
        "ransac_vis_b64": encode_img_to_base64(vis)
    }
