"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface FeatureHighlightItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface FeatureHighlightProps {
  title: string;
  description: string;
  items: FeatureHighlightItem[];
  primaryColor: string;
  secondaryColor: string;
  highlightIndex?: number; // Optional prop to specify which word to highlight (default: last word)
}

export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
  title,
  description,
  items,
  primaryColor,
  secondaryColor,
  highlightIndex
}) => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b from-background via-background to-${primaryColor}/5 -z-10`} />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            {title.split(' ').map((word, i, arr) => {
              // If highlightIndex is provided, use it; otherwise default to highlighting the last word
              const shouldHighlight = highlightIndex !== undefined ? i === highlightIndex : i === arr.length - 1;

              return shouldHighlight ? (
                <span key={i} className={`text-${primaryColor}-400 font-bold`}>{i > 0 ? ' ' : ''}{word}</span>
              ) : (
                <span key={i}>{i > 0 ? ' ' : ''}{word}</span>
              );
            })}
          </h2>
          <p className="text-zinc-400 leading-relaxed text-lg">{description}</p>
        </motion.div>

        {/* Horizontal line separator */}
        <div className="w-24 h-px bg-white/20 mx-auto mb-20"></div>

        {/* Features in a vertical layout */}
        <div className="max-w-4xl mx-auto">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }} /* Original animation style */
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col md:flex-row items-start mb-16 last:mb-0 group"
            >
              {/* Icon column */}
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-8">
                <div className={`w-16 h-16 border border-${primaryColor}-500/30 flex items-center justify-center group-hover:border-${primaryColor}-400/50 transition-all duration-300`}>
                  <span className={`text-${primaryColor}-400`}>{item.icon}</span>
                </div>
              </div>

              {/* Content column */}
              <div className="flex-grow">
                <h3 className={`text-xl font-semibold text-white mb-3 group-hover:text-${primaryColor}-300 transition-all duration-300`}>
                  {item.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed max-w-2xl group-hover:text-zinc-300 transition-all duration-300">
                  {item.description}
                </p>

                {/* Subtle separator line between items */}
                {index < items.length - 1 && (
                  <div className={`w-full h-px bg-${primaryColor}-900/30 mt-16`}></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
