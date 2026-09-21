import React from 'react';

const RESPONSE_STYLES = [
  {
    id: 'Concise and direct',
    label: 'Concise and direct',
    desc: 'Brevity-first. Immediate conclusions and bulleted insights with zero fluff.',
  },
  {
    id: 'Detailed and explanatory',
    label: 'Detailed and explanatory',
    desc: 'Comprehensive reasoning, underlying mechanics, and historical context.',
  },
  {
    id: 'Step-by-step',
    label: 'Step-by-step walkthrough',
    desc: 'Chronological guidance, sequential milestones, and verification checkpoints.',
  },
  {
    id: 'Mostly examples',
    label: 'Code & Example first',
    desc: 'Leads with working implementations, minimal prose, and practical snippets.',
  },
  {
    id: 'Technical and advanced',
    label: 'Technical & Systems-oriented',
    desc: 'Algorithmic trade-offs, formal constraints, and edge-case considerations.',
  },
];

export function ResponseStyleStep({ value, onChange, error }) {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">
          04 &mdash; Tone & Delivery
        </div>
        <h2 className="font-instrument-sans font-semibold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
          How do you prefer Koko to answer?
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Select the default persona instruction that Koko enforces across all routed LLMs.
        </p>
      </div>

      <div className="space-y-2.5 pt-1">
        {RESPONSE_STYLES.map((item) => {
          const isSelected = value === item.id;

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
              <div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-xs text-white/45 mt-0.5">{item.desc}</div>
              </div>

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

export default ResponseStyleStep;
