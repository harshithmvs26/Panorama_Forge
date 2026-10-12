import React, { useState, useRef, useEffect } from 'react';

export default function ImageComparisonSlider({ imgBefore, imgAfter, labelBefore = "Before", labelAfter = "After" }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pos = (x / rect.width) * 100;
    if (pos < 0) pos = 0;
    if (pos > 100) pos = 100;
    setSliderPosition(pos);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="comparison-slider-container w-full h-[400px] md:h-[500px] bg-slate-950 rounded-xl overflow-hidden cursor-ew-resize border border-slate-800 relative select-none"
    >
      {/* Background Image (After) */}
      <img
        src={imgAfter}
        alt={labelAfter}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-medium text-sky-400">
        {labelAfter}
      </span>

      {/* Foreground Image (Before) clipped by sliderPosition */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={imgBefore}
          alt={labelBefore}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%', maxWidth: 'none' }}
        />
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-medium text-emerald-400">
          {labelBefore}
        </span>
      </div>

      {/* Slider Bar & Handle */}
      <div
        className="comparison-slider-handle"
        style={{ left: `${sliderPosition}%` }}
      />
    </div>
  );
}
