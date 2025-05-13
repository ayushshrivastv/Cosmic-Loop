"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PerformanceMetric {
  metric: string;
  value: string;
  unit: string;
  improvement: string;
  color: string;
}

interface QuantifiedBenefitsProps {
  metrics?: PerformanceMetric[];
}

export const QuantifiedBenefits: React.FC<QuantifiedBenefitsProps> = ({
  metrics = [
    {
      metric: 'Transaction Throughput',
      value: '65,000',
      unit: 'TPS',
      improvement: '30x faster than Ethereum',
      color: 'purple'
    },
    {
      metric: 'Cost Efficiency',
      value: '1000x',
      unit: '',
      improvement: 'Lower than traditional tokens',
      color: 'green'
    },
    {
      metric: 'Finality Time',
      value: '400',
      unit: 'ms',
      improvement: 'Near-instant confirmations',
      color: 'blue'
    },
    {
      metric: 'Scalability',
      value: '100k+',
      unit: 'users',
      improvement: 'Enterprise-grade capacity',
      color: 'yellow'
    }
  ]
}) => {
  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-b from-black via-black/95 to-black/90">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-40"></div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Benefits</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Real-world performance metrics of Solana's compressed token system
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6 overflow-hidden group"
            >
              {/* Gradient background effect */}
              <div className={`absolute inset-0 bg-gradient-to-br from-${metric.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>

              {/* Animated accent line */}
              <div className={`absolute top-0 left-0 h-1 bg-${metric.color}-500 w-0 group-hover:w-full transition-all duration-700 ease-out`}></div>

              <h3 className="text-zinc-400 text-sm mb-2">{metric.metric}</h3>

              <div className="flex items-end space-x-1 mb-2">
                <span className={`text-4xl font-bold text-${metric.color}-400`}>{metric.value}</span>
                {metric.unit && <span className="text-zinc-400 text-lg mb-1">{metric.unit}</span>}
              </div>

              <p className="text-zinc-300 text-sm">{metric.improvement}</p>

              {/* Decorative element */}
              <div className={`absolute bottom-0 right-0 w-20 h-20 rounded-full bg-${metric.color}-500/5 -z-10 translate-x-8 translate-y-8`}></div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-zinc-400 max-w-3xl mx-auto">
            <span className="text-white font-medium">Light Protocol's state compression</span> technology enables these
            breakthrough performance metrics, allowing for token issuance at unprecedented scale and efficiency.
          </p>
        </div>
      </div>
    </section>
  );
};
