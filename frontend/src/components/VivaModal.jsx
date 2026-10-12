import React, { useState } from 'react';
import { X, Search, HelpCircle, BookOpen, CheckCircle } from 'lucide-react';

export default function VivaModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const vivaQuestions = [
    {
      q: "1. What is Digital Image Processing (DIP)?",
      a: "Digital Image Processing involves applying computer algorithms to digital images to enhance their visual quality, extract meaningful information, or transform their spatial geometry."
    },
    {
      q: "2. What is image stitching and what is a panorama?",
      a: "Image stitching is the computer vision process of combining multiple overlapping photographs into a single wide field-of-view composite image called a panorama."
    },
    {
      q: "3. Why is image preprocessing necessary in this pipeline?",
      a: "Preprocessing validates image formats, resizes oversized inputs for computational stability, and converts RGB images into single-channel grayscale images for SIFT gradient calculation."
    },
    {
      q: "4. What is SIFT (Scale-Invariant Feature Transform)?",
      a: "SIFT is a classical computer vision algorithm designed by David Lowe that detects distinctive interest keypoints and extracts 128-dimensional feature descriptors invariant to scale, rotation, and illumination changes."
    },
    {
      q: "5. What is a keypoint in SIFT?",
      a: "A keypoint is a spatial point $(x, y)$ in scale space identified as a local extremum in the Difference-of-Gaussians (DoG) scale pyramid."
    },
    {
      q: "6. What is a SIFT feature descriptor?",
      a: "A 128-element numerical vector computed from 16 gradient orientation histograms (4x4 spatial sub-regions with 8 orientation bins each) surrounding the keypoint."
    },
    {
      q: "7. Why is SIFT invariant to scale and rotation?",
      a: "Scale invariance is achieved using Difference-of-Gaussians scale pyramids, while rotation invariance is guaranteed by aligning local image gradient orientations relative to the keypoint's dominant orientation angle."
    },
    {
      q: "8. What is KNN (k-Nearest Neighbors) feature matching?",
      a: "KNN feature matching computes Euclidean L2 distance between 128D descriptors across two images to find the $k$ closest candidate correspondences (here $k=2$)."
    },
    {
      q: "9. Why is $k=2$ used in KNN matching?",
      a: "Finding 2 nearest neighbors ($m$ and $n$) allows evaluating whether the best match ($m$) is significantly closer than the second-best match ($n$), filtering out ambiguous background descriptors."
    },
    {
      q: "10. What is Lowe's Ratio Test?",
      a: "Lowe's Ratio Test retains a match $m$ only if $dist(m) < ratio \\times dist(n)$ (where $ratio = 0.75$). This eliminates false positive matches from repetitive textures."
    },
    {
      q: "11. What is RANSAC (Random Sample Consensus)?",
      a: "RANSAC is an iterative non-deterministic algorithm that estimates mathematical model parameters (Homography matrix $H$) from data containing a high proportion of gross outlier matches."
    },
    {
      q: "12. What are inliers and outliers in RANSAC?",
      a: "Inliers are keypoint matches whose reprojection error falls within the specified threshold under the estimated model; outliers are bad correspondences caused by noise or moving objects."
    },
    {
      q: "13. What is a Homography matrix?",
      a: "A $3 \\times 3$ transformation matrix $H$ with 8 independent degrees of freedom representing a linear perspective mapping between two 2D planar projections."
    },
    {
      q: "14. Why is the Homography matrix $3 \\times 3$ with 8 degrees of freedom?",
      a: "In homogeneous coordinates, $H$ has 9 parameters, but it is defined up to an arbitrary scale factor $h_{33} = 1$, leaving 8 independent parameters."
    },
    {
      q: "15. Why are at least four point correspondences required for Homography?",
      a: "Each point correspondence $(x, y) \\leftrightarrow (x', y')$ yields 2 linear equations. Since $H$ has 8 unknown parameters, minimum $8 / 2 = 4$ non-collinear point pairs are required."
    },
    {
      q: "16. What is perspective transformation?",
      a: "A geometric transformation that maps straight lines to straight lines while altering parallel angles, projecting an image plane onto another camera view angle."
    },
    {
      q: "17. What is the difference between Homography and Warping?",
      a: "Homography is the mathematical $3 \\times 3$ matrix representing geometric mapping; Warping is the pixel-level resampling operation (<code class='text-sky-400 font-mono'>cv2.warpPerspective</code>) applying that transformation."
    },
    {
      q: "18. What is weighted mask blending?",
      a: "A blending technique that uses spatial weight maps (e.g. Euclidean distance transform) to smoothly transition pixel intensity values in overlapping regions and eliminate visible seams."
    },
    {
      q: "19. Why use distance-transform-based blending?",
      a: "Distance transform maps give higher weight to pixels near the center of an image and zero weight at boundaries, creating a smooth linear ramp in the overlap zone."
    },
    {
      q: "20. Why is black border removal / cropping necessary?",
      a: "Perspective warping rotates and skews the image frame on a larger canvas, leaving unexposed black ($0,0,0$) border regions that must be cropped for a clean panorama."
    },
    {
      q: "21. What is parallax and how does it affect panoramas?",
      a: "Parallax is the apparent displacement of objects relative to background when viewed from different positions. Strong parallax causes ghosting double-images if the camera position moves significantly."
    },
    {
      q: "22. When does planar Homography work best?",
      a: "Homography works best when either: (a) the scene is approximately flat/planar, or (b) camera movement is purely rotational around its optical center."
    },
    {
      q: "23. Why did we NOT use <code class='text-sky-400 font-mono'>cv2.Stitcher_create()</code> as the main stitching engine?",
      a: "Because high-level API functions hide the internal algorithmic steps. The purpose of a college DIP project is to explicitly implement and visualize SIFT, KNN, RANSAC, Homography, Warping, and Blending."
    },
    {
      q: "24. Why keep RGB color for final output while using Grayscale for SIFT?",
      a: "SIFT operates on spatial intensity gradients where color channels add unnecessary computation; however, RGB color must be preserved for rich final visual rendering."
    },
    {
      q: "25. What happens if there are fewer than 4 good feature matches?",
      a: "Homography estimation fails, and the system raises a clear user-facing error message prompting for images with higher overlap or lower ratio-test threshold."
    },
    {
      q: "26. How are negative canvas coordinates handled during warping?",
      a: "By calculating bounding box minima $(x_{min}, y_{min})$ of warped corners and creating a translation matrix $T$ that shifts negative coordinates into positive canvas space."
    },
    {
      q: "27. What statistics does PanoramaForge calculate during processing?",
      a: "Keypoint count per image, KNN raw matches, Lowe ratio retained matches, RANSAC inlier ratio, 3x3 Homography matrix elements, aspect ratio, canvas dimensions, and timing per DIP phase."
    },
    {
      q: "28. How does multi-image sequential stitching work?",
      a: "Images are stitched pair-by-pair: $img_1 + img_2 \\rightarrow pano_1$, then $pano_1 + img_3 \\rightarrow pano_2$, up to 5 images sequentially."
    },
    {
      q: "29. What are the limitations of this classical DIP pipeline?",
      a: "Accumulation of drift error in sequential stitching, sensitivity to low texture (e.g. blue sky), moving objects (causing ghosting), and extreme exposure variation."
    },
    {
      q: "30. What future enhancements could improve this system?",
      a: "Automatic image matching graph ordering, cylindrical/spherical projection to prevent stretching, multi-band Laplacian pyramid blending, and exposure compensation."
    }
  ];

  const filtered = vivaQuestions.filter(
    item => item.q.toLowerCase().includes(searchTerm.toLowerCase()) || item.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-4xl max-h-[85vh] rounded-2xl p-6 border border-slate-700/80 shadow-2xl flex flex-col space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">DIP Viva Voice Examination Questions & Answers (30 Q&A)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-shrink-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search viva questions or keywords (e.g. SIFT, RANSAC, Homography, Blending)..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none"
          />
        </div>

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filtered.map((item, idx) => (
            <div key={idx} className="glass-card rounded-xl p-4 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-indigo-300 flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>{item.q}</span>
              </div>
              <p
                className="text-xs text-slate-300 pl-6 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.a }}
              />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-xs text-slate-500 text-center py-8">No matching viva questions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
