import React from "react";

export interface CountdownOverlayProps {
  gestureName: string;
  countdown: number | null;
  sampleCount: number;
  targetSamples: number;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  gestureName,
  countdown,
  sampleCount,
  targetSamples,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-20">
      {countdown !== null ? (
        <div className="text-center">
          <p className="text-slate-300 text-lg mb-2">Prepare-se para o gesto:</p>
          <p className="text-emerald-400 font-bold text-2xl mb-4">"{gestureName}"</p>
          <div className="text-7xl font-extrabold text-white animate-bounce">{countdown}</div>
        </div>
      ) : (
        <div className="w-full max-w-xs text-center">
          <p className="text-amber-400 font-semibold mb-2 animate-pulse">Gravando "{gestureName}"...</p>
          <p className="text-xs text-slate-300 mb-4">Mova levemente a cabeça ou mão para gerar variação</p>
          <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden border border-slate-600">
            <div
              className="bg-emerald-500 h-full transition-all duration-75"
              style={{ width: `${(sampleCount / targetSamples) * 100}%` }}
            />
          </div>
          <p className="text-sm text-slate-300 mt-2 font-mono">
            {sampleCount} / {targetSamples} amostras
          </p>
        </div>
      )}
    </div>
  );
};
