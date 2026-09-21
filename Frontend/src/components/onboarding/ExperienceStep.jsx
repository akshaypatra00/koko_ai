import React from 'react';

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    tag: 'Foundational',
    desc: 'Clear, patient explanations with core terminology and minimal jargon.',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    tag: 'Practical',
    desc: 'Balanced context, practical implementation patterns, and direct code.',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    tag: 'Architectural',
    desc: 'In-depth trade-off analysis, performance optimizations, and clean architecture.',
  },
  {
    id: 'expert',
    label: 'Expert',
    tag: 'Zero Fluff',
    desc: 'Dense, technical precision. Algorithmic benchmarks and production-ready syntax.',
  },
];

export function ExperienceStep({ value, onChange, error }) {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">
          03 &mdash; Technical Depth
        </div>
        <h2 className="font-instrument-sans font-semibold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
          What is your experience level?
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Koko calibrates code verbosity, prerequisite explanations, and conceptual depth accordingly.
        </p>
      </div>

      <div className="space-y-2.5 pt-1">
        {EXPERIENCE_LEVELS.map((item) => {
          const isSelected = (value || '').toLowerCase() === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer ${
                isSelected
                  ? 'bg-white/[0.08] border-white/60 text-white'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.08] hover:border-white/20 text-white/70 hover:text-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">
                    {item.tag}
                  </span>
                </div>
                <div className="text-xs text-white/45">{item.desc}</div>
              </div>

              {/* Minimalist Radio Indicator */}
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'border-white bg-white text-black'
                    : 'border-white/25 bg-transparent'
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-400 pl-1">{error}</p>}
    </div>
  );
}

export default ExperienceStep;
