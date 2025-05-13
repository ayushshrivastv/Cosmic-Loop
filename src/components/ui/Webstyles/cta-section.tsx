"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CTASectionProps {
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink
}) => {
  return (
    <section className="py-12 relative overflow-hidden">
      {/* Apple-style subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#060e1b] to-black -z-10" />
      
      {/* Apple-style decorative elements */}
      <motion.div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl opacity-40"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.4 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      />
      <motion.div 
        className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl opacity-30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.3 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      />
      
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{title}</h2>
          <p className="text-lg text-zinc-400 mb-12 leading-relaxed">{description}</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={primaryButtonLink}>
              <motion.div
                className="inline-flex items-center justify-center h-12 px-8 font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-lg hover:shadow-blue-500/25 transition-all duration-300 whitespace-nowrap"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {primaryButtonText}
              </motion.div>
            </Link>
            
            {secondaryButtonText && secondaryButtonLink && (
              <Link href={secondaryButtonLink}>
                <motion.div
                  className="inline-flex items-center justify-center h-12 px-8 font-medium text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/15 transition-all duration-300 whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {secondaryButtonText}
                </motion.div>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
