import React from 'react';

export function DisplayNameStep({ value, onChange, error }) {
  return (
    <div className="space-y-8 text-left">
      <div className="space-y-2">
        <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">
          01 &mdash; Identity
        </div>
        <h2 className="font-instrument-sans font-semibold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
          What should Koko call you?
        </h2>
        <p className="text-sm text-white/50 leading-relaxed max-w-md">
          This name will be used across your workspace, prompt injections, and conversation transcripts.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <div className="relative">
          <input
            id="displayName"
            type="text"
            autoFocus
            value={value || ''}
            maxLength={80}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your name or callsign"
            className={`w-full bg-transparent border-b pb-3 pt-2 text-2xl sm:text-3xl font-normal text-white placeholder-white/20 focus:outline-none transition-colors duration-200 font-sans ${
              error
                ? 'border-red-500 text-red-100'
                : 'border-white/20 focus:border-white'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono pt-1">
          {error ? (
            <span className="text-red-400">{error}</span>
          ) : (
            <span className="text-white/30 text-[11px]">2 to 80 characters</span>
          )}
          <span className="text-white/30 text-[11px]">
            {String((value || '').length).padStart(2, '0')} / 80
          </span>
        </div>
      </div>
    </div>
  );
}

export default DisplayNameStep;
