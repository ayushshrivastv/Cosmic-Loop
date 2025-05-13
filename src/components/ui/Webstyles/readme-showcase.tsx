"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const ReadmeShowcase: React.FC = () => {
  return (
    <section className="py-16 relative overflow-hidden bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/90 -z-10"></div>
      
      {/* Subtle background image */}
      <div
        className="absolute inset-0 opacity-5 bg-cover bg-center -z-10"
        style={{ backgroundImage: 'url(/images/gradients/blue-purple-gradient.svg)' }}
      ></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Overview</span>
          </h2>
          <p className="text-zinc-300 text-lg max-w-2xl mx-auto font-serif">
            Technical details about the Scalable cToken implementation
          </p>
        </motion.div>
        
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="prose prose-lg prose-invert max-w-none font-serif"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Core Functionality</h3>
            
            <p className="text-zinc-200 text-lg leading-relaxed mb-6">
              The Scalable cToken platform represents a significant advancement in token issuance technology, leveraging Light Protocol's state compression to deliver unprecedented efficiency. Our solution addresses the fundamental challenges that have historically limited the scalability of token distribution for events, communities, and organizations.  
            </p>

            <p className="text-zinc-200 text-lg leading-relaxed mb-6">
              <span className="text-blue-300 font-medium">Token Creation</span> begins with event organizers connecting their Solana wallet and completing a simple form with event details. Behind the scenes, our platform utilizes Light Protocol's compressed token standard to create tokens at a fraction of the cost of traditional methods. The system then automatically generates QR codes embedded with Solana Pay URLs, enabling seamless distribution to attendees.
            </p>
            
            <p className="text-zinc-200 text-lg leading-relaxed mb-10">
              The <span className="text-blue-300 font-medium">Token Claiming</span> process is equally streamlined. Attendees simply scan the provided QR code with any Solana Pay-compatible wallet, triggering an on-chain verification process. Once validated, tokens are transferred directly to the user's wallet using compressed token transfer functions, ensuring both security and efficiency throughout the process.
            </p>

            <h3 className="text-2xl font-bold text-white mb-6 text-center mt-12">Compression Technology</h3>
            
            <p className="text-zinc-200 text-lg leading-relaxed mb-6">
              At the core of our solution is Light Protocol's revolutionary compression technology. This innovative approach utilizes <span className="text-blue-300 font-medium">Zero-Knowledge Proofs</span> to enable efficient on-chain storage while preserving cryptographic verification, fundamentally changing what's possible with on-chain token issuance.
            </p>
            
            <p className="text-zinc-200 text-lg leading-relaxed mb-6">
              The implementation organizes token data in compressed <span className="text-blue-300 font-medium">Merkle Trees</span>, allowing thousands of tokens to be represented by a single on-chain commitment. This architectural decision delivers extraordinary space efficiency without compromising security or functionality.
            </p>
            
            <p className="text-zinc-200 text-lg leading-relaxed mb-10">
              Our platform supports <span className="text-blue-300 font-medium">Concurrent Minting</span>, enabling parallel token issuance without chain congestion—a critical feature for high-volume events. Despite the compression techniques employed, tokens maintain <span className="text-blue-300 font-medium">Verifiable Ownership</span> with full composability with other Solana protocols, ensuring they function seamlessly within the broader ecosystem.
            </p>

            <h3 className="text-2xl font-bold text-white mb-6 text-center mt-12">Scalability Highlights</h3>
            
            <p className="text-zinc-200 text-lg leading-relaxed mb-6">
              The scalability advantages of our approach are substantial. The platform delivers <span className="text-blue-300 font-medium">Massive Throughput</span>, capable of supporting events with 10,000+ attendees through Light Protocol's compressed NFTs. This represents a transformative improvement over traditional methods that struggle with even modest distribution volumes.
            </p>
            
            <p className="text-zinc-200 text-lg leading-relaxed mb-6">
              Perhaps most impressive is the <span className="text-blue-300 font-medium">Cost Efficiency</span> achieved—a 99.9% reduction in storage costs compared to traditional NFTs. At approximately 0.000005 SOL per token versus the standard 0.005 SOL, organizers can distribute tokens at scale without prohibitive costs.
            </p>
            
            <p className="text-zinc-200 text-lg leading-relaxed mb-10">
              The platform's <span className="text-blue-300 font-medium">Network Efficiency</span> reduces on-chain storage requirements by up to 1000x while maintaining full L1 security guarantees. Our <span className="text-blue-300 font-medium">Batch Processing</span> capabilities are optimized for high-volume token issuance with minimal network congestion, ensuring smooth operation even during peak demand periods.
            </p>

            <h3 className="text-2xl font-bold text-white mb-6 text-center mt-12">Technical Implementation</h3>
            
            <p className="text-zinc-200 text-lg leading-relaxed mb-6">
              Our technical implementation leverages modern web technologies to deliver a seamless user experience. The UI framework is built with Tailwind CSS for styling and shadcn/ui for component primitives, following responsive design principles for optimal mobile compatibility. The platform also supports dark/light mode via next-themes, ensuring accessibility across different user preferences.
            </p>
            
            <p className="text-zinc-200 text-lg leading-relaxed mb-6">
              Security has been a primary consideration throughout development. Wallet connections implement standard Solana wallet adapter security practices, with no private keys stored in the application. All blockchain transactions require explicit user approval, and comprehensive input validation is implemented for all user inputs to prevent potential vulnerabilities.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
