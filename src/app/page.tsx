"use client";

import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { AppleLayout } from '@/components/layouts/apple-layout';
import { HeroSection } from '@/components/ui/Webstyles/hero-section';
import { FeatureSection } from '@/components/ui/Webstyles/feature-section';
import { SpecGrid } from '@/components/ui/Webstyles/spec-grid';
import { CTASection } from '@/components/ui/Webstyles/cta-section';
import { ReadmeShowcase } from '@/components/ui/Webstyles/readme-showcase';
import { BenefitsChart } from '@/components/ui/Webstyles/benefits-chart';
import { FeatureHighlight } from '@/components/ui/Webstyles/feature-highlight';
import { ParticlesBackground } from '@/components/ui/particles-background';
import { motion } from 'framer-motion';
import { QuantifiedBenefits } from '@/components/ui/Webstyles/quantified-benefits';

// Icon components for feature section
const ZkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <path d="M6 12h12"/>
    <path d="M8 10v4"/>
    <path d="M16 10v4"/>
  </svg>
);

const QrIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const TokenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

const specItems = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Bulk Airdrops',
    description: 'Send tokens to thousands of recipients simultaneously with minimal transaction fees.',
  },
  {
    icon: <QrIcon />,
    title: 'QR Code Distribution',
    description: 'Generate dynamic QR codes that attendees can scan to instantly receive their tokens.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    title: 'Custom Branding',
    description: 'Personalize tokens with your event logo and brand identity for a professional look.',
  },
  {
    icon: <TokenIcon />,
    title: 'Event Metadata',
    description: 'Attach detailed event information to tokens, creating lasting digital mementos.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Fraud Prevention',
    description: 'Secure verification ensures only authorized attendees can claim tokens.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10H12V2Z"/>
        <path d="M21.17 8H12V2.83c2 .17 4.3 1.53 5.5 2.75 2.1 2.07 3.5 3.9 3.67 5.42Z"/>
      </svg>
    ),
    title: 'Analytics Dashboard',
    description: 'Track token distribution and engagement with real-time analytics.',
  },
];

// Benefits metrics data for comparison table
const benefitsMetrics = [
  {
    metric: 'Storage Cost per Token',
    traditional: '~0.005 SOL',
    scalable: '~0.000005 SOL',
    improvement: '1000x reduction'
  },
  {
    metric: 'Tokens per Transaction',
    traditional: '1',
    scalable: 'Up to 1,000',
    improvement: '1000x throughput'
  },
  {
    metric: 'Gas Fees for 10,000 Tokens',
    traditional: '~50 SOL',
    scalable: '~0.05 SOL',
    improvement: '1000x savings'
  },
  {
    metric: 'Claim Transaction Time',
    traditional: '2-5 seconds',
    scalable: '2-5 seconds',
    improvement: 'Equal UX'
  },
  {
    metric: 'Maximum Event Size',
    traditional: '~1,000 attendees',
    scalable: '100,000+ attendees',
    improvement: '100x scalability'
  },
  {
    metric: 'Token Issuance Speed',
    traditional: '~10 tokens/min',
    scalable: '~5,000 tokens/min',
    improvement: '500x faster'
  }
];

