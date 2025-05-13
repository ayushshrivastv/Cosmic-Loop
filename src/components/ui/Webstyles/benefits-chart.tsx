"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  x: number;
  traditional: number;
  scalable: number;
  [key: string]: number; // Add index signature to allow string indexing
}

interface BenefitMetric {
  metric: string;
  traditional: string;
  scalable: string;
  improvement: string;
  // For chart visualization
  traditionalValue?: number;
  scalableValue?: number;
  dataPoints?: DataPoint[];
}

interface BenefitsChartProps {
  metrics: BenefitMetric[];
}

export const BenefitsChart: React.FC<BenefitsChartProps> = ({ metrics }) => {
  // Process metrics for visualization and generate mock data points for stock-like charts
  const processedMetrics = metrics.map(metric => {
    let traditionalValue = 0;
    let scalableValue = 0;
    let dataPoints: { x: number; traditional: number; scalable: number }[] = [];
    
    // Extract numeric values for comparison
    if (metric.metric === 'Storage Cost per Token') {
      traditionalValue = 0.005;
      scalableValue = 0.000005;
      // Generate data points for a stock-like chart (cost decreasing over time)
      dataPoints = Array.from({ length: 12 }, (_, i) => ({
        x: i,
        traditional: traditionalValue * (1 - (i * 0.02)),
        scalable: scalableValue * (1 - (i * 0.01))
      }));
    } else if (metric.metric === 'Tokens per Transaction') {
      traditionalValue = 1;
      scalableValue = 1000;
      // Generate data points for a stock-like chart (tokens increasing over time)
      dataPoints = Array.from({ length: 12 }, (_, i) => ({
        x: i,
        traditional: traditionalValue * (1 + (i * 0.05)),
        scalable: scalableValue * (1 + (i * 0.1))
      }));
    } else if (metric.metric === 'Gas Fees for 10,000 Tokens') {
      traditionalValue = 50;
      scalableValue = 0.05;
      // Generate data points for a stock-like chart (fees decreasing over time)
      dataPoints = Array.from({ length: 12 }, (_, i) => ({
        x: i,
        traditional: traditionalValue * (1 - (i * 0.03)),
        scalable: scalableValue * (1 - (i * 0.02))
      }));
    } else if (metric.metric === 'Claim Transaction Time') {
      traditionalValue = 3.5; // Average of 2-5 seconds
      scalableValue = 3.5;    // Equal UX
      // Generate data points for a stock-like chart (times remaining constant)
      dataPoints = Array.from({ length: 12 }, (_, i) => ({
        x: i,
        traditional: traditionalValue + (Math.sin(i) * 0.5),
        scalable: scalableValue + (Math.cos(i) * 0.5)
      }));
    } else if (metric.metric === 'Maximum Event Size') {
      traditionalValue = 1000;
      scalableValue = 100000;
      // Generate data points for a stock-like chart (sizes increasing over time)
      dataPoints = Array.from({ length: 12 }, (_, i) => ({
        x: i,
        traditional: traditionalValue * (1 + (i * 0.1)),
        scalable: scalableValue * (1 + (i * 0.15))
      }));
    } else if (metric.metric === 'Token Issuance Speed') {
      traditionalValue = 10;
      scalableValue = 5000;
      // Generate data points for a stock-like chart (speed increasing over time)
      dataPoints = Array.from({ length: 12 }, (_, i) => ({
        x: i,
        traditional: traditionalValue * (1 + (i * 0.05)),
        scalable: scalableValue * (1 + (i * 0.08))
      }));
    }
    
    return {
      ...metric,
      traditionalValue,
      scalableValue,
      dataPoints
    };
  });

  // Helper function to draw SVG path for chart lines
  const generateSvgPath = (dataPoints: DataPoint[], valueKey: string, maxValue: number, height: number): string => {
    if (!dataPoints || dataPoints.length === 0) return '';
    
    const width = 100; // SVG viewBox width percentage
    const xScale = width / (dataPoints.length - 1);
    const yScale = height / maxValue;
    
    return dataPoints.map((point: DataPoint, i: number) => {
      const x = i * xScale;
      const y = height - (point[valueKey] * yScale);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Helper function to generate area path (for fill below line)
  const generateAreaPath = (dataPoints: DataPoint[], valueKey: string, maxValue: number, height: number): string => {
    if (!dataPoints || dataPoints.length === 0) return '';
    
    const width = 100; // SVG viewBox width percentage
    const xScale = width / (dataPoints.length - 1);
    const yScale = height / maxValue;
    
    let path = dataPoints.map((point: DataPoint, i: number) => {
      const x = i * xScale;
      const y = height - (point[valueKey] * yScale);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    // Add bottom line to close the path
    const lastX = (dataPoints.length - 1) * xScale;
    path += ` L ${lastX} ${height} L 0 ${height} Z`;
    
    return path;
  };

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
        
        {/* Benefits charts with stock market-like visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {processedMetrics.map((metric, index) => {
            // Calculate max value for chart scaling
            const maxTraditional = Math.max(...metric.dataPoints.map(d => d.traditional));
            const maxScalable = Math.max(...metric.dataPoints.map(d => d.scalable));
            const maxValue = Math.max(maxTraditional, maxScalable) * 1.1; // Add 10% padding
            
            // Chart height
            const chartHeight = 60; // SVG viewBox height
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-4">{metric.metric}</h3>
                
                {/* Stock market-like chart */}
                <div className="relative h-40 w-full mb-4">
                  <svg
                    viewBox={`0 0 100 ${chartHeight}`}
                    preserveAspectRatio="none"
                    className="w-full h-full"
                  >
                    {/* Grid lines */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <line
                        key={`grid-${i}`}
                        x1="0"
                        y1={i * (chartHeight / 4)}
                        x2="100"
                        y2={i * (chartHeight / 4)}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="0.5"
                      />
                    ))}
                    
                    {/* Traditional NFTs area */}
                    <motion.path
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 0.2 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      d={generateAreaPath(metric.dataPoints, 'traditional', maxValue, chartHeight)}
                      fill="rgba(239, 68, 68, 0.3)" // red-500 with opacity
                    />
                    
                    {/* Traditional NFTs line */}
                    <motion.path
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: index * 0.1 }}
                      d={generateSvgPath(metric.dataPoints, 'traditional', maxValue, chartHeight)}
                      stroke="#ef4444" // red-500
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Scalable cToken area */}
                    <motion.path
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 0.2 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                      d={generateAreaPath(metric.dataPoints, 'scalable', maxValue, chartHeight)}
                      fill="rgba(59, 130, 246, 0.3)" // blue-500 with opacity
                    />
                    
                    {/* Scalable cToken line */}
                    <motion.path
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: index * 0.1 + 0.3 }}
                      d={generateSvgPath(metric.dataPoints, 'scalable', maxValue, chartHeight)}
                      stroke="#3b82f6" // blue-500
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  
                  {/* Chart legend */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-zinc-500 px-1">
                    <span>0</span>
                    <span>Time</span>
                  </div>
                </div>
                
                {/* Metrics comparison */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div>
                      <div className="text-xs text-zinc-400">Traditional</div>
                      <div className="text-sm text-white">{metric.traditional}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <div>
                      <div className="text-xs text-zinc-400">Scalable</div>
                      <div className="text-sm text-blue-400">{metric.scalable}</div>
                    </div>
                  </div>
                </div>
                
                {/* Improvement indicator */}
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                  <span className="text-sm font-bold text-indigo-400">
                    {metric.improvement}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
        
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
