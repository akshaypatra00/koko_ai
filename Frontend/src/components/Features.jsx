import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  GitFork,
  Zap,
  Award,
  UserCheck,
  Database,
  Layers,
  LayoutGrid,
  CheckCircle2,
  Terminal,
  Activity,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Code2,
  Clock,
  Play,
  Pause
} from 'lucide-react';

export const KOKO_FEATURES = [
  {
    id: "prompt-opt",
    number: "01",
    title: "Prompt Understanding & Optimization",
    shortTitle: "Prompt Optimization",
    tag: "AST Decomposition",
    desc: "Deconstructs unstructured human prompts into multi-vector intent embeddings, injects enterprise system constraints, and auto-optimizes token efficiency.",
    metrics: [
      { label: "Intent Accuracy", value: "99.4%" },
      { label: "Token Reduction", value: "-34%" },
      { label: "Latency", value: "18ms" }
    ],
    icon: Cpu,
    color: "from-blue-600/25 to-indigo-600/30",
    badge: "Semantic Rewrite",
    glow: "rgba(59, 130, 246, 0.25)",
    telemetry: {
      header: "Raw Human Query → AST Agent Payload",
      rawInput: "Make an ultra-fast trading dashboard with live sentiment & portfolio charts",
      optimizedOutput: "SYSTEM: Act as Lead FinTech Architect. TARGET: Next.js 15, Tailwind v4, WebSocket feed, Lucide icons. CONSTRAINTS: Zero-layout shift, 60fps canvas, strict TypeScript typing.",
      inferredVectors: ["Financial Viz", "Live Streaming", "Dark OLED UI", "Stateful Metrics"],
      status: "Optimized & Cached (18ms)"
    }
  },
  {
    id: "model-routing",
    number: "02",
    title: "Intelligent Model Routing",
    shortTitle: "Model Routing",
    tag: "Multi-Engine Gateway",
    desc: "Dynamic heuristic router evaluates task complexity, privacy tier, and token budgets to dispatch subtasks to the highest-performing LLMs.",
    metrics: [
      { label: "Routing Accuracy", value: "98.9%" },
      { label: "Cost Savings", value: "42.8%" },
      { label: "Gateway TTFT", value: "24ms" }
    ],
    icon: GitFork,
    color: "from-indigo-600/25 to-purple-600/30",
    badge: "SLA Optimal",
    glow: "rgba(99, 102, 241, 0.25)",
    telemetry: {
      header: "Dynamic Dispatch Topology",
      routes: [
        { task: "Complex Financial Calculations", engine: "DeepSeek R1", reason: "Mathematical reasoning benchmark: 97.3%" },
        { task: "Interactive React UI Architecture", engine: "Claude 3.7 Sonnet", reason: "Frontend synthesis accuracy: 96.8%" },
        { task: "Vector Memory & Deep History", engine: "Gemini 2.5 Pro", reason: "2M token context window recall" },
        { task: "Visual Assets & Multi-Sensory", engine: "GPT-4o Vision", reason: "High-fidelity diagram & SVG generation" }
      ],
      status: "All Gateways Healthy (24ms)"
    }
  },
  {
    id: "parallel-exec",
    number: "03",
    title: "Parallel Model Execution",
    shortTitle: "Parallel Execution",
    tag: "Concurrent Stream",
    desc: "Dispatches simultaneous asynchronous inference streams across multiple provider backends, racing for first-token consensus.",
    metrics: [
      { label: "Throughput", value: "184 tok/s" },
      { label: "Sync Delay", value: "<14ms" },
      { label: "Concurrency", value: "4 Engines" }
    ],
    icon: Zap,
    color: "from-amber-600/25 to-rose-600/30",
    badge: "Sub-Second Race",
    glow: "rgba(245, 158, 11, 0.25)",
    telemetry: {
      header: "Asynchronous Consensus Streams",
      streams: [
        { model: "Claude 3.7 Sonnet", speed: "64 tok/s", tokens: "840 toks", status: "Completed (118ms)" },
        { model: "DeepSeek R1 (Reasoning)", speed: "58 tok/s", tokens: "1,120 toks", status: "Completed (132ms)" },
        { model: "GPT-4o", speed: "72 tok/s", tokens: "790 toks", status: "Completed (112ms)" },
        { model: "Gemini 2.5 Pro", speed: "68 tok/s", tokens: "910 toks", status: "Completed (124ms)" }
      ],
      status: "First-Token Consensus Achieved (118ms)"
    }
  },
  {
    id: "response-eval",
    number: "04",
    title: "Response Evaluation & Ranking",
    shortTitle: "Evaluation & Ranking",
    tag: "Automated Arbitration",
    desc: "Evaluates parallel candidate outputs against real-time unit tests, hallucination discriminators, and deterministic formatting validators.",
    metrics: [
      { label: "Winning Consensus", value: "Ensemble #1" },
      { label: "Hallucination Rate", value: "0.00%" },
      { label: "Code Compilation", value: "100% Pass" }
    ],
    icon: Award,
    color: "from-emerald-600/25 to-teal-600/30",
    badge: "Cross-Scored",
    glow: "rgba(16, 185, 129, 0.25)",
    telemetry: {
      header: "Arbitration Cross-Score Matrix",
      evaluations: [
        { candidate: "Candidate A (Unified Consensus)", score: "98.7 pts", verdict: "Selected", checks: "Zero hallucination, strict TypeScript valid, AST correct" },
        { candidate: "Candidate B (Single Model)", score: "89.2 pts", verdict: "Rejected", checks: "Minor CSS cascade conflict, high latency" },
        { candidate: "Candidate C (Fast Stream)", score: "91.5 pts", verdict: "Merged", checks: "Fastest TTFT, complementary state hooks" }
      ],
      status: "Verified & Approved"
    }
  },
  {
    id: "user-pref",
    number: "05",
    title: "User-Preference Learning",
    shortTitle: "Preference Learning",
    tag: "Adaptive RLHF",
    desc: "Continuously learns from every edit, accepted suggestion, and prompt feedback to personalize styling, architecture, and coding conventions.",
    metrics: [
      { label: "Persona Fit", value: "96.4%" },
      { label: "Correction Rate", value: "-68%" },
      { label: "Confidence", value: "97.2%" }
    ],
    icon: UserCheck,
    color: "from-cyan-600/25 to-blue-600/30",
    badge: "Self-Tuning",
    glow: "rgba(6, 182, 212, 0.25)",
    telemetry: {
      header: "Learned Developer & Design Persona",
      attributes: [
        { trait: "Visual Theme", value: "Pure Black OLED (#000000) with Blue-900 luminous accents", confidence: "99%" },
        { trait: "Typography", value: "Instrument Sans + Instrument Serif pairings", confidence: "98%" },
        { trait: "Component Paradigm", value: "Atomic React functional components with Motion v12", confidence: "95%" },
        { trait: "Micro-interactions", value: "Subtle hover translates, glassmorphism, glowing borders", confidence: "97%" }
      ],
      status: "Persona Locked & Active"
    }
  },
  {
    id: "memory",
    number: "06",
    title: "Long-Term Memory",
    shortTitle: "Long-Term Memory",
    tag: "Episodic Recall",
    desc: "Maintains cross-session episodic memory and workspace graph embeddings, ensuring your project identity and architecture persist forever.",
    metrics: [
      { label: "Recall Fidelity", value: "99.8%" },
      { label: "Graph Nodes", value: "24,810" },
      { label: "Cross-Session", value: "Infinite" }
    ],
    icon: Database,
    color: "from-violet-600/25 to-fuchsia-600/30",
    badge: "Vector Graph",
    glow: "rgba(139, 92, 246, 0.25)",
    telemetry: {
      header: "Episodic Vector Recall Graph",
      contexts: [
        { session: "Session 104 (Yesterday)", key: "Brand Guidelines", desc: "Color palette: #000000, #3054ff accent, Instrument Sans font" },
        { session: "Session 98 (3 days ago)", key: "API Specification", desc: "WebSocket MUX HLS live video endpoint + real-time stream" },
        { session: "Session 82 (Last week)", key: "Deployment Target", desc: "Vite + Tailwind v4 + Lucide Icon bundle" }
      ],
      status: "Semantic Memory Graph Connected"
    }
  },
  {
    id: "multimodal",
    number: "07",
    title: "Multimodal Generation",
    shortTitle: "Multimodal Gen",
    tag: "Cross-Modal Synthesis",
    desc: "Synthesizes code, interactive SVG vectors, video layers, and stateful widgets concurrently in a single orchestrated output stream.",
    metrics: [
      { label: "Modalities", value: "4 Synced" },
      { label: "Vector Crispness", value: "100%" },
      { label: "Render Target", value: "60 FPS" }
    ],
    icon: Layers,
    color: "from-pink-600/25 to-rose-600/30",
    badge: "Real-Time Canvas",
    glow: "rgba(236, 72, 153, 0.25)",
    telemetry: {
      header: "Cross-Modal Asset Synthesis Stream",
      assets: [
        { type: "Interactive Canvas Chart", format: "SVG & WebGL", detail: "Real-time volatility trend line with glow fill" },
        { type: "Vector Iconography", format: "Lucide 24x24", detail: "Adaptive SVG glyphs with dynamic active states" },
        { type: "Video Layer Integration", format: "HLS.js Stream", detail: "Mux streaming neural particle video backdrop" },
        { type: "Data Payload", format: "Strict JSON", detail: "Typed schema with real-time websocket heartbeat" }
      ],
      status: "Multi-Modal Stream Synchronized"
    }
  },
  {
    id: "dynamic-ui",
    number: "08",
    title: "Dynamic UI Renderer",
    shortTitle: "Dynamic UI Renderer",
    tag: "Virtual DOM Compiler",
    desc: "Compiles orchestrated AI output into executable, safe React components inside an isolated, real-time 60fps sandbox.",
    metrics: [
      { label: "Mount Latency", value: "<10ms" },
      { label: "Virtual DOM Rate", value: "60 FPS" },
      { label: "Sandbox Security", value: "Isolated" }
    ],
    icon: LayoutGrid,
    color: "from-blue-600/25 to-emerald-600/30",
    badge: "Virtual DOM",
    glow: "rgba(48, 84, 255, 0.25)",
    telemetry: {
      header: "Live Component Sandbox",
      modules: [
        { name: "Analytics Dashboard Widget", state: "Live & Mounted", latency: "6ms" },
        { name: "Live Order Book Stream", state: "Connected", latency: "8ms" },
        { name: "Risk Assessment Dial", state: "Reactive State", latency: "4ms" }
      ],
      status: "60 FPS Virtual DOM Mounted"
    }
  }
];

