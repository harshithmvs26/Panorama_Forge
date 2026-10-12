import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Presentation, Monitor } from 'lucide-react';

export default function PresentationModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "Slide 1: Title & Project Identification",
      content: (
        <div className="space-y-4 text-center py-6">
          <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-mono font-bold">DIGITAL IMAGE PROCESSING PROJECT</span>
          <h2 className="text-2xl font-extrabold text-white">PanoramaForge</h2>
          <p className="text-sm text-slate-300">Web-Based Automatic Panorama Generation Using SIFT, KNN, RANSAC, Homography & Weighted Blending</p>
          <div className="pt-4 text-xs text-slate-400">
            Presented by: Student DIP Team • Computer Science & Engineering
          </div>
        </div>
      )
    },
    {
      title: "Slide 2: Problem Statement",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">Limited Camera Field-of-View (FOV)</h4>
          <ul className="list-disc pl-5 space-y-2 leading-relaxed">
            <li>Standard consumer cameras capture constrained spatial view angles.</li>
            <li>Capturing wide landscapes or architectural structures requires multiple overlapping photos.</li>
            <li>Manual stitching results in geometric misalignments, exposure boundary lines, and visible seams.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Slide 3: Motivation & Academic Objective",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">Why Classical DIP over AI Black-Boxes?</h4>
          <ul className="list-disc pl-5 space-y-2 leading-relaxed">
            <li>Explicit academic implementation of mathematical computer vision operations.</li>
            <li>No high-level <code className="text-sky-300">cv2.Stitcher_create()</code> hiding internal mechanics.</li>
            <li>Interactive visualization of every step: keypoint gradients, ratio test, RANSAC inliers, and distance weight maps.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Slide 4: System Architecture",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">Full-Stack Client-Server Design</h4>
          <div className="bg-slate-900 p-4 rounded-xl font-mono text-[11px] text-sky-300 border border-slate-800 text-center space-y-2">
            <div>React.js + Vite Frontend (Interactive Web UI)</div>
            <div>&darr; HTTP REST API Requests (Multipart Upload / JSON)</div>
            <div>FastAPI Python Backend (Uvicorn Server)</div>
            <div>&darr; Modular DIP Processing Engine</div>
            <div>OpenCV + NumPy Mathematical Matrix Operations</div>
          </div>
        </div>
      )
    },
    {
      title: "Slide 5: DIP Pipeline Overview",
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">10-Step Sequential Algorithmic Pipeline</h4>
          <ol className="list-decimal pl-5 space-y-1 text-[11px] leading-relaxed">
            <li>Validation & Preprocessing (Grayscale conversion)</li>
            <li>SIFT Feature Detection & 128D Descriptors</li>
            <li>Brute-Force KNN Matching (k=2)</li>
            <li>Lowe's Ratio Test Filtering (Threshold 0.75)</li>
            <li>RANSAC Outlier Rejection (Threshold 4.0px)</li>
            <li>3x3 Homography Matrix Estimation (SVD)</li>
            <li>Perspective Warping & Canvas Translation</li>
            <li>Euclidean Distance Transform Mask Blending</li>
            <li>Bounding Rectangle Black Border Cropping</li>
            <li>Analytics & Processing Time Calculation</li>
          </ol>
        </div>
      )
    },
    {
      title: "Slide 6: SIFT Feature Extraction",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">Scale-Space Extremum Detection</h4>
          <p>Difference-of-Gaussians (DoG) scale-space octave pyramid:</p>
          <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-purple-300 border border-slate-800">
            D(x, y, &sigma;) = (G(x, y, k&sigma;) - G(x, y, &sigma;)) * I(x, y)
          </div>
          <p>Produces 128-dimensional numerical feature vectors invariant to scale, orientation, and lighting.</p>
        </div>
      )
    },
    {
      title: "Slide 7: KNN & Lowe's Ratio Test",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">Ambiguity Filtering</h4>
          <p>Compares nearest descriptor distance $m$ against second-nearest neighbor $n$:</p>
          <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-emerald-300 border border-slate-800">
            distance(m) &lt; 0.75 &times; distance(n)
          </div>
          <p>Rejects false correspondences caused by repetitive background textures (e.g. grass, sky).</p>
        </div>
      )
    },
    {
      title: "Slide 8: RANSAC Outlier Rejection",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">Robust Geometric Fitting</h4>
          <p>Iteratively samples 4 point pairs to separate valid geometrical inliers from outlier noise.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Inliers rendered in <strong className="text-emerald-400">Green</strong>.</li>
            <li>Outliers rendered in <strong className="text-rose-400">Red</strong>.</li>
            <li>Inlier ratio typically achieves 80% to 90% accuracy.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Slide 9: 3x3 Homography Matrix",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">2D Planar Projection Mapping</h4>
          <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-sky-300 border border-slate-800 text-center">
            [x', y', w']^T = H &times; [x, y, 1]^T
          </div>
          <p>Maps spatial pixel locations across views using 8 independent degrees of freedom calculated via Singular Value Decomposition (SVD).</p>
        </div>
      )
    },
    {
      title: "Slide 10: Perspective Warping & Canvas Mapping",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">Offset Translation Compensation</h4>
          <p>Calculates bounding box minima $[x_{min}, y_{min}]$ to handle negative warped coordinates without clipping.</p>
          <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-indigo-300 border border-slate-800">
            H_composite = T_translation &times; H_homography
          </div>
        </div>
      )
    },
    {
      title: "Slide 11: Distance Transform Feather Blending",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">Seamless Overlap Transition</h4>
          <p>Euclidean distance transform computes distance to boundary edges, generating smooth linear weight ramps:</p>
          <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-emerald-300 border border-slate-800">
            I_blended = &alpha; &times; I_1 + (1 - &alpha;) &times; I_2
          </div>
        </div>
      )
    },
    {
      title: "Slide 12: Website Features & UI",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">Modern Full-Stack Experience</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>3 Input Modes: Local Upload, Public Image URL, and Built-In Sample Gallery.</li>
            <li>10 Pipeline Stage Visual Tabs with side-by-side images.</li>
            <li>Interactive Before/After Cropping Comparison Slider.</li>
            <li>Advanced Settings Modal for tuning SIFT, Lowe Ratio, and RANSAC thresholds.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Slide 13: Statistical Performance Results",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">Experimental Metrics</h4>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-lg font-bold text-sky-400">~1.5s - 2.5s</div>
              <div className="text-[10px] text-slate-400">Processing Time</div>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-lg font-bold text-emerald-400">85% - 90%</div>
              <div className="text-[10px] text-slate-400">RANSAC Inliers</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Slide 14: Limitations & Future Enhancements",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <h4 className="text-sm font-bold text-sky-400">System Limitations & Scope</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Parallax sensitivity during significant translational camera movement.</li>
            <li>Future Scope: Cylindrical/Spherical projection surface mapping, multi-band Laplacian pyramid blending, and Mobile Web support.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Slide 15: Conclusion & Viva Q&A",
      content: (
        <div className="space-y-4 text-center py-6">
          <h2 className="text-xl font-bold text-white">Thank You!</h2>
          <p className="text-xs text-slate-300">PanoramaForge – Web-Based Automatic Panorama Generation</p>
          <div className="text-xs text-sky-400 font-semibold">Questions & Evaluation Discussion</div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-3xl rounded-2xl p-6 border border-slate-700/80 shadow-2xl flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Presentation className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Project Presentation Deck (Slide {currentSlide + 1} / {slides.length})</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Canvas */}
        <div className="flex-1 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col justify-between min-h-[320px]">
          <div className="text-xs font-bold text-purple-400 border-b border-slate-800 pb-2">
            {slides[currentSlide].title}
          </div>
          <div className="py-4">
            {slides[currentSlide].content}
          </div>
          <div className="text-[10px] text-slate-500 text-right">
            PanoramaForge DIP Deck
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2 flex-shrink-0">
          <button
            onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-medium transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-xs font-mono text-slate-400">
            {currentSlide + 1} of {slides.length}
          </span>
          <button
            onClick={() => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white text-xs font-medium transition"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
