import React from 'react';
import SunburstIcon from './SunburstIcon';
import footerLandscape from '../assets/footer-landscape.jpg';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navColumns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Model Router', href: '#features' },
        { label: 'Parallel Execution', href: '#features' },
        { label: 'Dynamic UI', href: '#features' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#resources' },
        { label: 'Case Studies', href: '#customer-stories' },
        { label: 'Architecture', href: '#architecture' },
        { label: 'Guides', href: '#guides' },
        { label: 'Support', href: '#support' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#about' },
        { label: 'Careers', href: '#careers' },
        { label: 'Research', href: '#research' },
        { label: 'Partners', href: '#partners' },
        { label: 'Contact', href: '#contact' },
      ],
    },
  ];

  return (
    <footer className="w-full bg-[#000000]">
      {/* 100% Full-Width Container with NO border-radius */}
      <div className="w-full rounded-none overflow-hidden relative shadow-2xl border-t border-white/20 bg-[#aed9f4]">
        {/* Background Landscape Art Image */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <img
            src={footerLandscape}
            alt="Koko AI Serene Horizon Landscape"
            className="w-full h-full object-cover object-bottom"
          />
          {/* Enhanced top sky backdrop overlay for high text contrast & legibility */}
          <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#aed9f4]/95 via-[#aed9f4]/80 to-transparent" />
        </div>

        {/* Content Container positioned above illustrated landscape */}
        <div className="relative z-10 flex flex-col justify-between min-h-[600px] sm:min-h-[680px] md:min-h-[720px] p-6 sm:p-12 lg:p-16 xl:p-20">
          {/* Top Section: Brand Info & 3 Concise Link Columns */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-16">
            {/* Left Brand Identity */}
            <div className="max-w-md space-y-4">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTop();
                }}
                className="inline-flex items-center gap-3.5 group focus:outline-none"
                aria-label="Koko AI Home"
              >
                {/* Square white badge holding the logo (no border-radius) */}
                <div className="w-12 h-12 bg-white shadow-md border border-slate-900/20 flex items-center justify-center text-slate-950 transition-transform duration-300 group-hover:scale-105">
                  <div className="transform group-hover:rotate-45 transition-transform duration-500">
                    <SunburstIcon className="w-6 h-6 text-slate-950" size={24} />
                  </div>
                </div>
                <span className="font-instrument-sans font-extrabold text-3xl sm:text-4xl tracking-tight text-slate-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
                  Koko AI
                </span>
              </a>

              <p className="font-instrument-sans text-base text-slate-950 font-medium leading-relaxed max-w-sm drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
                Koko AI helps teams orchestrate complex models into clear, intelligent actions — everything you need in one place.
              </p>
            </div>

            {/* Right Link Columns ("lil bit of the links") */}
            <div className="grid grid-cols-3 gap-6 sm:gap-12 lg:gap-20 pt-1">
              {navColumns.map((col, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-instrument-sans font-bold text-sm sm:text-base text-slate-950 uppercase tracking-wider drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm font-semibold">
                    {col.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <a
                          href={link.href}
                          className="font-instrument-sans text-slate-900 hover:text-black hover:translate-x-0.5 transition-all duration-150 inline-block drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Middle/Bottom Floating Legal Links */}
          <div className="mt-auto pt-24 sm:pt-36 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            {/* Copyright on the green hill (bottom-left) with crisp contrast */}
            <div className="font-instrument-sans font-bold text-xs sm:text-sm text-slate-950 bg-white/80 backdrop-blur-md px-4 py-1.5 border border-black/15 shadow-sm select-none">
              &copy; {new Date().getFullYear()} KOKO AI. All rights reserved.
            </div>

            {/* Terms & Privacy floating on the right with crisp contrast */}
            <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-slate-950 bg-white/80 backdrop-blur-md px-4 py-1.5 border border-black/15 shadow-sm">
              <a
                href="#terms"
                className="hover:text-blue-900 transition-colors duration-150 underline underline-offset-4"
              >
                Terms of Service
              </a>
              <span className="text-slate-400 font-normal">•</span>
              <a
                href="#privacy"
                className="hover:text-blue-900 transition-colors duration-150 underline underline-offset-4"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
