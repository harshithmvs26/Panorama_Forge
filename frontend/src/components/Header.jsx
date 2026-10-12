import React from 'react';
import { Camera, Sliders, HelpCircle, FileText, Presentation, Sparkles, Server } from 'lucide-react';

export default function Header({ onOpenSettings, onOpenViva, onOpenReport, onOpenPPT, backendStatus }) {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Camera className="h-5 w-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                PanoramaForge
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono font-medium">
                  Classical DIP
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Automatic Multi-Image Stitching via SIFT • KNN • RANSAC • Homography • Distance Blending
            </p>
          </div>
        </div>

        {/* Status & Settings Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Backend Status indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            backendStatus === 'online' 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
          }`}>
            <Server className="w-3.5 h-3.5" />
            <span>{backendStatus === 'online' ? 'Python Engine Ready' : 'Connecting API...'}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
