import React, { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Images, Trash2, ArrowUp, ArrowDown, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { getSampleCategories } from '../services/api';

export default function ImageInput({
  inputMode,
  setInputMode,
  localFiles,
  setLocalFiles,
  urlInputs,
  setUrlInputs,
  selectedSampleCat,
  setSelectedSampleCat,
  onGeneratePanorama,
  isProcessing
}) {
  const [sampleCategories, setSampleCategories] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(false);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    setLoadingSamples(true);
    try {
      const res = await getSampleCategories();
      setSampleCategories(res.categories || []);
      if (res.categories && res.categories.length > 0 && !selectedSampleCat) {
        setSelectedSampleCat(res.categories[0].id);
      }
    } catch (err) {
      console.error("Failed to load sample categories:", err);
    } finally {
      setLoadingSamples(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const combined = [...localFiles, ...files].slice(0, 5);
    setLocalFiles(combined);
  };

  const removeLocalFile = (index) => {
    setLocalFiles(localFiles.filter((_, idx) => idx !== index));
  };

  const moveLocalFile = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= localFiles.length) return;
    const updated = [...localFiles];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setLocalFiles(updated);
  };

  const addUrlInput = () => {
    if (urlInputs.length < 5) {
      setUrlInputs([...urlInputs, '']);
    }
  };

  const updateUrlInput = (index, val) => {
    const updated = [...urlInputs];
    updated[index] = val;
    setUrlInputs(updated);
  };

  const removeUrlInput = (index) => {
    if (urlInputs.length <= 2) return;
    setUrlInputs(urlInputs.filter((_, idx) => idx !== index));
  };

  // Validation
  let canGenerate = false;
  let validationMsg = "";

  if (inputMode === 'upload') {
    if (localFiles.length < 2) {
      validationMsg = "Upload at least 2 overlapping images (max 5).";
    } else if (localFiles.length > 5) {
      validationMsg = "Maximum 5 images allowed.";
    } else {
      canGenerate = true;
    }
  } else if (inputMode === 'url') {
    const validUrls = urlInputs.filter(u => u.trim().startsWith('http://') || u.trim().startsWith('https://'));
    if (validUrls.length < 2) {
      validationMsg = "Provide at least 2 valid HTTP/HTTPS image URLs.";
    } else {
      canGenerate = true;
    }
  } else if (inputMode === 'sample') {
    if (!selectedSampleCat) {
      validationMsg = "Select a sample category set.";
    } else {
      canGenerate = true;
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-5">
      {/* Input Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span>Image Source Selection</span>
        </h2>
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setInputMode('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              inputMode === 'upload' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Local Upload</span>
          </button>
          <button
            onClick={() => setInputMode('url')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              inputMode === 'url' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
          <button
            onClick={() => setInputMode('sample')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              inputMode === 'sample' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Images className="w-3.5 h-3.5" />
            <span>Sample Gallery</span>
          </button>
        </div>
      </div>

      {/* MODE A: LOCAL UPLOAD */}
      {inputMode === 'upload' && (
        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-sky-500/50 bg-slate-900/40 rounded-xl p-6 cursor-pointer transition group">
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-sky-400 mb-2 transition" />
            <span className="text-xs font-medium text-slate-300">Click or drag & drop 2 to 5 overlapping photos</span>
            <span className="text-[11px] text-slate-500 mt-1">Supports JPG, PNG, WEBP (Max 15MB per file)</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {localFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Selected Images ({localFiles.length}/5)</span>
                <button
                  onClick={() => setLocalFiles([])}
                  className="text-rose-400 hover:text-rose-300 transition"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {localFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 bg-slate-950 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${idx+1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-200 truncate">
                          {idx + 1}. {file.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveLocalFile(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                        title="Move Left/Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveLocalFile(idx, 1)}
                        disabled={idx === localFiles.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                        title="Move Right/Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeLocalFile(idx)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE B: IMAGE URL */}
      {inputMode === 'url' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Paste 2 to 5 direct public image URLs (e.g. JPG, PNG).
          </p>
          {urlInputs.map((urlVal, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 w-5">{idx + 1}.</span>
              <input
                type="url"
                value={urlVal}
                onChange={(e) => updateUrlInput(idx, e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
              {urlInputs.length > 2 && (
                <button
                  onClick={() => removeUrlInput(idx)}
                  className="p-2 text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {urlInputs.length < 5 && (
            <button
              onClick={addUrlInput}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium transition"
            >
              + Add another Image URL
            </button>
          )}
        </div>
      )}

      {/* MODE C: SAMPLE GALLERY */}
      {inputMode === 'sample' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Select a built-in sample photo set designed specifically for feature-matching and homography evaluation.
          </p>
          {loadingSamples ? (
            <div className="text-xs text-slate-500 py-4 text-center">Loading sample sets...</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sampleCategories.map((cat) => {
                const isSelected = selectedSampleCat === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedSampleCat(cat.id)}
                    className={`cursor-pointer p-3 rounded-xl border transition ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-sky-400" />}
                    </div>
                    <div className="flex items-center gap-1 overflow-hidden">
                      {cat.images.map((imgUrl, i) => (
                        <div key={i} className="h-12 flex-1 bg-slate-950 rounded overflow-hidden border border-slate-800">
                          <img src={imgUrl} alt={`${cat.name} ${i}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          {!canGenerate ? (
            <>
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{validationMsg}</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Ready for automatic stitching pipeline.</span>
            </>
          )}
        </div>

        <button
          onClick={onGeneratePanorama}
          disabled={!canGenerate || isProcessing}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Generate Panorama</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
