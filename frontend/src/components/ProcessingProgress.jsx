import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export default function ProcessingProgress({ activeStep }) {
  const steps = [
    "Validating & preprocessing images",
    "Detecting SIFT keypoints & computing 128D descriptors",
    "Performing KNN (k=2) feature matching",
    "Applying Lowe's Ratio Test filtering",
    "Executing RANSAC geometric outlier rejection",
    "Estimating 3x3 Homography transformation matrix",
    "Applying perspective warping & canvas coordinate mapping",
    "Generating Euclidean distance transform blending masks",
    "Cropping unexposed black border boundaries",
    "Finalizing statistical analytics & runtime breakdown"
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
          <span>Executing DIP Pipeline Stages</span>
        </h3>
        <span className="text-xs font-mono text-sky-400 font-semibold">
          Stage {Math.min(activeStep + 1, steps.length)} of {steps.length}
        </span>
      </div>

      <div className="space-y-2">
        {steps.map((label, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : isCurrent
                  ? 'bg-sky-950/40 border-sky-500/50 text-sky-200 font-medium'
                  : 'bg-slate-900/30 border-slate-800 text-slate-500'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDone ? 'bg-emerald-500 text-slate-950' : isCurrent ? 'bg-sky-500 text-white animate-pulse' : 'bg-slate-800 text-slate-600'
              }`}>
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isCurrent ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span className="text-[10px] font-mono">{idx + 1}</span>
                )}
              </div>
              <span className="truncate">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
