import React from 'react';

const MEMORY_OPTIONS = [
  {
    id: 'remember_useful_details',
    label: 'Yes, remember useful details',
    tag: 'Default',
    desc: 'Maintains long-term context: project stacks, preferred coding conventions, and prior research.',
  },
  {
    id: 'ask_before_saving',
    label: 'Ask me before saving important details',
    tag: 'Prompted',
    desc: 'Prompts for confirmation before indexing any project details or personal facts into memory.',
  },
  {
    id: 'current_conversation_only',
    label: 'No, use only the current conversation',
    tag: 'Ephemeral',
    desc: 'Zero persistence. Every thread operates in complete isolation with no memory recorded.',
  },
];

export function MemoryPreferenceStep({ value = 'remember_useful_details', onChange }) {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">
          07 &mdash; Memory Architecture
        </div>
        <h2 className="font-instrument-sans font-semibold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
          Should Koko remember useful details about you?
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Koko can store useful preferences and project details to personalize future model responses. You can change this setting later.
        </p>
      </div>

      <div className="space-y-3 pt-1">
        {MEMORY_OPTIONS.map((item) => {
          const isSelected = value === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all duration-150 flex items-start justify-between gap-4 cursor-pointer ${
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
                <div className="text-xs text-white/45 leading-relaxed">{item.desc}</div>
              </div>

              <div
                className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
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
    </div>
  );
}

export default MemoryPreferenceStep;
