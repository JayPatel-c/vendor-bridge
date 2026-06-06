import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${scrolled
          ? 'py-4 bg-[#0A0E0D]/80  border-b border-white/10 shadow-2xl'
          : 'py-6 bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" data-cursor="pointer">
          <svg className="w-8 h-8 text-green-500 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {/* Horizontal road */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 15h20" />
            {/* Two pillars */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 19V5M17 19V5" />
            {/* Main middle cable */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 5c2.5 6 7.5 6 10 0" />
            {/* Outer cables */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 5C4 7 2 11 2 15M17 5c3 2 5 6 5 10" />
            {/* Suspender lines */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v5M9.5 8v7M14.5 8v7" />
          </svg>
          <span className="text-xl font-semibold tracking-tight text-white">
            VendorBridge
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Platform', 'Features', 'Workflow', 'Pricing'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-green-400 hover:text-white transition-colors duration-300 relative group"
              data-cursor="pointer"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-green-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/login"
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 hover:bg-green-500/10 hover:border-\[#9A8678\]/30 transition-all duration-300"
          data-cursor="pointer"
        >
          Get Started
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </nav>
  );
}
