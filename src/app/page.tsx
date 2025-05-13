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
        Scalable <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-600">cToken</span>
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
        subtitle="High throughput token issuance and distribution powered by Light Protocol's state compression technology"
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
                Scalable cToken Decentralized Token System
              </h1>
              <div className="text-zinc-400 text-sm border-b border-zinc-800 pb-3">Posted by Ayush Srivastava · May 12</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                Imagine a world where distributing digital tokens is as simple as sharing smiles at your event. That's the vision I've brought to life with Scalable cToken. Born from countless conversations with event organizers who struggled with complex token systems, I've crafted a platform that transforms the way digital tokens flow through the Solana ecosystem. At its heart lies an elegantly simple process: connect your wallet, breathe life into your event details, and watch as tokens spring to life through Light Protocol's groundbreaking compression technology. I've distilled the entire claiming process down to a single scan of a QR code – because I believe technology should fade into the background while human connections take center stage.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                The magic happens in my innovative use of Zero-Knowledge compression – think of it as digital origami, where instead of thousands of separate pieces, I fold everything into a single, beautiful, verifiable on-chain record. This isn't just about numbers; it's about making the impossible possible. I've slashed storage costs by an astounding 1000x and opened the doors to distributing up to 1,000 tokens in a single heartbeat. Even when your event swells to 100,000+ attendees, every interaction remains swift and secure, ensuring your community stays connected without breaking the bank.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                My journey began with a simple question: what if I could make token distribution as natural as greeting guests at your event? Today, that dream has become reality. Whether you're orchestrating an intimate hackathon or conducting a symphony of interactions at a global conference, my platform stands ready as your trusted partner. I've woven together instant verification, fraud prevention, and real-time analytics into a seamless tapestry that adapts to your needs. Event organizers can shape their digital experiences with the same care they put into crafting physical ones – customizing metadata, defining parameters, and monitoring engagement through an intuitive dashboard that feels like a natural extension of their vision.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                The beauty of my system lies in its flexibility and human-centered design. For organizers, I've created a canvas where creativity knows no bounds – distribute tokens through elegant QR codes at in-person gatherings or bridge digital distances with direct wallet addresses. Schedule airdrops that feel like digital rain or craft personalized claiming experiences, all while maintaining rock-solid security through thoughtfully designed verification systems. For participants, I've eliminated the technological barriers that often stand between people and their digital memories. A simple scan connects them to their tokens, working harmoniously with familiar wallets like Phantom, Backpack, and Solflare. Tokens appear in wallets like magic, creating lasting digital mementos of shared experiences.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                In crafting Scalable cToken, I've done more than build a platform – I've created a bridge between the technical complexity of blockchain and the warmth of human interaction. Every feature, from the instant token receipt to the comprehensive event tracking, has been lovingly designed with one goal in mind: to let event organizers focus on what truly matters – creating meaningful connections and memorable experiences. I've hidden the complex blockchain machinery behind a curtain of simplicity, ensuring that whether you're a tech-savvy developer or a first-time token distributor, you'll find a welcoming home in this ecosystem. Welcome to the future of token distribution – where technology serves humanity, not the other way around.
              </p>
            </motion.div>
          </article>
        </div>
      </section>

      {/* Feature Sections Container */}
      <section className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Airdrop Capabilities Section */}
        <article className="space-y-16">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-white text-center">
              Airdrop Capabilities
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed">
              Revolutionize your event token distribution with our advanced airdrop system. Seamlessly manage large-scale token distributions while maintaining security and cost-effectiveness.
            </p>
          </div>

          <div className="space-y-16">
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-semibold text-white text-center">
                Bulk Distribution
              </h3>
              <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
                Transform event token distribution with our revolutionary bulk transfer system. Send tokens to thousands of recipients simultaneously while maintaining security and reducing costs. Perfect for large-scale events and community airdrops.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-semibold text-white text-center">
                Cost Efficiency
              </h3>
              <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
                Experience unprecedented savings with our compression technology. Reduce storage costs by 1000x compared to traditional methods, making large-scale token distribution accessible to events of any size.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-semibold text-white text-center">
                Real-time Analytics
              </h3>
              <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
                Monitor your token distribution with precision through our comprehensive dashboard. Track claim rates, engagement metrics, and distribution progress in real-time, ensuring complete visibility over your event's success.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-white text-center">
              Solana Pay Integration
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed">
              Leverage the power of Solana's high-performance blockchain for instant, secure token transfers. Our integration ensures smooth, reliable transactions with minimal fees and maximum efficiency.
            </p>
          </div>

          <div className="space-y-16">
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-semibold text-white text-center">
                Secure by Design
              </h3>
              <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
                Built with security at its core, our platform leverages state-of-the-art cryptography to protect every transaction. Your tokens remain safe from creation to distribution, with built-in verification at every step.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-semibold text-white text-center">
                Instant Settlement
              </h3>
              <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
                Experience the speed of Solana with instant token transfers and immediate settlement. No more waiting for confirmations or dealing with slow networks. Your tokens arrive in wallets within seconds.
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Ready to get started?"
        description="Create your first proof-of-participation token in minutes."
        primaryButtonText="Create Event Token"
        primaryButtonLink={ROUTES.MINT}
        secondaryButtonText="Claim Your Token"
        secondaryButtonLink={ROUTES.CLAIM}
      />
    </AppleLayout>
  );
}
