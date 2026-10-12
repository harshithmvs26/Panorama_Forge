import React, { useState } from 'react';
import { Layers, Image as ImageIcon, Sparkles, Network, ShieldCheck, Grid, Move, Blend, CheckCircle, BarChart3, Download, Maximize2 } from 'lucide-react';
import ImageComparisonSlider from './ImageComparisonSlider';
import StatsDashboard from './StatsDashboard';

export default function PipelineTabs({ results, onDownloadReport }) {
  const [activeTab, setActiveTab] = useState(8); // Default to Final Panorama (Tab index 8)

  if (!results) return null;

  const tabs = [
    { id: 0, label: "1. Input", icon: Layers },
    { id: 1, label: "2. Preprocess", icon: ImageIcon },
    { id: 2, label: "3. SIFT", icon: Sparkles },
    { id: 3, label: "4. Matching", icon: Network },
    { id: 4, label: "5. RANSAC", icon: ShieldCheck },
    { id: 5, label: "6. Homography", icon: Grid },
    { id: 6, label: "7. Warping", icon: Move },
    { id: 7, label: "8. Blending", icon: Blend },
    { id: 8, label: "9. Final Panorama", icon: CheckCircle },
    { id: 9, label: "10. Statistics", icon: BarChart3 },
  ];

  const handleDownloadImage = (dataUri, filename = "panorama.jpg") => {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Scrollable Tab Navigation Bar */}
      <div className="glass-panel p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`tab-btn flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'active bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        {/* TAB 1: INPUT IMAGES */}
        {activeTab === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Stage 1: Input Images & Validation</h3>
              <p className="text-xs text-slate-400">
                Uploaded or selected overlapping input photographs with format verification and scaling parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.input_stats.map((inp) => (
                <div key={inp.index} className="glass-card rounded-xl p-3 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-300 font-semibold">
                    <span>Image {inp.index}</span>
                    <span className="font-mono text-sky-400">{inp.original_dims[0]} &times; {inp.original_dims[1]} px</span>
                  </div>
                  <div className="h-44 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                    <img src={inp.color_b64} alt={`Input ${inp.index}`} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>Channels: {inp.channels} (BGR)</span>
                    <span>Resized: {inp.processed_dims[0]}x{inp.processed_dims[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PREPROCESSING */}
        {activeTab === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Stage 2: Image Preprocessing (Grayscale Conversion)</h3>
              <p className="text-xs text-slate-400">
                Grayscale conversion reduces computational dimensionality for SIFT gradient calculation while original RGB color is preserved for blending.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.input_stats.map((inp) => (
                <div key={inp.index} className="glass-card rounded-xl p-4 border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-sky-400">Image {inp.index} — Color vs Grayscale</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 text-center">Original Color</div>
                      <div className="h-36 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                        <img src={inp.color_b64} alt="Color" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 text-center">Grayscale Copy</div>
                      <div className="h-36 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                        <img src={inp.gray_b64} alt="Gray" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SIFT KEYPOINTS */}
        {activeTab === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Stage 3: SIFT Keypoint Detection & Descriptor Calculation</h3>
              <p className="text-xs text-slate-400">
                Scale-Invariant Feature Transform detects extremum keypoints in Difference-of-Gaussians (DoG) scale-space and assigns 128-dimensional orientation vectors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.sift_stats.map((sift) => (
                <div key={sift.index} className="glass-card rounded-xl p-4 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">Image {sift.index} Keypoints</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 font-mono font-bold">
                      {sift.num_keypoints} Keypoints
                    </span>
                  </div>
                  <div className="h-56 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                    <img src={sift.visualization_b64} alt={`SIFT ${sift.index}`} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Descriptor matrix shape: <span className="font-mono text-sky-400">[{sift.descriptor_shape.join(', ')}]</span> (128 values per feature vector)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FEATURE MATCHING */}
        {activeTab === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Stage 4: KNN Matching (k=2) & Lowe's Ratio Test</h3>
              <p className="text-xs text-slate-400">
                Brute-Force Matcher with Euclidean distance compares feature vectors. Lowe's ratio test rejects ambiguous matches where dist1 &ge; 0.75 &times; dist2.
              </p>
            </div>

            {results.matching_stages.map((m) => (
              <div key={m.step} className="glass-card rounded-xl p-4 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-sky-400">Stitching Step {m.step} Correspondence Matching</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Raw KNN: <strong className="text-white font-mono">{m.raw_matches_count}</strong></span>
                    <span className="text-emerald-400">Good Matches: <strong className="font-mono">{m.good_matches_count}</strong></span>
                    <span className="text-purple-400">Retention: <strong className="font-mono">{m.retention_rate}%</strong></span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-300 mb-1">Raw KNN Matches (k=2 Nearest Neighbors)</div>
                    <div className="h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                      <img src={m.raw_vis_b64} alt="Raw KNN" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-emerald-400 mb-1">Filtered Matches After Lowe's Ratio Test (Threshold = {m.ratio_threshold})</div>
                    <div className="h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                      <img src={m.good_vis_b64} alt="Ratio Test" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: RANSAC */}
        {activeTab === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Stage 5: RANSAC Outlier Rejection</h3>
              <p className="text-xs text-slate-400">
                Random Sample Consensus iteratively samples 4 keypoint pairs to estimate linear transformation and separates geometric inliers (green) from false correspondence outliers (red).
              </p>
            </div>

            {results.homography_stages.map((h) => (
              <div key={h.step} className="glass-card rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Step {h.step} RANSAC Filtering</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-semibold">Inliers: {h.inliers_count}</span>
                    <span className="text-rose-400 font-semibold">Outliers: {h.outliers_count}</span>
                    <span className="text-sky-400 font-semibold">Inlier Ratio: {h.inlier_ratio}%</span>
                  </div>
                </div>

                <div className="h-64 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                  <img src={h.ransac_vis_b64} alt="RANSAC Vis" className="w-full h-full object-contain" />
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Legend: <strong className="text-emerald-400">Green = Inliers</strong>, <strong className="text-rose-400">Red = Outliers</strong></span>
                  <span>RANSAC Reprojection Threshold: <strong className="text-sky-400">{h.ransac_threshold} px</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: HOMOGRAPHY */}
        {activeTab === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Stage 6: 3&times;3 Homography Matrix Estimation</h3>
              <p className="text-xs text-slate-400">
                Mathematical mapping matrix $H$ projecting 2D planar points between image coordinate spaces via 8 degrees of freedom: $[x', y', w]^T = H [x, y, 1]^T$.
              </p>
            </div>

            {results.homography_stages.map((h) => (
              <div key={h.step} className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
                <div className="text-xs font-semibold text-sky-400">Estimated Homography Matrix H (Step {h.step})</div>

                {/* Matrix mathematical table display */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-w-md mx-auto">
                  <div className="text-[10px] font-mono text-slate-400 text-center mb-2">Homography Matrix H (3&times;3)</div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center font-bold">
                    {h.matrix.map((row, rIdx) =>
                      row.map((val, cIdx) => (
                        <div key={`${rIdx}-${cIdx}`} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-sky-300">
                          {val}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-slate-200">Perspective Projection Equations:</div>
                  <div className="font-mono text-[11px] text-sky-300 space-y-1">
                    <div>X' = (h11*x + h12*y + h13) / (h31*x + h32*y + h33)</div>
                    <div>Y' = (h21*x + h22*y + h23) / (h31*x + h32*y + h33)</div>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    At least 4 non-collinear point correspondences are required to solve for matrix elements using Singular Value Decomposition (SVD).
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 7: PERSPECTIVE WARPING */}
        {activeTab === 6 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Stage 7: Perspective Warping & Canvas Alignment</h3>
              <p className="text-xs text-slate-400">
                Applying <code className="text-sky-400 font-mono">cv2.warpPerspective()</code> using translated composite Homography matrix to compensate for negative coordinate offsets.
              </p>
            </div>

            {results.warping_stages.map((w) => (
              <div key={w.step} className="glass-card rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">Step {w.step} Perspective Canvas Alignment</span>
                  <span className="font-mono text-sky-400">Canvas Dimensions: {w.canvas_size[0]} &times; {w.canvas_size[1]} px</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 text-center">Reference Image Placed on Canvas</div>
                    <div className="h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                      <img src={w.ref_placed_b64} alt="Reference Placed" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 text-center">Secondary Image Warped into Frame</div>
                    <div className="h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                      <img src={w.warped_vis_b64} alt="Secondary Warped" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 8: WEIGHTED BLENDING */}
        {activeTab === 7 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Stage 8: Euclidean Distance Transform Feather Blending</h3>
              <p className="text-xs text-slate-400">
                Smoothly interpolates overlapping pixel boundaries based on distance transform map weights to prevent visible seams and exposure jumps.
              </p>
            </div>

            {results.blending_stages.map((b) => (
              <div key={b.step} className="glass-card rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-sky-400">Step {b.step} Distance Transform Feather Blending</div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 text-center">Mask Image 1</div>
                    <div className="h-28 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                      <img src={b.mask1_b64} alt="Mask 1" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 text-center">Mask Image 2</div>
                    <div className="h-28 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                      <img src={b.mask2_b64} alt="Mask 2" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 text-center">Overlap Region</div>
                    <div className="h-28 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                      <img src={b.overlap_vis_b64} alt="Overlap" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 text-center">Distance Weight Map</div>
                    <div className="h-28 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                      <img src={b.distance_map_b64} alt="Distance Map" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="text-[11px] font-semibold text-emerald-400">Blended Output (Seamless Alignment)</div>
                  <div className="h-56 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                    <img src={b.blended_b64} alt="Blended Result" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 9: FINAL PANORAMA */}
        {activeTab === 8 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Stage 9: Input Photographs vs Final Panoramic Result</h3>
                <p className="text-xs text-slate-400">
                  Side-by-side evaluation comparing original overlapping input photos (Left) against the final stitched composite panorama (Right).
                </p>
              </div>
              <button
                onClick={() => handleDownloadImage(results.final_panorama_b64, "panorama_result.jpg")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Panorama (JPG)</span>
              </button>
            </div>

            {/* Side-by-Side Dual Column View: Input Images (Left) vs Final Panorama (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN: INPUT PHOTOGRAPHS */}
              <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs font-bold text-sky-400 border-b border-slate-800 pb-2">
                  <span>Input Photographs ({results.input_stats.length} Images)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Original Unstitched Source</span>
                </div>
                <div className="grid grid-cols-2 gap-2 flex-1 items-center">
                  {results.input_stats.map((inp) => (
                    <div key={inp.index} className="space-y-1">
                      <div className="text-[10px] text-slate-400 font-semibold text-center">Image {inp.index}</div>
                      <div className="h-40 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-1 flex items-center justify-center">
                        <img src={inp.color_b64} alt={`Input ${inp.index}`} className="max-h-full max-w-full object-contain" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
                  Source: {results.input_stats.length} separate overlapping captures
                </div>
              </div>

              {/* RIGHT COLUMN: FINAL STITCHED PANORAMA */}
              <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2">
                  <span>Final Panorama Output</span>
                  <span className="font-mono text-xs">{results.cropping_result.after_dims[0]} &times; {results.cropping_result.after_dims[1]} px</span>
                </div>
                <div className="h-64 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-2 flex items-center justify-center">
                  <img src={results.final_panorama_b64} alt="Final Panorama" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span>Aspect Ratio: <strong className="text-purple-400 font-mono">{results.statistics.aspect_ratio} : 1</strong></span>
                  <span>Processing Time: <strong className="text-amber-400 font-mono">{results.statistics.total_processing_time} s</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: STATISTICS */}
        {activeTab === 9 && (
          <StatsDashboard results={results} onDownloadReport={onDownloadReport} />
        )}
      </div>
    </div>
  );
}
