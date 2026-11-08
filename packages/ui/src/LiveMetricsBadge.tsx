import React from "react";

export interface LiveMetricsBadgeProps {
  fps: number;
  latencyMs: number;
  confidence?: number;
  className?: string;
}

export const LiveMetricsBadge: React.FC<LiveMetricsBadgeProps> = ({
  fps,
  latencyMs,
  confidence,
  className = "",
}) => {
  return (
    <div className={`grid grid-cols-3 gap-2 text-center ${className}`}>
      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
        <span className="text-[10px] text-slate-400 block uppercase font-mono">FPS</span>
        <span className="text-base font-bold text-sky-400 font-mono">{fps}</span>
      </div>
      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
        <span className="text-[10px] text-slate-400 block uppercase font-mono">Latência</span>
        <span className="text-base font-bold text-emerald-400 font-mono">{latencyMs} ms</span>
      </div>
      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
        <span className="text-[10px] text-slate-400 block uppercase font-mono">Confiança</span>
        <span className="text-base font-bold text-amber-400 font-mono">
          {confidence !== undefined ? `${(confidence * 100).toFixed(0)}%` : "—"}
        </span>
      </div>
    </div>
  );
};
