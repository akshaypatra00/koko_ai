import React, { useState } from 'react';
import { ChevronDown, Menu, X, ArrowUpRight } from 'lucide-react';
import SunburstIcon from './SunburstIcon';

export function Navbar({ onOpenSignIn }) {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const products = [
    { title: "Prompt Optimization", desc: "Intent extraction & semantic enhancement" },
    { title: "Model Routing", desc: "Latency & cost-optimized engine selection" },
    { title: "Parallel Execution", desc: "Concurrent multi-LLM consensus stream" },
    { title: "Response Evaluation", desc: "Automated truth & quality arbitration" },
    { title: "Preference Learning", desc: "Personalized style & behavioral RL" },
    { title: "Long-Term Memory", desc: "Episodic vector recall & knowledge graph" },
    { title: "Multimodal Generation", desc: "Code, visuals, audio & generative canvas" },
    { title: "Dynamic UI Renderer", desc: "Real-time generative React component sandbox" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 px-6 py-4 transition-[background-color,backdrop-filter,box-shadow] duration-300 ${isScrolled
        ? 'bg-black/85 backdrop-blur-xl shadow-2xl shadow-black/80'
        : 'bg-transparent'
      } flex items-center justify-between`}>
      {/* Left Section */}
      <a href="#" className="flex items-center gap-3 group focus:outline-none" aria-label="Koko AI Home">
        <div className="text-white transform group-hover:rotate-45 transition-transform duration-500">
          <SunburstIcon className="w-6 h-6 text-white" size={24} />
        </div>
        <span className="font-semibold tracking-tight text-xl text-white font-sans flex items-center gap-1.5">
          koko
          <span className="text-[10px] tracking-widest font-mono uppercase px-1.5 py-0.5 rounded border border-white/20 text-white/60 bg-white/5">
            ai
          </span>
        </span>
      </a>

      {/* Center Section (hidden on mobile, visible md:flex) */}
      <div className="hidden md:flex items-center gap-8 font-sans text-sm font-medium relative">
        {/* Products dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setIsProductsOpen(true)}
          onMouseLeave={() => setIsProductsOpen(false)}
        >
          <button
            className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors cursor-pointer py-1"
            onClick={() => setIsProductsOpen(!isProductsOpen)}
            aria-expanded={isProductsOpen}
          >
            <span>Products</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProductsOpen ? 'rotate-180 text-white' : 'text-white/70'}`} />
          </button>

          {/* Flyout menu */}
          {isProductsOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[520px] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/80 grid grid-cols-2 gap-2">
                {products.map((item, idx) => (
                  <a
                    key={idx}
                    href="#features"
                    onClick={() => setIsProductsOpen(false)}
                    className="p-2.5 rounded-xl hover:bg-white/10 transition-colors block text-left group/item"
                  >
                    <div className="text-xs font-medium text-white/90 group-hover/item:text-white flex items-center justify-between">
                      <span>{item.title}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity text-white/60" />
                    </div>
                    <div className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                      {item.desc}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <a href="#customer-stories" className="text-white/80 hover:text-white transition-colors">
          Customer Stories
        </a>
        <a href="#resources" className="text-white/80 hover:text-white transition-colors">
          Resources
        </a>
        <a href="#pricing" className="text-white/80 hover:text-white transition-colors">
          Pricing
        </a>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">


        <button
          onClick={onOpenSignIn}
          className="bg-white text-black rounded-full px-5 py-2.5 font-semibold text-sm hover:bg-white/90 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.35)] active:scale-95 cursor-pointer"
        >
          Get Started
        </button>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white/80 hover:text-white p-1 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-4 font-sans text-base animate-in fade-in slide-in-from-top-2 duration-200">
          <a href="#products" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white py-1">Products</a>
          <a href="#customer-stories" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white py-1">Customer Stories</a>
          <a href="#resources" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white py-1">Resources</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white py-1">Pricing</a>
          <div className="h-px bg-white/10 my-1" />
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSignIn?.();
            }} 
            className="w-full py-2.5 rounded-full bg-white text-black font-semibold text-sm cursor-pointer"
          >
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
