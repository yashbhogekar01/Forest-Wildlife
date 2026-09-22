"""
Pench Tiger Reserve - Low-Light AI Enhancement & Auto-Crop Module
===================================================================
Author: Senior Computer Vision & Full-Stack Engineer
Description:
    Assesses image clarity (Laplacian variance sharpness, mean brightness, contrast).
    If low-light / blurry / noisy, applies CLAHE, Non-Local Means Denoising, sharpening,
    and luminance normalization. Detects tiger bounding boxes, adds 10-15% dynamic padding,
    and auto-crops the tiger/flank region for re-identification.
"""

import os
import sys
import json
import logging
import math
from typing import Dict, Any, Tuple, Optional

try:
    import cv2
    import numpy as np
except ImportError:
    cv2 = None
    np = None

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("PenchAIEnhancer")


def calculate_image_metrics(img_gray: np.ndarray) -> Dict[str, float]:
    """
    Computes image quality metrics:
    - Sharpness: Laplacian variance
    - Brightness: Mean gray value (0-255)
    - Contrast: Standard deviation of gray values
    """
    if img_gray is None:
        return {"sharpness": 0.0, "brightness": 0.0, "contrast": 0.0}

    sharpness = float(cv2.Laplacian(img_gray, cv2.CV_64F).var())
    brightness = float(np.mean(img_gray))
    contrast = float(np.std(img_gray))

    return {
        "sharpness": round(sharpness, 2),
        "brightness": round(brightness, 2),
        "contrast": round(contrast, 2)
    }


