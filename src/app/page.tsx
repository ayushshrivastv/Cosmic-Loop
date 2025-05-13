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
        <span className="text-white">Cosmic</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-600 ml-1">Loop</span>
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
                Cosmic Loop where Solana Meets the World
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
                In today's increasingly digital world, where the lines between virtual and physical experiences are constantly blurring, a new kind of platform is emerging—one that captures not just data, but moments, memories, and presence. That platform is Cosmic Loop, a groundbreaking omnichain solution that is quietly but powerfully transforming how we engage with events, one attendance token at a time.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                At its heart, Cosmic Loop is a celebration of showing up. Whether you're standing in the crowd at a packed music festival or tuning into a webinar from across the globe, your participation matters. And now, thanks to blockchain technology, there's a way to honor that moment in time—permanently and meaningfully. Cosmic Loop specializes in NFT-based event attendance verification, a new way to mark your presence not with paper tickets or check-ins, but with a digital artifact that lives forever on the blockchain.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                These NFTs aren't just novelty items; they're unique, verifiable proof that you were there. They represent a shared moment in time, a digital badge of belonging. For attendees, these tokens serve as collectible memories, potential access passes to future opportunities, or even the beginning of deeper engagement with a community. For organizers, they're a powerful new tool for audience connection and post-event outreach.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                But what really sets Cosmic Loop apart is its omnichain architecture. Built with cutting-edge V2 contracts and seamlessly integrating Solana with all LayerZero-supported networks, Cosmic Loop is designed from the ground up to be flexible, accessible, and future-proof. This isn't just a Solana tool or an Ethereum alternative—it's a universal passport for event engagement across blockchains.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                This omnichain capability matters. In a fragmented blockchain landscape, Cosmic Loop bridges gaps that typically separate users, wallets, and networks. Whether you're an organizer planning your event on one chain or an attendee using another, Cosmic Loop ensures everyone connects with ease. It's about removing friction, and instead of forcing users to choose a side, it invites them all in.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                The platform's participation mechanisms are designed with real-world use in mind. For in-person events, Cosmic Loop uses simple QR code distribution. Attendees can scan and instantly claim their attendance NFT—quick, intuitive, and seamless. For remote or virtual events, the system offers direct wallet airdrops, automatically delivering proof-of-attendance tokens to users wherever they are in the world. It's elegant, adaptable, and entirely inclusive.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                Perhaps one of the most impressive innovations under Cosmic Loop's hood is its use of compressed token technology. Traditional NFT minting can be expensive, especially when scaled to large events. But with Cosmic Loop's advanced compression, minting costs are reduced by up to 1000x, enabling mass distribution without sacrificing quality or authenticity. This makes it not only practical but financially viable to issue unique tokens for events with tens of thousands—even hundreds of thousands—of participants.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                Behind the scenes, Cosmic Loop provides a powerful suite of tools for organizers. The platform isn't just built for developers or crypto veterans—it's designed to be approachable and intuitive for anyone planning an event. Organizers can create, customize, and distribute their NFTs with ease, as well as access insights and engagement data to better understand their audience. It turns event management into an interactive, data-rich experience, where every attendee counts and every interaction can lead to something more.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                From a user's perspective, Cosmic Loop turns event participation into an ongoing journey. The NFT you receive isn't just a static file—it's a living token that could unlock exclusive content, provide access to future events, or serve as a reputation badge within a growing ecosystem. The value of these tokens doesn't stop at the event's end; it can grow and evolve as the community around it does.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                What Cosmic Loop really represents is a broader shift in how we interact with digital and physical experiences. In a time where people crave authenticity, connection, and recognition, this platform offers a beautiful blend of all three. It respects the energy it takes to attend, to engage, to be present—and it gives that effort a permanent home on the blockchain.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                And while blockchain technology can often feel cold or complicated, Cosmic Loop's approach is refreshingly human. It's not about hype or speculation. It's about memories. About participation. About being there and having something to show for it—something real, even if it lives in a digital wallet.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                Looking forward, the potential applications are exciting. Imagine a future where your wallet holds a timeline of your life's most meaningful events—from the concerts you danced at, to the conferences that sparked new ideas, to the community gatherings that built lasting relationships. Cosmic Loop makes that future possible, and more importantly, it makes it personal.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                In many ways, Cosmic Loop is a quiet revolution. It doesn't try to replace how we experience events; it simply enhances them. It preserves our presence, deepens our connection, and builds a bridge between moments we cherish and the technology that can help us honor them.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                In the grand cosmic loop of life, where memories are fleeting and time moves fast, having a way to mark the moments that matter feels more important than ever. With this platform, we don't just remember—we own those moments.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                And that's something truly worth showing up for.
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
