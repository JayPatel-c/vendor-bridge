import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title lines stagger reveal
      gsap.from('.hero-line', {
        y: 120,
        opacity: 0,
        rotateX: -30,
        duration: 1.6,
        stagger: 0.15,
        ease: 'power4.out',
        delay: 0.6,
      });

      // Subtitle fade in
      gsap.from('.hero-sub', {
        y: 40,
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out',
        delay: 1.3,
      });

      // CTA button
      gsap.from('.hero-cta', {
        scale: 0.85,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.5)',
        delay: 1.6,
      });

      // Badge
      gsap.from('.hero-badge', {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3,
      });

      // Parallax on scroll
      gsap.to(bgRef.current, {
        y: '35%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(contentRef.current, {
        y: '25%',
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '80% top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="platform"
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Background layers */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-gradient-radial from-\[#9A8678\]/8 via-transparent to-transparent rounded-full" />
        {/* Floating orbs */}
        <div className="absolute top-[20%] left-[15%] w-[35vw] h-[35vw] bg-green-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[15%] right-[10%] w-[25vw] h-[25vw] bg-green-500/8 rounded-full blur-[100px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs text-green-400 font-medium mb-8 tracking-wide uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Vendor Management Platform
        </div>

        {/* Title */}
        <div className="overflow-hidden mb-2">
          <h1 className="hero-line text-[clamp(3rem,8vw,7rem)] font-bold tracking-[-0.04em] leading-[0.95] text-white">
            Procurement
          </h1>
        </div>
        <div className="overflow-hidden mb-8">
          <h1 className="hero-line text-[clamp(3rem,8vw,7rem)] font-bold tracking-[-0.04em] leading-[0.95] text-gradient">
            Reimagined.
          </h1>
        </div>

        {/* Subtitle */}
        <p className="hero-sub text-lg md:text-xl text-green-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
          From RFQs to approved invoices — VendorBridge unifies your entire
          procurement workflow in one premium, intelligent workspace.
        </p>

        {/* CTA */}
        <div className="hero-cta flex items-center justify-center gap-4">
          <Link
            to="/login"
            className="group relative px-8 py-4 bg-green-500 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 flex items-center gap-2 text-sm"
            data-cursor="pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Platform
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-\[#9A8678\] to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          <a
            href="#features"
            className="px-8 py-4 rounded-full text-sm font-medium text-white border border-white/10 hover:border-white/25 hover:text-white transition-all duration-300 block"
            data-cursor="pointer"
          >
            Watch Demo
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-green-400">Scroll</span>
        <div className="w-px h-16 bg-gradient-to-b from-\[#9A8678\]/60 to-transparent" />
      </div>
    </section>
  );
}
