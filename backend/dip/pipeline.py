import time
import cv2
import numpy as np
from typing import List, Dict, Any

from dip.preprocessing import preprocess_image, encode_img_to_base64
from dip.features import extract_sift_features
from dip.matching import match_features_knn
from dip.homography import estimate_ransac_homography
from dip.warping import warp_perspective_pair
from dip.blending import weighted_distance_blend
from dip.cropping import crop_black_borders

def run_panorama_pipeline(
    images_bgr: List[np.ndarray],
    nfeatures: int = 2000,
    ratio_threshold: float = 0.75,
    ransac_threshold: float = 4.0,
    max_dimension: int = 1200
) -> Dict[str, Any]:
    """
    Executes complete classical DIP Panorama Stitching pipeline on 2 to 5 images.
    Returns step-by-step intermediate visualizations, exact timing per phase, and statistical analytics.
    """
    start_total_time = time.time()
    timing_breakdown = {}

    if len(images_bgr) < 2:
        raise ValueError("At least 2 overlapping images are required to generate a panorama.")
    if len(images_bgr) > 5:
        raise ValueError("Maximum 5 images are supported for processing.")

    # STAGE 1: Preprocessing
    t0 = time.time()
    preprocessed_list = []
    for idx, img in enumerate(images_bgr):
        p = preprocess_image(img, max_dimension=max_dimension)
        preprocessed_list.append(p)
    timing_breakdown["Preprocessing"] = round(time.time() - t0, 4)

    # STAGE 2: SIFT Feature Extraction
    t0 = time.time()
    sift_results = []
    for idx, p in enumerate(preprocessed_list):
        s = extract_sift_features(
            p["gray"],
            p["color"],
            nfeatures=nfeatures
        )
        sift_results.append(s)
    timing_breakdown["SIFT Features"] = round(time.time() - t0, 4)

    # Sequential Stitching Loop
    current_pano_color = preprocessed_list[0]["color"]
    current_pano_gray = preprocessed_list[0]["gray"]
    current_pano_kp = sift_results[0]["keypoints"]
    current_pano_des = sift_results[0]["descriptors"]

    matching_stages = []
    homography_stages = []
    warping_stages = []
    blending_stages = []

    knn_time = 0.0
    ransac_time = 0.0
    warp_time = 0.0
    blend_time = 0.0

    total_good_matches_sum = 0
    total_inliers_sum = 0

    for i in range(1, len(images_bgr)):
        next_color = preprocessed_list[i]["color"]
        next_gray = preprocessed_list[i]["gray"]
        next_kp = sift_results[i]["keypoints"]
        next_des = sift_results[i]["descriptors"]

        # STAGE 3 & 4: KNN Matching + Lowe Ratio Test
        t_m = time.time()
        match_res = match_features_knn(
            kp1=current_pano_kp,
            des1=current_pano_des,
            img1_color=current_pano_color,
            kp2=next_kp,
            des2=next_des,
            img2_color=next_color,
            ratio_threshold=ratio_threshold
        )
        knn_time += time.time() - t_m
        matching_stages.append(match_res)
        total_good_matches_sum += match_res["good_matches_count"]

        if match_res["good_matches_count"] < 4:
            raise ValueError(
                f"Insufficient matching feature points between Image 1..{i} and Image {i+1}. "
                f"Only {match_res['good_matches_count']} matches found after Ratio Test (threshold={ratio_threshold}). "
                "Ensure images have adequate overlap and visual texture, or adjust settings."
            )

        # STAGE 5 & 6: RANSAC Homography Estimation
        t_h = time.time()
        hom_res = estimate_ransac_homography(
            kp1=current_pano_kp,
            kp2=next_kp,
            good_matches=match_res["good_matches"],
            img1_color=current_pano_color,
            img2_color=next_color,
            ransac_reproj_threshold=ransac_threshold
        )
        ransac_time += time.time() - t_h
        homography_stages.append(hom_res)

        if not hom_res["success"]:
            raise ValueError(f"Homography estimation failed at step {i+1}: {hom_res.get('error')}")

        total_inliers_sum += hom_res["inliers_count"]

        # STAGE 7: Perspective Warping
        t_w = time.time()
        warp_res = warp_perspective_pair(
            img1=current_pano_color,
            img2=next_color,
            H=hom_res["raw_H"]
        )
        warp_time += time.time() - t_w
        warping_stages.append(warp_res)

        # STAGE 8: Distance Transform Blending
        t_b = time.time()
        blend_res = weighted_distance_blend(
            img1_warped=warp_res["img1_warped"],
            img2_warped=warp_res["img2_warped"]
        )
        blend_time += time.time() - t_b
        blending_stages.append(blend_res)

        # Update current accumulator panorama for sequential extension
        current_pano_color = blend_res["blended"]
        current_pano_gray = cv2.cvtColor(current_pano_color, cv2.COLOR_BGR2GRAY)

        # Re-detect keypoints on current accumulated panorama for next iteration if more images exist
        if i < len(images_bgr) - 1:
            s_acc = extract_sift_features(current_pano_gray, current_pano_color, nfeatures=nfeatures)
            current_pano_kp = s_acc["keypoints"]
            current_pano_des = s_acc["descriptors"]

    timing_breakdown["KNN Matching"] = round(knn_time, 4)
    timing_breakdown["RANSAC Homography"] = round(ransac_time, 4)
    timing_breakdown["Perspective Warping"] = round(warp_time, 4)
    timing_breakdown["Weighted Blending"] = round(blend_time, 4)

    # STAGE 9: Black Border Cropping
    t0 = time.time()
    crop_res = crop_black_borders(current_pano_color)
    timing_breakdown["Border Cropping"] = round(time.time() - t0, 4)

    total_runtime = round(time.time() - start_total_time, 4)
    timing_breakdown["Total Execution Time"] = total_runtime

    # Calculate Summary Statistics
    keypoints_per_img = [s["num_keypoints"] for s in sift_results]
    avg_keypoints = round(float(np.mean(keypoints_per_img)), 1)

    pano_w, pano_h = crop_res["after_dims"]
    aspect_ratio = round(pano_w / pano_h, 2) if pano_h > 0 else 0.0

    return {
        "success": True,
        "num_images": len(images_bgr),
        "input_stats": [
            {
                "index": idx + 1,
                "original_dims": p["original_dims"],
                "processed_dims": p["processed_dims"],
                "channels": p["channels"],
                "color_b64": p["color_b64"],
                "gray_b64": p["gray_b64"]
            }
            for idx, p in enumerate(preprocessed_list)
        ],
        "sift_stats": [
            {
                "index": idx + 1,
                "num_keypoints": s["num_keypoints"],
                "descriptor_shape": s["descriptor_shape"],
                "visualization_b64": s["visualization_b64"]
            }
            for idx, s in enumerate(sift_results)
        ],
        "avg_keypoints": avg_keypoints,
        "matching_stages": [
            {
                "step": idx + 1,
                "raw_matches_count": m["raw_matches_count"],
                "good_matches_count": m["good_matches_count"],
                "ratio_threshold": m["ratio_threshold"],
                "retention_rate": m["retention_rate"],
                "raw_vis_b64": m["raw_vis_b64"],
                "good_vis_b64": m["good_vis_b64"]
            }
            for idx, m in enumerate(matching_stages)
        ],
        "homography_stages": [
            {
                "step": idx + 1,
                "inliers_count": h["inliers_count"],
                "outliers_count": h["outliers_count"],
                "inlier_ratio": h["inlier_ratio"],
                "ransac_threshold": h["ransac_threshold"],
                "matrix": h["homography_matrix"],
                "ransac_vis_b64": h["ransac_vis_b64"]
            }
            for idx, h in enumerate(homography_stages)
        ],
        "warping_stages": [
            {
                "step": idx + 1,
                "canvas_size": w["canvas_size"],
                "translation_offset": w["translation_offset"],
                "warped_vis_b64": w["warped_vis_b64"],
                "ref_placed_b64": w["ref_placed_b64"]
            }
            for idx, w in enumerate(warping_stages)
        ],
        "blending_stages": [
            {
                "step": idx + 1,
                "mask1_b64": b["mask1_b64"],
                "mask2_b64": b["mask2_b64"],
                "overlap_vis_b64": b["overlap_vis_b64"],
                "distance_map_b64": b["distance_map_b64"],
                "blended_b64": b["blended_b64"]
            }
            for idx, b in enumerate(blending_stages)
        ],
        "cropping_result": {
            "before_dims": crop_res["before_dims"],
            "after_dims": crop_res["after_dims"],
            "cropped_b64": crop_res["cropped_b64"],
            "crop_vis_b64": crop_res["crop_vis_b64"]
        },
        "final_panorama_b64": crop_res["cropped_b64"],
        "statistics": {
            "num_images": len(images_bgr),
            "keypoints_per_img": keypoints_per_img,
            "avg_keypoints": avg_keypoints,
            "total_good_matches": total_good_matches_sum,
            "total_inliers": total_inliers_sum,
            "overall_inlier_ratio": round((total_inliers_sum / total_good_matches_sum * 100.0), 2) if total_good_matches_sum > 0 else 0.0,
            "panorama_width": pano_w,
            "panorama_height": pano_h,
            "aspect_ratio": aspect_ratio,
            "total_processing_time": total_runtime,
            "timing_breakdown": timing_breakdown
        }
    }
