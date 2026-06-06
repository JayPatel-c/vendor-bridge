import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import DashboardShowcase from '../components/DashboardShowcase';
import Stats from '../components/Stats';
import Features from '../components/Features';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="bg-[#0A0E0D] min-h-screen text-white relative">
      <Navbar />
      <Hero />
      <DashboardShowcase />
      <Stats />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}
