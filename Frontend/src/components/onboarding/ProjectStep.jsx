import React from 'react';

export function ProjectStep({ value, onChange }) {
  const maxLength = 500;
  const currentLength = (value || '').length;

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-white/40">
            06 &mdash; Context
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
            Optional
          </span>
        </div>
        <h2 className="font-instrument-sans font-semibold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
          What are you currently learning or building?
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Koko will retain this project context across model queries to avoid repetitive briefing.
        </p>
      </div>

      <div className="space-y-2 pt-1">
        <textarea
          rows={5}
          value={value || ''}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Building an automated agent pipeline with React, Supabase, and Claude 3.7..."
          className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/15 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/60 transition-colors font-sans resize-none leading-relaxed"
        />

        <div className="flex justify-between items-center text-[11px] font-mono text-white/30 pt-1">
          <span>You can skip this step or modify it anytime</span>
          <span>{currentLength} / {maxLength}</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectStep;
