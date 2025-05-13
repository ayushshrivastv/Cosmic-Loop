"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface FeatureSectionProps {
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  reversed?: boolean;
  children?: React.ReactNode;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  imageSrc,
  imageAlt = 'Feature image',
  reversed = false,
  children
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Parallax effect for image
  const imageY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  
  // Fade-in effect for text
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [0, 1, 1]);
  const textY = useTransform(scrollYProgress, [0, 0.3, 0.6], [50, 0, 0]);

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-16`}>
          {/* Text content with fade-in effect */}
          <motion.div 
            className="w-full md:w-1/2 space-y-6"
            style={{ opacity: textOpacity, y: textY }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
              {title}
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              {description}
            </p>
            {children}
          </motion.div>

          {/* Image with parallax effect */}
          {imageSrc && (
            <motion.div 
              className="w-full md:w-1/2 flex justify-center"
              style={{ y: imageY }}
            >
              <div className="relative w-full max-w-lg aspect-[4/3] overflow-hidden rounded-xl bg-card/10 p-1">
                <img 
                  src={imageSrc} 
                  alt={imageAlt}
                  className="w-full h-full object-cover rounded-lg"
                />
                {/* Apple-style subtle reflection */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
