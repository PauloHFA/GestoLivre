import React, { useEffect, useRef } from "react";
import { GestureSample } from "@gestolivre/core";

export interface SampleThumbnailProps {
  sample: GestureSample;
  size?: number;
  className?: string;
  onDelete?: (sampleId: string) => void;
}

/**
 * Miniatura visual de landmarks para revisão e exclusão de amostras ruins (RF-TRN-03)
 */
export const SampleThumbnail: React.FC<SampleThumbnailProps> = ({
  sample,
  size = 72,
  className = "",
  onDelete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, size, size);

    const vec = sample.vector;
    if (!vec || vec.length === 0) return;

    // Detecta se são blendshapes (vetor de ~52 dimensões com valores 0-1) ou landmarks 3D (x, y, z trios)
    if (vec.length <= 60) {
      // Desenha barras dos blendshapes principais
      ctx.fillStyle = "#38bdf8";
      const barWidth = Math.max(1, size / vec.length);
      for (let i = 0; i < vec.length; i++) {
        const val = Math.min(1, Math.max(0, vec[i]));
        const barHeight = val * (size - 8);
        ctx.fillRect(i * barWidth, size - barHeight - 4, barWidth - 0.5, barHeight);
      }
    } else {
      // Pontos 3D (x, y, z normalizados)
      ctx.fillStyle = "#34d399";
      const cx = size / 2;
      const cy = size / 2;
      const scale = size * 0.35;

      for (let i = 0; i < vec.length; i += 3) {
        const x = cx + vec[i] * scale;
        const y = cy + vec[i + 1] * scale;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }, [sample, size]);

  return (
    <div
      className={`relative group bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex flex-col items-center p-1.5 shadow-sm ${className}`}
      style={{ width: size + 12 }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded border border-slate-800"
        aria-label={`Miniatura do exemplo de ${sample.gestureName}`}
      />
      <span className="text-[10px] text-slate-400 font-mono mt-1 truncate max-w-full">
        {new Date(sample.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </span>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(sample.id);
          }}
          className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow"
          title="Excluir esta amostra"
          aria-label={`Excluir amostra gravada em ${new Date(sample.timestamp).toLocaleTimeString()}`}
        >
          ×
        </button>
      )}
    </div>
  );
};
