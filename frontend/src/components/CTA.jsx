import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { Link } from 'react-router-dom';

export default function CTA() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cta-content > *', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="relative py-32 md:py-48 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-green-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="cta-content relative z-10 max-w-4xl mx-auto text-center px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-green-400 font-medium mb-6">
          Get Started
        </p>
        <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.05]">
          Ready to transform<br />
          your <span className="text-gradient">procurement?</span>
        </h2>
        <p className="text-green-400 text-lg max-w-xl mx-auto mb-12 font-light leading-relaxed">
          Join thousands of teams that trust VendorBridge to streamline their vendor operations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="group relative px-10 py-4 bg-green-500 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_60px_rgba(37,99,235,0.35)] hover:scale-105 active:scale-95"
            data-cursor="pointer"
          >
            <span className="relative z-10 flex items-center gap-2 text-sm">
              Start Free Trial
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-\[#9A8678\] to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          <Link
            to="/login"
            className="px-10 py-4 rounded-full text-sm font-medium text-white border border-white/10 hover:border-white/25 hover:text-white transition-all duration-300 inline-block"
            data-cursor="pointer"
          >
            Schedule a Demo
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-600 font-light">
          No credit card required · 14-day free trial · Cancel anytime
        </p>
      </div>
    </section>
  );
}
