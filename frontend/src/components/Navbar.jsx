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
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight">
            Vendor<span className="text-green-400">Bridge</span>
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
