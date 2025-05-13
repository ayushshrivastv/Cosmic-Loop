"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ComparisonFeature {
  name: string;
  standard: string | boolean;
  premium: string | boolean;
  enterprise: string | boolean;
}

interface ComparisonTableProps {
  features: ComparisonFeature[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ features }) => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-black/80 -z-10" />
      
      {/* Subtle background image */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center -z-10"
        style={{ backgroundImage: 'url(/images/gradients/blue-purple-gradient.svg)' }}
      />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Token Tier</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Select the perfect token tier for your event needs with our flexible options
          </p>
        </motion.div>
        
        {/* Table header */}
        <div className="grid grid-cols-4 gap-6 mb-6 text-center">
          <div className="col-span-1"></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="col-span-1"
          >
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-1">Standard</h3>
              <p className="text-zinc-400 mb-3 text-sm">Basic event tokens</p>
              <p className="text-white text-3xl font-bold">Free</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-1"
          >
            <div className="backdrop-blur-md bg-gradient-to-b from-blue-500/20 to-indigo-500/10 border border-blue-500/30 rounded-xl p-6 relative shadow-lg shadow-blue-500/10">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs py-1 px-3 rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">Premium</h3>
              <p className="text-zinc-400 mb-3 text-sm">Enhanced features</p>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-3xl font-bold">0.05 SOL</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="col-span-1"
          >
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-1">Enterprise</h3>
              <p className="text-zinc-400 mb-3 text-sm">Full customization</p>
              <p className="text-white text-3xl font-bold">0.2 SOL</p>
            </div>
          </motion.div>
        </div>
        
        {/* Table body */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: index * 0.05 + 0.3 }}
              className={`grid grid-cols-4 gap-6 p-4 ${
                index % 2 === 0 ? 'bg-white/5' : ''
              }`}
            >
              <div className="col-span-1 flex items-center">
                <span className="text-zinc-300 font-medium">{feature.name}</span>
              </div>
              
              <div className="col-span-1 flex items-center justify-center">
                {typeof feature.standard === 'boolean' ? (
                  feature.standard ? (
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )
                ) : (
                  <span className="text-zinc-400">{feature.standard}</span>
                )}
              </div>
              
              <div className="col-span-1 flex items-center justify-center">
                {typeof feature.premium === 'boolean' ? (
                  feature.premium ? (
                    <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )
                ) : (
                  <span className="text-blue-400">{feature.premium}</span>
                )}
              </div>
              
              <div className="col-span-1 flex items-center justify-center">
                {typeof feature.enterprise === 'boolean' ? (
                  feature.enterprise ? (
                    <svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )
                ) : (
                  <span className="text-purple-400">{feature.enterprise}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* CTA buttons */}
        <div className="grid grid-cols-4 gap-6 mt-8">
          <div className="col-span-1"></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="col-span-1 flex justify-center"
          >
            <button className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-white font-medium transition-all duration-300 hover:scale-105">
              Select Standard
            </button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="col-span-1 flex justify-center"
          >
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-700/20">
              Select Premium
            </button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="col-span-1 flex justify-center"
          >
            <button className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-white font-medium transition-all duration-300 hover:scale-105">
              Select Enterprise
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
