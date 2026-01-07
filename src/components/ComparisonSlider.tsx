import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface ComparisonSliderProps {
  originalImage: string;
  convertedImage: string;
  originalSize: number;
  convertedSize: number;
  onClose: () => void;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalImage,
  convertedImage,
  originalSize,
  convertedSize,
  onClose,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const reduction = Math.round(((originalSize - convertedSize) / originalSize) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Before / After Comparison
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close comparison"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Image Comparison */}
        <div
          ref={containerRef}
          className="relative aspect-video bg-gray-900 overflow-hidden cursor-col-resize select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Converted Image (Background) */}
          <img
            src={convertedImage}
            alt="Converted"
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />

          {/* Original Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={originalImage}
              alt="Original"
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />
          </div>

          {/* Slider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
            <span className="text-xs font-medium text-white">Original</span>
          </div>
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
            <span className="text-xs font-medium text-white">Converted</span>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Original</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatSize(originalSize)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Converted</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {formatSize(convertedSize)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Reduction</p>
            <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
              {reduction}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
