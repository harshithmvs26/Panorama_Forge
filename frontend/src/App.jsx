import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageInput from './components/ImageInput';
import AdvancedSettings from './components/AdvancedSettings';
import ProcessingProgress from './components/ProcessingProgress';
import PipelineTabs from './components/PipelineTabs';

import { checkHealth, stitchFiles, stitchUrls, stitchSample } from './services/api';
import { AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  // State
  const [backendStatus, setBackendStatus] = useState('offline');
  const [inputMode, setInputMode] = useState('sample'); // 'upload' | 'url' | 'sample'
  const [localFiles, setLocalFiles] = useState([]);
  const [urlInputs, setUrlInputs] = useState(['', '']);
  const [selectedSampleCat, setSelectedSampleCat] = useState('campus');

  // Advanced DIP Settings
  const [settings, setSettings] = useState({
    nfeatures: 2000,
    ratio_threshold: 0.75,
    ransac_threshold: 4.0,
    max_dimension: 1200
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Processing & Results State
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    verifyBackendHealth();
  }, []);

  const verifyBackendHealth = async () => {
    try {
      const res = await checkHealth();
      if (res && res.status === 'online') {
        setBackendStatus('online');
      }
    } catch (err) {
      console.warn("Backend API health check failed:", err);
      setBackendStatus('offline');
    }
  };

  const handleGeneratePanorama = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setActiveStep(0);

    // Simulate progress animation steps while backend processes
    const stepInterval = setInterval(() => {
      setActiveStep(prev => (prev < 9 ? prev + 1 : prev));
    }, 300);

    try {
      let data = null;
      if (inputMode === 'upload') {
        const formData = new FormData();
        localFiles.forEach((file) => formData.append('files', file));
        formData.append('nfeatures', settings.nfeatures);
        formData.append('ratio_threshold', settings.ratio_threshold);
        formData.append('ransac_threshold', settings.ransac_threshold);
        formData.append('max_dimension', settings.max_dimension);
        data = await stitchFiles(formData);
      } else if (inputMode === 'url') {
        const validUrls = urlInputs.filter(u => u.trim().startsWith('http://') || u.trim().startsWith('https://'));
        data = await stitchUrls({
          urls: validUrls,
          nfeatures: settings.nfeatures,
          ratio_threshold: settings.ratio_threshold,
          ransac_threshold: settings.ransac_threshold,
          max_dimension: settings.max_dimension
        });
      } else if (inputMode === 'sample') {
        data = await stitchSample({
          category: selectedSampleCat,
          nfeatures: settings.nfeatures,
          ratio_threshold: settings.ratio_threshold,
          ransac_threshold: settings.ransac_threshold,
          max_dimension: settings.max_dimension
        });
      }

      clearInterval(stepInterval);
      setActiveStep(9);
      setTimeout(() => {
        setResults(data);
        setIsProcessing(false);
      }, 400);

    } catch (err) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      const detail = err.response?.data?.detail || err.message || "An unexpected error occurred during DIP pipeline execution.";
      setErrorMessage(detail);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      <div>
        {/* Navigation Header */}
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          backendStatus={backendStatus}
        />

        {/* Main Content Container */}
        <main className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6 pb-12">
          {/* Hero Header */}
          <div className="text-center space-y-2 py-4">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Automatic Panoramic Image Stitching Engine
            </h2>
            <p className="text-xs lg:text-sm text-slate-400 max-w-2xl mx-auto">
              Construct high-resolution panoramic images from overlapping photographs. Understand every step of classical DIP: SIFT keypoints, KNN matching, Lowe's ratio test, RANSAC inliers, 3x3 Homography, perspective warping, and distance transform blending.
            </p>
          </div>

          {/* Error Message Toast / Alert */}
          {errorMessage && (
            <div className="glass-panel rounded-2xl p-4 border border-rose-500/50 bg-rose-950/30 text-rose-200 text-xs flex items-start gap-3 animate-fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-rose-300">Panorama Processing Error</div>
                <div>{errorMessage}</div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Tip: Ensure input images have adequate visual overlap (&gt;30%), distinct features/texture, and correct ordering, or lower Lowe's ratio threshold in Settings.
                </div>
              </div>
            </div>
          )}

          {/* Top Section: Image Input Controls */}
          <ImageInput
            inputMode={inputMode}
            setInputMode={setInputMode}
            localFiles={localFiles}
            setLocalFiles={setLocalFiles}
            urlInputs={urlInputs}
            setUrlInputs={setUrlInputs}
            selectedSampleCat={selectedSampleCat}
            setSelectedSampleCat={setSelectedSampleCat}
            onGeneratePanorama={handleGeneratePanorama}
            isProcessing={isProcessing}
          />

          {/* Processing Progress Indicator */}
          {isProcessing && (
            <ProcessingProgress activeStep={activeStep} />
          )}

          {/* Pipeline Stage Visualizations & Tab Views */}
          {results && !isProcessing && (
            <PipelineTabs results={results} />
          )}
        </main>
      </div>

      {/* Modals */}
      <AdvancedSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        PanoramaForge &copy; {new Date().getFullYear()} • Classical Digital Image Processing Project
      </footer>
    </div>
  );
}
