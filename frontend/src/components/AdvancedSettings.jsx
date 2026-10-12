import React from 'react';
import { X, RotateCcw, Info } from 'lucide-react';

export default function AdvancedSettings({ isOpen, onClose, settings, setSettings }) {
  if (!isOpen) return null;

  const resetDefaults = () => {
    setSettings({
      nfeatures: 2000,
      ratio_threshold: 0.75,
      ransac_threshold: 4.0,
      max_dimension: 1200
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700/80 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>DIP Algorithm Parameters</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* SIFT Max Keypoints */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">SIFT Max Features (nfeatures)</label>
              <span className="font-mono text-sky-400 font-medium">{settings.nfeatures}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="250"
              value={settings.nfeatures}
              onChange={(e) => setSettings({ ...settings, nfeatures: parseInt(e.target.value) })}
              className="w-full accent-sky-500 bg-slate-900 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Maximum keypoints detected by Scale-Invariant Feature Transform per image.
            </p>
          </div>

          {/* Lowe Ratio Test Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Lowe Ratio Test Threshold</label>
              <span className="font-mono text-sky-400 font-medium">{settings.ratio_threshold}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.90"
              step="0.05"
              value={settings.ratio_threshold}
              onChange={(e) => setSettings({ ...settings, ratio_threshold: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 bg-slate-900 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Rejects matches where dist1 &ge; ratio * dist2. Lower values increase precision.
            </p>
          </div>

          {/* RANSAC Reprojection Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">RANSAC Reprojection Threshold (px)</label>
              <span className="font-mono text-sky-400 font-medium">{settings.ransac_threshold}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={settings.ransac_threshold}
              onChange={(e) => setSettings({ ...settings, ransac_threshold: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 bg-slate-900 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Maximum pixel reprojection error allowed for inlier points in Homography estimation.
            </p>
          </div>

          {/* Max Resizing Dimension */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Max Dimension Resize Limit</label>
              <span className="font-mono text-sky-400 font-medium">{settings.max_dimension}px</span>
            </div>
            <input
              type="range"
              min="800"
              max="2000"
              step="200"
              value={settings.max_dimension}
              onChange={(e) => setSettings({ ...settings, max_dimension: parseInt(e.target.value) })}
              className="w-full accent-sky-500 bg-slate-900 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Resizes oversized inputs while preserving aspect ratio for processing speed & stability.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
}
