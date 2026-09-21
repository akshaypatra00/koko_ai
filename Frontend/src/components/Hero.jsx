import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero({ onOpenSignIn }) {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoSrc = "https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8";

  // HLS.js Video Implementation with Safari fallback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play()
          .then(() => setIsVideoLoaded(true))
          .catch((e) => console.log("Auto-play prevented:", e));
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => {
        video.play()
          .then(() => setIsVideoLoaded(true))
          .catch((e) => console.log("Auto-play prevented:", e));
      });
    }
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-[#000000] text-white overflow-hidden flex flex-col justify-center items-center pt-24 pb-20">
      {/* Background Video Layer with smooth fade-in to prevent background flash */}
      <video
        ref={videoRef}
        poster="https://images.unsplash.com/photo-1647356191320-d7a1f80ca777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjB0ZWNobm9sb2d5JTIwbmV1cmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3Njg5NzIyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
        muted
        loop
        playsInline
        autoPlay
        onPlaying={() => setIsVideoLoaded(true)}
        onLoadedData={() => setIsVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ease-out bg-black ${isVideoLoaded ? 'opacity-60' : 'opacity-0'
          }`}
      />

      {/* Video Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-none" />

      {/* Decorative Gradients */}
      {/* Top-left gradient */}
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse-slow" />

      {/* Bottom-right gradient */}
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse-slow" />

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto items-center text-center space-y-8 sm:space-y-10 px-4 sm:px-6">
        {/* Eyebrow / Pre-headline Badge */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md text-xs font-mono tracking-widest text-white/70 uppercase shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span>KOKO AI ORCHESTRATION ENGINE</span>
        </motion.div> */}

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-instrument-sans font-semibold text-5xl sm:text-7xl lg:text-[84px] leading-[1.04] tracking-tight bg-gradient-to-b from-white via-white to-[#b4c0ff] bg-clip-text text-transparent max-w-4xl mx-auto select-none"
        >
          One AI. Every model.<br className="hidden sm:inline" /> Built around you.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-instrument-sans text-base sm:text-xl leading-relaxed text-white max-w-2xl mx-auto"
        >
          Koko AI understands what you need, chooses the right AI model for the job, and delivers the best response — while remembering what matters to you.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-5 items-center justify-center pt-2"
        >
          {/* Primary Button */}
          <button
            onClick={onOpenSignIn}
            className="group flex items-center justify-between pl-6 pr-2 py-2 rounded-full bg-white text-[#0a0400] font-instrument-sans font-medium text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] active:scale-100 cursor-pointer"
          >
            <span className="mr-4">Start with Koko</span>
            <span className="w-10 h-10 rounded-full bg-[#3054ff] hover:bg-[#2040e0] flex items-center justify-center transition-colors shadow-sm">
              <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          {/* Secondary Button */}
          <a
            href="#features"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-lg text-white/80 hover:text-white backdrop-blur-sm hover:bg-white/10 font-instrument-sans font-medium text-base transition-all"
          >
            <span>See how it works</span>
            <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
