"use client";

import React, { ReactNode, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface HeroSectionProps {
  title: ReactNode;
  subtitle: string;
  backgroundImage?: string; // This prop is not currently used in the background effect
}

// --- Enhanced Particle Class ---
class Particle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  size: number = 0;
  opacity: number = 0;
  element: HTMLDivElement | null; // Can be null after destroy
  container: HTMLDivElement;
  private windowWidth: number;
  private windowHeight: number;

  constructor(containerElement: HTMLDivElement, initialWindowWidth: number, initialWindowHeight: number) {
    this.container = containerElement;
    this.windowWidth = initialWindowWidth;
    this.windowHeight = initialWindowHeight;
    this.element = document.createElement('div');
    this.element.classList.add('particle'); // Your CSS class for particles
    this.container.appendChild(this.element);
    this.reset();
  }

  // Update window dimensions if they change
  updateDimensions(newWidth: number, newHeight: number) {
    this.windowWidth = newWidth;
    this.windowHeight = newHeight;
  }

  reset() {
    this.x = Math.random() * this.windowWidth;
    this.y = Math.random() * this.windowHeight;
    
    this.vx = (Math.random() - 0.5) * 0.15; // Slow horizontal drift
    this.vy = -(Math.random() * 0.25 + 0.05); // Slow upward movement

    this.size = Math.random() * 1.2 + 0.3; // Size: 0.3px to 1.5px
    this.opacity = Math.random() * 0.6 + 0.1; // Opacity: 0.1 to 0.7

    if (this.element) {
      this.element.style.width = `${this.size}px`;
      this.element.style.height = `${this.size}px`;
      this.element.style.opacity = String(this.opacity); // Ensure opacity is a string
      this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Boundary conditions
    if (this.y + this.size < 0) { // Particle moved off top
      this.y = this.windowHeight + this.size; // Reset to bottom
      this.x = Math.random() * this.windowWidth; // New random x
    }
    // Horizontal wrapping
    if (this.x + this.size < 0) { // Particle moved off left
      this.x = this.windowWidth + this.size; // Wrap to right
    } else if (this.x - this.size > this.windowWidth) { // Particle moved off right
      this.x = -this.size; // Wrap to left
    }

    if (this.element) {
      this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }
  }

  // Method to remove the particle element from the DOM
  destroy() {
    if (this.element && this.element.parentNode === this.container) {
      this.container.removeChild(this.element);
    }
    this.element = null; // Set to null to indicate it's destroyed
  }
}
// --- End of Particle Class ---

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  // backgroundImage prop is available but not used for the dynamic background
}) => {
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  const particlesArrayRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const numberOfParticles = 250; // Configurable

  // Memoized function to initialize particles
  const initParticles = useCallback(() => {
    if (!particlesContainerRef.current) return;

    const container = particlesContainerRef.current;
    
    // Clean up existing particles before re-initializing
    particlesArrayRef.current.forEach(particle => particle.destroy());
    particlesArrayRef.current = [];
    // container.innerHTML = ''; // Clearing via destroy() is generally safer

    const currentWindowWidth = window.innerWidth;
    const currentWindowHeight = window.innerHeight;
    
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArrayRef.current.push(new Particle(container, currentWindowWidth, currentWindowHeight));
    }
  }, [numberOfParticles]); // Dependency: numberOfParticles

  // Memoized function to animate particles
  const animateParticles = useCallback(() => {
    particlesArrayRef.current.forEach(particle => particle.update());
    animationFrameIdRef.current = requestAnimationFrame(animateParticles);
  }, []); // No direct dependencies as it operates on refs

  // Effect for initialization, animation, resize handling, and cleanup
  useEffect(() => {
    initParticles(); // Initialize on mount
    animationFrameIdRef.current = requestAnimationFrame(animateParticles); // Start animation

    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      // Allow particles to know new dimensions before full re-init
      particlesArrayRef.current.forEach(particle => particle.updateDimensions(newWidth, newHeight));
      initParticles(); // Re-initialize particles for new screen size
    };

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250); // Debounce resize event
    };

    window.addEventListener('resize', debouncedResize);

    // Cleanup function
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout); // Clear timeout on unmount
      // Ensure all particle DOM elements are removed on component unmount
      particlesArrayRef.current.forEach(particle => particle.destroy());
      particlesArrayRef.current = [];
    };
  }, [initParticles, animateParticles]); // Effect dependencies

  return (
    // Main section container
    <section 
      className="relative w-full h-screen overflow-hidden hero-section-main-container" // Added a class for the new ::before
      style={{ backgroundColor: '#000000', overflowX: 'hidden' }} // Pure black background
      aria-label="Hero section with animated background and content"
    >
      {/* Embedded global styles for particles and background curves */}
      <style jsx global>{`
        /* Your existing particle styling */
        .particle {
          position: absolute; 
          background-color: white;
          border-radius: 50%;
          will-change: transform, opacity; 
        }

        /* Enhanced horizon glow styling */
        .hero-horizon::after {
          content: "";
          position: absolute;
          bottom: -60vh; 
          left: 50%;
          transform: translateX(-50%);
          width: 280vw; 
          height: 100vh; 
          background: radial-gradient(
              ellipse at center bottom,
              rgba(220, 235, 255, 1) 0%,
              rgba(200, 220, 255, 0.95) 3%,
              rgba(130, 160, 220, 0.50) 10%,
              rgba(80, 100, 170, 0.34) 20%,
              transparent 35%
          );
          border-radius: 50%;
          filter: blur(25px);
          pointer-events: none;
        }

        /* Your existing bottom fade styling */
        .bottom-fade {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 30vh;
          background: linear-gradient(to bottom, transparent, var(--background) 95%);
          z-index: 3;
          pointer-events: none;
        }
      `}</style>

      {/* Particles container - z-index 10 */}
      <div 
        ref={particlesContainerRef}
        className="absolute top-0 left-0 w-full h-full overflow-hidden z-[10] pointer-events-none"
        aria-hidden="true" // Decorative particles
      />

      {/* Horizon glow effect container - z-index 1 */}
      <div 
        className="absolute inset-0 hero-horizon z-[1]" 
        aria-hidden="true" 
      />

      {/* Extended gradient to fade to page bottom - z-index 3 */}
      <div className="bottom-fade" aria-hidden="true" />

      {/* Content - z-index 20 */}
      <div className="relative z-[20] flex flex-col items-center justify-center h-full px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center max-w-5xl"
        >
          {/* Main title */}
          <div className="mb-6">
            {typeof title === 'string' ? (
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                {title}
              </h1>
            ) : (
              title 
            )}
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-8"
          >
            {subtitle}
          </motion.p>
          
          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link 
              href={ROUTES.MINT} 
              className="rounded-full bg-white hover:bg-white/90 px-8 py-3 text-base font-semibold text-black shadow-lg hover:shadow-white/25 transition-all duration-300 flex items-center justify-center min-w-[180px] group"
            >
              Create Event
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link 
              href={ROUTES.CLAIM} 
              className="px-8 py-3 text-base font-semibold text-white/80 hover:text-white transition-all duration-300 flex items-center justify-center min-w-[180px] group"
            >
              Claim Token
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.8, delay: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute bottom-8" // z-index will be inherited from parent content div (z-20)
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path 
                d="M12 5L12 19M12 19L5 12M12 19L19 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
