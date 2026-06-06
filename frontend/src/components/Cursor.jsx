import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Check for touch device
    if ('ontouchstart' in window) return;

    const moveCursor = (e) => {
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
      });
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.55,
        ease: 'power2.out',
      });
    };

    const grow = () => {
      gsap.to(dot, { scale: 2.5, backgroundColor: 'rgba(37,99,235,0.6)', duration: 0.3 });
      gsap.to(ring, { scale: 1.8, opacity: 0, duration: 0.3 });
    };

    const shrink = () => {
      gsap.to(dot, { scale: 1, backgroundColor: '#2563eb', duration: 0.3 });
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 });
    };

    window.addEventListener('mousemove', moveCursor);

    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [data-cursor="pointer"]').forEach((el) => {
        el.removeEventListener('mouseenter', grow);
        el.removeEventListener('mouseleave', shrink);
        el.addEventListener('mouseenter', grow);
        el.addEventListener('mouseleave', shrink);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial bind
    document.querySelectorAll('a, button, [data-cursor="pointer"]').forEach((el) => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      observer.disconnect();
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{ backgroundColor: '#2563eb' }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 border border-\[#9A8678\]/30"
      />
    </>
  );
}
