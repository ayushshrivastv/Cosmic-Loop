"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScreenshotCarouselProps {
  images: string[];
  autoplaySpeed?: number;
}

export const ScreenshotCarousel: React.FC<ScreenshotCarouselProps> = ({
  images,
  autoplaySpeed = 5000 // 5 seconds per slide by default
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Autoplay effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoplaySpeed);
    
    return () => clearInterval(interval);
  }, [images.length, autoplaySpeed]);
  
  // Handle manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };
  
  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl border border-white/10">
      {/* Main image container with fixed aspect ratio */}
      <div className="relative w-full aspect-[16/9] bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img 
              src={images[currentIndex]} 
              alt={`Screenshot ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Apple-style reflection gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white scale-125' : 'bg-white/30'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