export function Features() {
  const [activeTab, setActiveTab] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-cycle through the 8 features every 5 seconds unless user manually interacts
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % KOKO_FEATURES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const current = KOKO_FEATURES[activeTab];
  const Icon = current.icon;

  return (
    <section id="features" className="relative w-full bg-[#000000] text-white pt-16 pb-32 px-4 sm:px-6 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-[650px] h-[650px] bg-blue-900/15 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/3 w-[550px] h-[550px] bg-indigo-900/15 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />

      {/* Background grid line pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md text-xs font-mono tracking-widest text-blue-400 uppercase mb-4 shadow-[0_0_20px_rgba(48,84,255,0.2)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KOKO PLATFORM CAPABILITIES</span>
          </div>

          <h2 className="font-instrument-sans font-bold text-4xl sm:text-6xl tracking-tight text-white mb-5 leading-tight">
            Eight Pillars of Autonomous Orchestration
          </h2>

          <p className="font-instrument-sans text-base sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
            From prompt AST decomposition to sub-second parallel model consensus and real-time React UI rendering.
          </p>

          {/* Auto-cycle toggle button */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/70 hover:text-white transition-all cursor-pointer"
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pause Auto-cycle</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto-cycle Features</span>
                </>
              )}
            </button>
            <span className="text-xs font-mono text-white/40">
              Stage {activeTab + 1} / {KOKO_FEATURES.length}
            </span>
          </div>
        </div>

        {/* Feature Navigation Tabs (All 8 Capabilities) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-8">
          {KOKO_FEATURES.map((feat, idx) => {
            const TabIcon = feat.icon;
            const isSelected = idx === activeTab;
            return (
              <button
                key={feat.id}
                onClick={() => {
                  setActiveTab(idx);
                  setIsAutoPlaying(false);
                }}
                className={`relative p-3 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between min-h-[96px] cursor-pointer group ${
                  isSelected
                    ? 'bg-white/15 border-blue-500/70 shadow-[0_0_20px_rgba(48,84,255,0.3)] text-white'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-400 font-bold' : 'text-white/40'}`}>
                    {feat.number}
                  </span>
                  <TabIcon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : 'text-white/50'}`} />
                </div>

                <div className="text-xs font-medium leading-snug mt-2 line-clamp-2">
                  {feat.shortTitle}
                </div>

                {/* Active Indicator Bar */}
                {isSelected && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-gradient-to-r from-blue-500 to-[#b4c0ff] rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Feature Interactive Telemetry Display */}
        <div className="relative rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl overflow-hidden">
          {/* Subtle colored glow per feature */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-25"
            style={{ background: current.glow }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="relative z-10"
            >
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(48,84,255,0.25)]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
                        Feature {current.number} &bull; {current.tag}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                        {current.badge}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white font-sans mt-0.5">
                      {current.title}
                    </h3>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
                  {current.metrics.map((m, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-center min-w-[95px]">
                      <div className="text-[10px] text-white/50 font-mono uppercase">{m.label}</div>
                      <div className="text-sm sm:text-base font-semibold text-white font-mono mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-white/70 font-sans leading-relaxed py-6 max-w-3xl">
                {current.desc}
              </p>

              {/* Dynamic Feature Telemetry Stream */}
              <div className="rounded-xl border border-white/10 bg-[#05060b] p-4 sm:p-5">
                <div className="flex items-center justify-between text-xs font-mono text-white/40 pb-3 mb-3 border-b border-white/5">
                  <span>{current.telemetry.header}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {current.telemetry.status}
                  </span>
                </div>

                {/* Feature 1: Prompt Optimization */}
                {current.id === "prompt-opt" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-lg bg-black/60 border border-red-500/20">
                        <div className="text-[10px] font-mono text-red-400 mb-1">RAW HUMAN QUERY</div>
                        <div className="text-xs text-white/80 font-mono">
                          "{current.telemetry.rawInput}"
                        </div>
                      </div>
                      <div className="p-3.5 rounded-lg bg-black/60 border border-emerald-500/30">
                        <div className="text-[10px] font-mono text-emerald-400 mb-1">OPTIMIZED SYSTEM PROMPT</div>
                        <div className="text-xs text-white/90 font-mono">
                          {current.telemetry.optimizedOutput}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[11px] font-mono text-white/40">Inferred Vectors:</span>
                      {current.telemetry.inferredVectors.map((v, i) => (
                        <span key={i} className="text-[11px] px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono">
                          +{v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature 2: Model Routing */}
                {current.id === "model-routing" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {current.telemetry.routes.map((r, i) => (
                      <div key={i} className="p-3 rounded-lg bg-black/50 border border-white/10 flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-medium text-white/90">{r.task}</div>
                          <div className="text-[11px] text-white/50 mt-0.5">{r.reason}</div>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/10 border border-white/15 text-white shrink-0">
                          {r.engine}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feature 3: Parallel Execution */}
                {current.id === "parallel-exec" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {current.telemetry.streams.map((s, i) => (
                      <div key={i} className="p-3 rounded-lg bg-black/50 border border-white/10 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-white">{s.model}</div>
                          <div className="text-[11px] text-white/50 font-mono mt-0.5">
                            {s.tokens} generated @ {s.speed}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feature 4: Response Evaluation */}
                {current.id === "response-eval" && (
                  <div className="space-y-2">
                    {current.telemetry.evaluations.map((e, i) => (
                      <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${
                        e.verdict === "Selected"
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                          : 'bg-black/40 border-white/5 text-white/60'
                      }`}>
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-2">
                            <span>{e.candidate}</span>
                            <span className="font-mono text-emerald-400">({e.score})</span>
                          </div>
                          <div className="text-[11px] text-white/50 mt-0.5">{e.checks}</div>
                        </div>
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-semibold ${
                          e.verdict === "Selected"
                            ? 'bg-emerald-400 text-black'
                            : 'bg-white/5 text-white/40'
                        }`}>
                          {e.verdict}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feature 5: Preference Learning */}
                {current.id === "user-pref" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {current.telemetry.attributes.map((a, i) => (
                      <div key={i} className="p-3 rounded-lg bg-black/50 border border-white/10">
                        <div className="flex items-center justify-between text-[11px] font-mono text-white/40 mb-1">
                          <span>{a.trait}</span>
                          <span className="text-cyan-300">{a.confidence} fit</span>
                        </div>
                        <div className="text-xs font-medium text-white/90">{a.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feature 6: Long-Term Memory */}
                {current.id === "memory" && (
                  <div className="space-y-2">
                    {current.telemetry.contexts.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg bg-black/50 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {c.key}
                            </span>
                            <span className="text-[11px] font-mono text-white/40">{c.session}</span>
                          </div>
                          <div className="text-xs text-white/80 mt-1">{c.desc}</div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Injected
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feature 7: Multimodal Generation */}
                {current.id === "multimodal" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {current.telemetry.assets.map((asset, i) => (
                      <div key={i} className="p-3 rounded-lg bg-black/50 border border-white/10 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-white">{asset.type}</div>
                          <div className="text-[11px] text-white/50">{asset.detail}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20 shrink-0">
                          {asset.format}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feature 8: Dynamic UI Renderer */}
                {current.id === "dynamic-ui" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                      {current.telemetry.modules.map((m, i) => (
                        <div key={i} className="p-3 rounded-lg bg-black/60 border border-white/10">
                          <div className="text-xs font-semibold text-white">{m.name}</div>
                          <div className="text-[10px] font-mono text-emerald-400 mt-1">{m.state}</div>
                          <div className="text-[10px] font-mono text-white/40 mt-0.5">{m.latency} mount</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-white/50">
                      <span>Secure virtual DOM sandbox isolation</span>
                      <span className="text-blue-400 flex items-center gap-1">
                        Compiled in 8ms <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default Features;