export default function Home() {
  // Custom title component with gradient styling
  const heroTitle = (
    <div className="space-y-2">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-7xl font-bold tracking-tight text-white"
      >
        <span className="text-white">Solana</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-600 ml-1">OpenAPI</span>
      </motion.h1>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-3xl md:text-5xl font-bold tracking-tight text-white"
      >
        Issuance via Solana Pay
      </motion.h2>
    </div>
  );

  return (
    <AppleLayout>
      {/* Animated particles background */}
      <ParticlesBackground />
      {/* Hero Section */}
      <HeroSection
        title={heroTitle}
        subtitle="The Future of Event Attendance with NFTs"
      />

      {/* Project Overview Section */}
      <section className="py-8 md:py-16 bg-black/30 backdrop-blur-sm">
        <div className="px-4 md:px-6 max-w-3xl mx-auto">
          <article className="space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Solana OpenAPI: Real-time Blockchain Data Access
              </h1>
              <div className="text-zinc-400 text-sm border-b border-zinc-800 pb-3">Posted by Ayush Srivastava · May 14</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                In the rapidly evolving world of blockchain technology, access to real-time data has become a critical factor for developers, analysts, and users alike. Introducing Solana OpenAPI, a groundbreaking interface that is transforming how we interact with on-chain data, providing unprecedented access to the Solana blockchain's rich ecosystem.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                At its core, Solana OpenAPI is about democratizing blockchain data. Whether you're a developer building the next generation of DeFi applications, an analyst tracking market trends, or a user wanting insights about your digital assets, having immediate access to accurate blockchain data is essential. Solana OpenAPI specializes in real-time data retrieval and analysis, powered by The Graph's Substreams technology.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                This isn't just another blockchain explorer or API endpoint. Solana OpenAPI provides an AI-powered interface that understands natural language queries, translating them into precise data requests. Users can ask questions about NFTs, marketplace activities, wallet histories, and cross-chain operations in plain English, receiving structured, accurate responses in seconds.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                What truly sets Solana OpenAPI apart is its integration with Substreams technology. Built to handle Solana's impressive throughput of over 65,000 transactions per second, Substreams enables parallel processing of blockchain data with minimal latency. This means users get near-instant responses to their queries, even when requesting complex analytics or historical data.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                This capability matters tremendously in the fast-paced world of blockchain. When market conditions change in seconds, having to wait minutes or hours for data processing can mean missed opportunities. Solana OpenAPI ensures everyone has access to the same high-quality, real-time information, leveling the playing field between institutional players and individual users.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                The platform's interface is designed with real-world use cases in mind. Developers can integrate Solana OpenAPI directly into their applications, analysts can perform complex queries without writing code, and everyday users can ask simple questions about their assets or market conditions. It's intuitive, responsive, and remarkably powerful.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                Perhaps one of the most impressive innovations behind Solana OpenAPI is its modular architecture. The system leverages custom Substreams modules written in Rust, which transform raw blockchain data into clean, usable streams. These modules can be combined and reused, allowing for complex data transformations without duplicating effort or resources.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                Behind the scenes, Solana OpenAPI provides a powerful suite of tools for developers and data analysts. The platform isn't just built for blockchain experts or crypto veterans—it's designed to be approachable and intuitive for anyone who needs access to on-chain data. Users can query complex blockchain information without writing a single line of code, while developers can build sophisticated applications on top of the API with minimal effort.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                From a user's perspective, Solana OpenAPI transforms blockchain data access into an intuitive experience. The natural language interface isn't just a convenience—it's a paradigm shift that makes blockchain data accessible to everyone, regardless of technical background. Ask a question about NFT trading volumes, bridge transaction status, or wallet activity, and receive clear, actionable insights immediately.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                What Solana OpenAPI truly represents is a democratization of blockchain data. In a space where information asymmetry can create significant advantages, this platform levels the playing field by giving everyone access to the same high-quality, real-time data. It respects that data-driven decision making should be available to all participants in the ecosystem, not just those with technical expertise or expensive infrastructure.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                And while blockchain technology can often feel complex or intimidating, Solana OpenAPI's approach is refreshingly accessible. It's not about technical jargon or complicated queries. It's about answers. About insights. About understanding what's happening on-chain and making informed decisions based on that knowledge.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                Looking forward, the potential applications are vast. Imagine a future where DeFi protocols automatically adjust based on real-time market data, NFT marketplaces provide instant analytics to creators and collectors, and cross-chain bridges optimize for efficiency using historical transaction patterns. Solana OpenAPI makes these futures possible by providing the data foundation they require.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                In many ways, Solana OpenAPI represents a quiet revolution in blockchain infrastructure. It doesn't try to replace existing systems; it enhances them by making their data more accessible, usable, and valuable. It bridges the gap between raw blockchain data and actionable insights that drive innovation and growth.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                In the fast-moving world of blockchain, where every second counts and information is power, having immediate access to accurate, comprehensive data is essential. With Solana OpenAPI, we don't just see the blockchain—we understand it.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                And that's something truly worth showing up for.
              </p>
            </motion.div>
          </article>
        </div>
      </section>

      {/* Feature Sections Container removed */}

      {/* CTA Section removed */}
    </AppleLayout>
  );
}
