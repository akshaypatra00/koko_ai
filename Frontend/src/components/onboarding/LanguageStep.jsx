import React from 'react';

const LANGUAGES = [
  { id: 'auto', label: 'Automatically detect', tag: 'Recommended', desc: 'Dynamically adapts to the language of your prompt input' },
  { id: 'English', label: 'English', desc: 'Standard international English' },
  { id: 'Hindi', label: 'Hindi (हिन्दी)', desc: 'Responses in pure Hindi or conversational Hinglish' },
  { id: 'Telugu', label: 'Telugu (తెలుగు)', desc: 'Responses in Telugu or bilingual technical mix' },
  { id: 'Tamil', label: 'Tamil (தமிழ்)', desc: 'Responses in Tamil or bilingual technical mix' },
  { id: 'Other', label: 'Other Language', desc: 'Input any language during prompts' },
];

export function LanguageStep({ value = 'auto', onChange }) {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">
          05 &mdash; Localization
        </div>
        <h2 className="font-instrument-sans font-semibold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
          Which language should Koko use?
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Koko handles real-time cross-language code translation and multilingual responses.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {LANGUAGES.map((item) => {
          const isSelected = value === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex items-start justify-between gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-white/[0.08] border-white/60 text-white'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.08] hover:border-white/20 text-white/70 hover:text-white'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{item.label}</span>
                  {item.tag && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                      {item.tag}
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/45 mt-0.5 leading-snug">{item.desc}</div>
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

export default LanguageStep;