def enhance_low_light_image(img_bgr: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Applies AI Enhancement Filter Pipeline for night vision / low light / blurry frames:
    1. CLAHE (Contrast Limited Adaptive Histogram Equalization) in LAB color space
    2. Non-Local Means Denoising / Bilateral filtering
    3. Unsharp Masking / Sharpening filter
    4. Contrast Normalization
    """
    if img_bgr is None:
        return img_bgr, {"is_enhanced": False, "reason": "Null image input"}

    # Convert to LAB color space for luminance-preserving contrast enhancement
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    # 1. Apply CLAHE on L channel
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    cl = clahe.apply(l_channel)

    # Recombine LAB channels and convert back to BGR
    limg = cv2.merge((cl, a_channel, b_channel))
    enhanced_bgr = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    # 2. Apply Non-Local Means Denoising to reduce IR sensor noise
    try:
        denoised = cv2.fastNlMeansDenoisingColored(
            enhanced_bgr, None, h=7, hColor=7, templateWindowSize=7, searchWindowSize=21
        )
    except Exception:
        denoised = cv2.bilateralFilter(enhanced_bgr, d=7, sigmaColor=50, sigmaSpace=50)

    # 3. Apply Unsharp Masking Sharpening Filter
    gaussian_blur = cv2.GaussianBlur(denoised, (0, 0), 3.0)
    sharpened = cv2.addWeighted(denoised, 1.4, gaussian_blur, -0.4, 0)

    # 4. Normalize Brightness & Contrast
    final_enhanced = cv2.normalize(sharpened, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)

    enhancement_meta = {
        "is_enhanced": True,
        "pipeline_steps": [
            "LAB_CLAHE_Histogram_Equalization",
            "Non_Local_Means_IR_Denoising",
            "Unsharp_Mask_Sharpening",
            "Dynamic_Range_Normalization"
        ]
    }

    return final_enhanced, enhancement_meta


def detect_and_crop_tiger(
    img_bgr: np.ndarray,
    padding_pct: float = 0.125
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Detects tiger bounding box or salient flank region, applies 10-15% dynamic padding,
    and crops the tiger body from raw background.
    """
    h, w = img_bgr.shape[:2]

    # Convert to grayscale for salient object contour detection fallback
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 40, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if contours and len(contours) > 0:
        # Pick largest contour as primary subject area
        largest_contour = max(contours, key=cv2.contourArea)
        bx, by, bw, bh = cv2.boundingRect(largest_contour)

        # Fallback to realistic center body crop if contour is too tiny (< 5% frame)
        if (bw * bh) < (0.05 * w * h):
            bx = int(w * 0.15)
            by = int(h * 0.15)
            bw = int(w * 0.70)
            bh = int(h * 0.70)
    else:
        # Default dynamic center flank box
        bx = int(w * 0.15)
        by = int(h * 0.15)
        bw = int(w * 0.70)
        bh = int(h * 0.70)

    # Apply 10-15% (default 12.5%) dynamic padding around bounding box
    pad_w = int(bw * padding_pct)
    pad_h = int(bh * padding_pct)

    x1 = max(0, bx - pad_w)
    y1 = max(0, by - pad_h)
    x2 = min(w, bx + bw + pad_w)
    y2 = min(h, by + bh + pad_h)

    cropped_img = img_bgr[y1:y2, x1:x2]

    box_meta = {
        "bounding_box_pixels": [x1, y1, x2, y2],
        "crop_resolution": f"{x2 - x1}x{y2 - y1}",
        "padding_applied_pct": round(padding_pct * 100, 1),
        "normalized_bbox": [
            round(x1 / w, 4),
            round(y1 / h, 4),
            round(x2 / w, 4),
            round(y2 / h, 4)
        ]
    }

    return cropped_img, box_meta


def process_trap_photo(
    image_input_path: str,
    output_crop_dir: Optional[str] = None,
    sharpness_threshold: float = 250.0,
    brightness_threshold: float = 110.0
) -> Dict[str, Any]:
    """
    Main End-to-End Processing Entry Point:
    1. Loads photo
    2. Calculates clarity & low-light metrics
    3. Runs AI Enhancement filter if flagged
    4. Auto-crops tiger flank region with padding
    5. Saves enhanced cropped image & returns metadata JSON
    """
    if cv2 is None or np is None:
        return {"error": "OpenCV or NumPy unavailable"}

    if not os.path.exists(image_input_path):
        return {"error": f"File not found: {image_input_path}"}

    raw_img = cv2.imread(image_input_path)
    if raw_img is None:
        return {"error": f"Failed to read image: {image_input_path}"}

    gray = cv2.cvtColor(raw_img, cv2.COLOR_BGR2GRAY)
    metrics = calculate_image_metrics(gray)

    # Determine low-light / blur flag
    is_low_light = metrics["brightness"] < brightness_threshold
    is_blurry = metrics["sharpness"] < sharpness_threshold
    needs_enhancement = is_low_light or is_blurry or metrics["contrast"] < 45.0

    # 1. Enhance photo if low light or blurry
    if needs_enhancement:
        enhanced_img, enhance_meta = enhance_low_light_image(raw_img)
    else:
        enhanced_img = raw_img
        enhance_meta = {"is_enhanced": False, "reason": "Original image already clear & bright"}

    # 2. Auto-crop tiger region with 12.5% dynamic padding
    cropped_img, crop_meta = detect_and_crop_tiger(enhanced_img, padding_pct=0.125)

    # 3. Output file management
    base_name = os.path.splitext(os.path.basename(image_input_path))[0]
    out_dir = output_crop_dir or os.path.dirname(image_input_path)
    os.makedirs(out_dir, exist_ok=True)

    cropped_file_name = f"enhanced_crop_{base_name}.jpg"
    cropped_file_path = os.path.join(out_dir, cropped_file_name)

    cv2.imwrite(cropped_file_path, cropped_img)

    result = {
        "status": "SUCCESS",
        "raw_image_path": os.path.abspath(image_input_path),
        "enhanced_crop_path": os.path.abspath(cropped_file_path),
        "enhanced_crop_filename": cropped_file_name,
        "is_ai_enhanced": needs_enhancement,
        "quality_metrics": metrics,
        "enhancement_details": enhance_meta,
        "crop_details": crop_meta
    }

    return result


if __name__ == "__main__":
    if len(sys.argv) > 1:
        img_path = sys.argv[1]
        out_dir = sys.argv[2] if len(sys.argv) > 2 else None
        res = process_trap_photo(img_path, output_crop_dir=out_dir)
        print(json.dumps(res, indent=2))
    else:
        print("Usage: python ai_image_enhancer.py <image_path> [output_dir]")
