import React from 'react';
import { Clock, Cpu, BarChart3, Layers, Sparkles, Download, CheckCircle2 } from 'lucide-react';

export default function StatsDashboard({ results, onDownloadReport }) {
  if (!results || !results.statistics) return null;

  const stats = results.statistics;
  const timing = stats.timing_breakdown || {};
  const maxTime = Math.max(...Object.values(timing).filter(v => typeof v === 'number' && v > 0));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Input Images</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.num_images}</div>
          <div className="text-[11px] text-slate-500">Overlapping frames</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Keypoints</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.avg_keypoints}</div>
          <div className="text-[11px] text-slate-500">SIFT features per image</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Inlier Ratio</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.overall_inlier_ratio}%</div>
          <div className="text-[11px] text-slate-500">{stats.total_inliers} / {stats.total_good_matches} matches</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Runtime</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.total_processing_time}s</div>
          <div className="text-[11px] text-slate-500">FastAPI backend timing</div>
        </div>
      </div>

      {/* Processing Runtime Breakdown Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Execution Time Breakdown per DIP Phase</span>
          </h4>
          <button
            onClick={onDownloadReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 text-xs font-medium border border-sky-500/30 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (TXTs)</span>
          </button>
        </div>

        <div className="space-y-3">
          {Object.entries(timing).map(([stage, duration]) => {
            if (stage === "Total Execution Time") return null;
            const pct = maxTime > 0 ? (duration / maxTime) * 100 : 0;
            return (
              <div key={stage} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">{stage}</span>
                  <span className="font-mono text-sky-400">{duration} s</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytical Detail Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span>Geometric & Resolution Metrics Summary</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3 font-semibold">Metric Parameter</th>
                <th className="py-2 px-3 font-semibold">Value</th>
                <th className="py-2 px-3 font-semibold">Academic Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Panorama Resolution</td>
                <td className="py-2.5 px-3 font-mono text-sky-400">{stats.panorama_width} &times; {stats.panorama_height} px</td>
                <td className="py-2.5 px-3 text-slate-400">Cropped valid panorama canvas dimensions</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Aspect Ratio</td>
                <td className="py-2.5 px-3 font-mono text-purple-400">{stats.aspect_ratio} : 1</td>
                <td className="py-2.5 px-3 text-slate-400">Panoramic horizontal field-of-view stretch factor</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">SIFT Keypoints Count</td>
                <td className="py-2.5 px-3 font-mono text-indigo-400">{stats.keypoints_per_img.join(" / ")}</td>
                <td className="py-2.5 px-3 text-slate-400">Extracted scale-invariant feature keypoints per frame</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Lowe Ratio Retention</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400">{stats.total_good_matches} Good Matches</td>
                <td className="py-2.5 px-3 text-slate-400">Passed nearest neighbor ratio test (&le; 0.75)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">RANSAC Inliers</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400">{stats.total_inliers} Inliers ({stats.overall_inlier_ratio}%)</td>
                <td className="py-2.5 px-3 text-slate-400">Geometrically valid point correspondences</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
