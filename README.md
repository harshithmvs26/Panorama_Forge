# PanoramaForge 🌌
### Web-Based Automatic Panorama Generation Using Classical Digital Image Processing (DIP)

PanoramaForge is a full-stack Digital Image Processing (DIP) web application designed to automatically stitch multiple overlapping photographs into a seamless, high-resolution panoramic image. Unlike generic wrappers, PanoramaForge explicitly exposes every classical computer vision operation—from Scale-Invariant Feature Transform (SIFT) keypoint detection to Euclidean Distance Transform weighted mask blending—providing interactive visual stage breakdowns, performance analytics dashboards, 30+ Viva Voce study materials, and complete academic project reports.

---

## 🌟 Key Features

1. **Explicit Classical DIP Pipeline (No Black-Box APIs)**:
   - Does **NOT** use `cv2.Stitcher_create()`. Every stage is explicitly implemented and visualized.
   - SIFT Feature Extraction (`cv2.SIFT_create`).
   - Brute-Force KNN Feature Matching ($k=2$).
   - Lowe's Ratio Test filtering ($\le 0.75$).
   - RANSAC geometric outlier rejection ($\le 4.0\text{px}$ reprojection error).
   - $3 \times 3$ Homography matrix estimation ($H$).
   - Perspective warping with negative coordinate translation mapping.
   - Weighted Distance Transform feather blending.
   - Contour bounding-box black border removal.

2. **Flexible Image Input Methods**:
   - **Local File Upload**: Drag-and-drop 2 to 5 overlapping JPG/PNG photos with reordering controls.
   - **Public Image URL**: Fetch public image URLs with size & content validation.
   - **Sample Image Gallery**: Instant 1-click execution on bundled test sets (`Campus`, `Building`, `Landscape`, `Road`).

3. **Interactive 10-Tab Pipeline Visualizer**:
   - Tab 1: Input Images & Dimension Metadata
   - Tab 2: Image Preprocessing (Color vs Grayscale)
   - Tab 3: SIFT Keypoints Visualizer (Scale & orientation vectors)
   - Tab 4: KNN Feature Matching vs Lowe's Ratio Test Filtered Matches
   - Tab 5: RANSAC Geometric Inliers (Green) vs Outliers (Red)
   - Tab 6: $3 \times 3$ Homography Matrix Breakdown & Perspective Equations
   - Tab 7: Perspective Warping & Translated Canvas Alignment
   - Tab 8: Euclidean Distance Transform Weight Map & Overlap Regions
   - Tab 9: Final Panorama with Interactive Before/After Cropping Comparison Slider & HD Download
   - Tab 10: Quantitative Performance Analytics & Execution Runtime Breakdown

4. **Academic Viva & Project Evaluation Assets**:
   - **Viva Voce Q&A Modal**: 30 comprehensive questions and answers with instant search.
   - **Complete Academic Project Report**: Title, abstract, mathematical formulations, problem statement, and downloadable TXT report.
   - **15-Slide Presentation Deck**: Interactive slide viewer for college project viva presentations.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              React.js + Vite Web Frontend               │
│    (Interactive Input, 10 DIP Stage Tabs, Stats UI)    │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP REST API (Axios / JSON)
┌────────────────────────────▼────────────────────────────┐
│                Python FastAPI Server                    │
│    (Request Validation, URL Downloader, CORS, Uploads)  │
└────────────────────────────┬────────────────────────────┘
                             │ Modular Function Calls
┌────────────────────────────▼────────────────────────────┐
│            DIP Processing Pipeline Engine               │
│  ├── preprocessing.py (Grayscale Conversion)            │
│  ├── features.py      (SIFT 128D Descriptors)          │
│  ├── matching.py      (KNN k=2 + Lowe's Ratio Test)     │
│  ├── homography.py    (RANSAC Inliers & 3x3 Matrix H)   │
│  ├── warping.py       (cv2.warpPerspective + Canvas)   │
│  ├── blending.py      (Distance Transform Weight Map)   │
│  └── cropping.py      (Bounding Box Border Removal)     │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Setup & Running Instructions (Windows)

### Step 1: Backend Setup (Python + FastAPI)

1. Open Windows Command Prompt (`cmd`) or PowerShell and navigate to the backend directory:
   ```cmd
   cd PanoramaForge\backend
   ```
2. Create and activate a Python virtual environment:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install required Python packages:
   ```cmd
   pip install -r requirements.txt
   ```
4. Start the FastAPI Uvicorn server:
   ```cmd
   uvicorn main:app --reload --port 8000
   ```
   *The backend will be online at `http://localhost:8000` (API docs available at `http://localhost:8000/docs`).*

---

### Step 2: Frontend Setup (React + Vite)

1. Open a new Command Prompt or Terminal tab and navigate to the frontend folder:
   ```cmd
   cd PanoramaForge\frontend
   ```
2. Install Node.js dependencies:
   ```cmd
   npm install
   ```
3. Start the Vite development server:
   ```cmd
   npm run dev
   ```
   *The website will automatically open in your default web browser at `http://localhost:3000`.*

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check returns service status & OpenCV/NumPy versions |
| `GET` | `/api/samples` | List available sample image categories and image thumbnail paths |
| `POST` | `/api/stitch` | Accepts multipart form upload of 2–5 images & DIP parameters |
| `POST` | `/api/stitch/url` | Downloads 2–5 public image URLs and executes pipeline |
| `POST` | `/api/stitch/sample` | Runs pipeline on pre-loaded sample photo set (`campus`, `building`, etc.) |

---

## 📖 Digital Image Processing Pipeline Formulas

- **SIFT Difference-of-Gaussians**:
  $$D(x, y, \sigma) = (G(x, y, k\sigma) - G(x, y, \sigma)) * I(x, y)$$

- **Lowe's Ratio Test**:
  $$\text{dist}(m_1) < \text{ratio\_thresh} \times \text{dist}(m_2) \quad (\text{ratio\_thresh} = 0.75)$$

- **Homography Matrix Transformation**:
  $$\begin{bmatrix} x' \\ y' \\ w' \end{bmatrix} = \begin{bmatrix} h_{11} & h_{12} & h_{13} \\ h_{21} & h_{22} & h_{23} \\ h_{31} & h_{32} & h_{33} \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}, \quad X' = \frac{x'}{w'}, \, Y' = \frac{y'}{w'}$$

- **Weighted Mask Blending**:
  $$I_{\text{blended}} = \alpha \cdot I_1 + (1 - \alpha) \cdot I_2, \quad \alpha = \frac{\text{dist}_1}{\text{dist}_1 + \text{dist}_2 + \varepsilon}$$

---

## 🎓 Academic Viva Guidance & Questions

PanoramaForge includes an interactive modal with 30 viva voce questions and answers covering:
- Why Grayscale is used for SIFT while RGB is retained for final output.
- Difference between Homography (matrix $H$) and Warping (`cv2.warpPerspective`).
- Why at least 4 point correspondences are required for Homography.
- How Lowe's ratio test eliminates ambiguous background features.
- Why RANSAC is necessary to remove geometrically inconsistent outliers.

---

## 🛠️ Troubleshooting

- **Homography estimation failed**: Ensure images have at least 30% visual overlap and sufficient texture (avoid plain sky/walls).
- **CORS or Connection Error**: Verify FastAPI server is running on port 8000 (`http://localhost:8000/api/health`).
