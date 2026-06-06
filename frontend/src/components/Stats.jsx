import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '2.4s', label: 'Avg. Response' },
  { value: '150+', label: 'Integrations' },
  { value: '50k+', label: 'Transactions/day' },
];

export default function Stats() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stat-item', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass-panel rounded-3xl p-12 md:p-16 glow-green">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className="stat-item text-center">
                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-green-400 font-light uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
