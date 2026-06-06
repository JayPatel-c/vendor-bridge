import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const showcaseItems = [
  {
    title: 'Dashboard Overview',
    description: 'Real-time insights across your entire procurement pipeline — vendors, RFQs, approvals, and spend analytics at a glance.',
    image: '/dashboard.png',
  },
  {
    title: 'Vendor Management',
    description: 'Organize, evaluate, and manage your vendor relationships with powerful search, filtering, and rating systems.',
    image: '/vendors.png',
  },
  {
    title: 'Reports & Analytics',
    description: 'Deep-dive into spend patterns, vendor performance, and procurement efficiency with beautiful, actionable charts.',
    image: '/analytics.png',
  },
];

function ShowcaseCard({ item, index }) {
  const cardRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Card fade in from bottom
      gsap.from(cardRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
        },
      });

      // Image scale expansion on scroll
      gsap.from(imageRef.current, {
        scale: 0.88,
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 80%',
          end: 'top 40%',
          toggleActions: 'play none none reverse',
        },
      });

      // Parallax on the image container
      gsap.to(imageRef.current, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  const isReversed = index % 2 !== 0;

  return (
    <div
      ref={cardRef}
      className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
    >
      {/* Text */}
      <div className="flex-1 max-w-lg">
        <div className="inline-flex items-center gap-2 text-green-400 text-xs font-medium uppercase tracking-widest mb-4">
          <div className="w-8 h-px bg-green-500" />
          0{index + 1}
        </div>
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
          {item.title}
        </h3>
        <p className="text-green-400 text-base leading-relaxed font-light">
          {item.description}
        </p>
      </div>

      {/* Image */}
      <div className="flex-1 w-full">
        <div
          ref={imageRef}
          className="relative group rounded-2xl overflow-hidden glass-panel glow-green"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E0D] via-transparent to-transparent z-10 opacity-40" />
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {/* Corner accent */}
          <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-\[#9A8678\]/40 z-20" />
          <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-\[#9A8678\]/40 z-20" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardShowcase() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current?.querySelectorAll('.showcase-head'), {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 80%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="relative py-32 md:py-48">
      {/* Section heading */}
      <div ref={headingRef} className="text-center mb-24 px-6">
        <p className="showcase-head text-xs uppercase tracking-[0.3em] text-green-400 font-medium mb-4">
          The Platform
        </p>
        <h2 className="showcase-head text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
          Everything you need,<br />
          <span className="text-gradient">beautifully crafted.</span>
        </h2>
        <p className="showcase-head text-green-400 max-w-xl mx-auto text-base font-light">
          Every screen in VendorBridge is designed for clarity, speed, and delight.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-32 md:gap-48">
        {showcaseItems.map((item, i) => (
          <ShowcaseCard key={item.title} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
