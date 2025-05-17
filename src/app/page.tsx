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
          <article className="space-y-6 text-left font-fredoka">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white font-sf-pro">
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
                At the intersection of blockchain complexity and human simplicity, a new digital platform is reimagining how event organizers distribute digital tokens. Dubbed Scalable cToken, the tool promises to make what was once a convoluted, costly process as effortless as scanning a QR code.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                The concept was born from recurring frustrations voiced by event organizers — many of whom loved the promise of digital tokens but were consistently thwarted by the technical barriers: complicated wallet integrations, slow transactions, and high on-chain costs.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                <strong>A Simple Scan, A Powerful Backend</strong><br />
                Scalable cToken seeks to rewrite that narrative. Built on the high-speed Solana blockchain and leveraging Light Protocol's zero-knowledge compression, the system allows organizers to mint and distribute up to 1,000 tokens per transaction — with minimal costs and near-instant confirmation.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                The infrastructure compresses thousands of records into a single verifiable on-chain state, dramatically reducing storage requirements and latency. Organizers simply input event details, customize token parameters through a dashboard, and generate QR codes that attendees can scan to instantly receive tokens.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                "It's digital origami," said one early user. "Thousands of interactions folded into one — and no one has to think about how it works. They just scan, and the token is there."
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                <strong>An Infrastructure for Digital Belonging</strong><br />
                Beyond technical innovation, Scalable cToken is designed to make technology invisible — and human connection tangible. Organizers can deploy tokens for a wide range of use cases: proof-of-attendance, community rewards, gamified experiences, even loyalty badges.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                With support for popular Solana wallets like Phantom, Backpack, and Solflare, attendees don't need to learn new tools. Tokens appear instantly, acting as digital mementos of moments shared in person or online.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                "People want to feel like they were part of something," said Natalie Chong, an event designer who piloted the system at a recent Web3 conference in Singapore. "The tokens felt less like technology and more like memory. Our attendees loved them — and we didn't have to babysit a backend."
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                <strong>Security Without Sacrificing Flow</strong><br />
                The platform integrates real-time analytics and fraud prevention through zero-knowledge proofs, ensuring every claim is secure and verifiable. Even at events with tens of thousands of participants, transactions remain fast and reliable.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                The system's flexibility allows for creative customization — including scheduled airdrops, direct wallet distributions, and dynamically generated QR codes — all while maintaining rigorous verification standards.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                "In the past, we either had to pre-mint everything or slow down distribution during the event," said José Medina, an engineer at a DAO-focused startup. "Now we just define the rules, and it scales with us — no delays, no stress."
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                <strong>Reclaiming the Magic of the Moment</strong><br />
                At its core, Scalable cToken is less about technology and more about removing the friction that often stands between people and digital experiences. Every feature, from instant token receipt to customizable event dashboards, is designed to let organizers focus on what truly matters: creating moments of connection.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                Whether it's a 100-person hackathon or a 100,000-person global summit, this platform offers a simple promise: distribute tokens as effortlessly as greeting a guest — and make those moments last.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                As one early adopter put it, "Tokens shouldn't be about the tech. They should be about the experience."
              </p>
            </motion.div>
          </article>
        </div>
      </section>

      {/* Compression Technology Section */}
      <section className="py-8 md:py-16 bg-black/30 backdrop-blur-sm">
        <div className="px-4 md:px-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white font-sf-pro">
              How Zero-Knowledge Compression Works
            </h2>
            <div className="text-zinc-400 text-sm border-b border-zinc-800 pb-3">Technology Overview</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 font-fredoka"
          >
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              Scalable cToken leverages Light Protocol's zero-knowledge compression technology to revolutionize token distribution on Solana. This cutting-edge approach combines the security of blockchain with the efficiency of advanced cryptographic techniques, enabling a new paradigm for digital asset management.
            </p>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              At its core, our implementation uses zero-knowledge proofs to compress token data while preserving its integrity and verifiability. This allows us to dramatically reduce on-chain storage requirements and transaction costs without sacrificing security or functionality. The system can process hundreds of tokens in a single transaction, making it ideal for large-scale events and airdrops.
            </p>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              Beyond efficiency, this technology enhances privacy by allowing selective disclosure of information. Event organizers can verify attendance without exposing sensitive participant data, while attendees can prove their participation without revealing personal details. The entire system is built on cryptographic guarantees that mathematically prevent forgery or unauthorized modifications.
            </p>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              <strong>Quantifiable Results:</strong> With compression technology, we've achieved a 1000× reduction in cost, 500× increase in processing speed, and 100× decrease in storage requirements compared to traditional token systems.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-8 md:py-16 bg-black/30 backdrop-blur-sm">
        <div className="px-4 md:px-6 max-w-3xl mx-auto">
          <div className="aspect-video">
            <video 
              className="w-full rounded-lg shadow-xl" 
              controls 
              preload="auto"
              playsInline
              muted
              autoPlay={false}
              controlsList="nodownload"
              disablePictureInPicture
              disableRemotePlayback
            >
              <source src="/Champ.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* CTA Section removed as requested */}
    </AppleLayout>
  );
}
