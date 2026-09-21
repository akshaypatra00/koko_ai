import React from 'react';
import { Check } from 'lucide-react';

const USE_CASES = [
  { id: 'Software development', label: 'Software development', desc: 'Code synthesis, debugging & system design' },
  { id: 'Learning and education', label: 'Learning and education', desc: 'Concept breakdowns & technical tutoring' },
  { id: 'Research', label: 'Research', desc: 'Literature review & cross-paper synthesis' },
  { id: 'Writing and content creation', label: 'Writing & content creation', desc: 'Documentation, essays & editorial copy' },
  { id: 'Business and productivity', label: 'Business & productivity', desc: 'Strategy, operational memos & planning' },
  { id: 'Creative work', label: 'Creative work', desc: 'Ideation, visual concepts & narrative work' },
  { id: 'General questions', label: 'General questions', desc: 'Fast answers, synthesis & everyday inquiries' },
  { id: 'Other', label: 'Other workflows', desc: 'Custom pipelines and specialized domains' },
];

export function UseCasesStep({ value = [], onChange, error }) {
  const toggleOption = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">
          02 &mdash; Workflows
        </div>
        <h2 className="font-instrument-sans font-semibold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
          What will you mainly use Koko AI for?
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Select all that apply. This configures the dynamic model router's latency and reasoning weights.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {USE_CASES.map((item) => {
          const isSelected = value.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleOption(item.id)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex items-start justify-between gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-white/[0.08] border-white/60 text-white shadow-sm'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.08] hover:border-white/20 text-white/70 hover:text-white'
              }`}
            >
              <div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-xs text-white/45 mt-0.5 leading-snug">{item.desc}</div>
              </div>

              <div
                className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-white border-white text-black'
                    : 'border-white/20 bg-transparent'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-400 pl-1">{error}</p>}
    </div>
  );
}

export default UseCasesStep;
