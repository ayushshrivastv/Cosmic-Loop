"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface BenefitMetric {
  metric: string;
  traditional: string;
  scalable: string;
  improvement: string;
}

interface BenefitsTableProps {
  metrics: BenefitMetric[];
}

export const BenefitsTable: React.FC<BenefitsTableProps> = ({ metrics }) => {
  return (
    <section className="py-12 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-black/80 -z-10" />
      
      {/* Subtle background effect */}
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
            Quantified <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Benefits</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Scalable cToken delivers massive improvements over traditional NFTs
          </p>
        </motion.div>
        
        {/* Benefits table with Apple-style design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="overflow-hidden rounded-xl backdrop-blur-md bg-white/5 border border-white/10"
        >
          <div className="min-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr className="bg-white/10">
                  <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-white">
                    Metric
                  </th>
                  <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-white">
                    Traditional NFTs
                  </th>
                  <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-white">
                    Scalable cToken
                  </th>
                  <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-indigo-400">
                    Improvement
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {metrics.map((metric, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {metric.metric}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                      {metric.traditional}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">
                      {metric.scalable}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-400">
                      {metric.improvement}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
        
        {/* Additional explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 max-w-3xl mx-auto text-center"
        >
          <p className="text-zinc-400 text-sm">
            By leveraging Light Protocol's state compression technology, Scalable cToken delivers dramatic improvements in cost and scalability
            while maintaining the same user experience and security guarantees as traditional NFTs.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
