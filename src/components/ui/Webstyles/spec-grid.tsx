"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SpecItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const SpecItem: React.FC<SpecItemProps> = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay }}
    className="flex flex-col items-center text-center p-6 bg-card/50 backdrop-blur-md rounded-2xl border border-white/10"
  >
    <div className="mb-4 text-primary p-3 bg-white/5 rounded-full">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-zinc-400 text-sm">{description}</p>
  </motion.div>
);

interface SpecGridProps {
  title: string;
  subtitle?: string;
  items: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
}

export const SpecGrid: React.FC<SpecGridProps> = ({ title, subtitle, items }) => {
  return (
    <section className="py-12 relative overflow-hidden">
      {/* Apple-style gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-background to-background -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4"
          >
            {title}
          </motion.h2>
          
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-zinc-400 max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <SpecItem
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
