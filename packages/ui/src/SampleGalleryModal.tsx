import React from "react";
import { GestureSample } from "@gestolivre/core";
import { SampleThumbnail } from "./SampleThumbnail";
import { X, Trash2 } from "lucide-react";

export interface SampleGalleryModalProps {
  gestureName: string;
  samples: GestureSample[];
  isOpen: boolean;
  onClose: () => void;
  onDeleteSample: (sampleId: string) => void;
  onDeleteAllSamples: (gestureName: string) => void;
}

export const SampleGalleryModal: React.FC<SampleGalleryModalProps> = ({
  gestureName,
  samples,
  isOpen,
  onClose,
  onDeleteSample,
  onDeleteAllSamples,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sample-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 id="sample-modal-title" className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Revisão de Exemplos:</span>
              <span className="text-sky-400">"{gestureName}"</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {samples.length} amostra(s) gravada(s). Clique no '×' sobre qualquer miniatura para remover exemplos com falha ou ruído.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Fechar galeria"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grade de Miniaturas */}
        <div className="p-4 overflow-y-auto flex-1">
          {samples.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Nenhuma amostra gravada para este gesto.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 justify-items-center">
              {samples.map((s) => (
                <SampleThumbnail
                  key={s.id}
                  sample={s}
                  size={76}
                  onDelete={onDeleteSample}
                />
              ))}
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          <button
            onClick={() => {
              if (confirm(`Remover todas as ${samples.length} amostras do gesto "${gestureName}"?`)) {
                onDeleteAllSamples(gestureName);
              }
            }}
            disabled={samples.length === 0}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 disabled:opacity-40 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir Todas as Amostras</span>
          </button>

          <button
            onClick={onClose}
            className="bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
          >
            Concluir Revisão
          </button>
        </div>
      </div>
    </div>
  );
};
