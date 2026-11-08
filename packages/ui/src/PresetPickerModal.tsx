import { ACCESSIBILITY_PRESETS, AccessibilityPreset } from "@gestolivre/core";
import { X, Sparkles, Check } from "lucide-react";

export interface PresetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: AccessibilityPreset) => void;
  currentProfileId?: string;
}

export function PresetPickerModal({
  isOpen,
  onClose,
  onSelectPreset,
  currentProfileId,
}: PresetPickerModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-presets-title"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-presets-title" className="text-base font-bold text-slate-100">
                Modelos Clínicos Prontos (Presets)
              </h2>
              <p className="text-xs text-slate-400">
                Configurações pré-definidas baseadas em condições motoras reais
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
            aria-label="Fechar catálogo de modelos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Modelos */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {ACCESSIBILITY_PRESETS.map((preset) => {
            const isSelected = currentProfileId === preset.profile.id;

            return (
              <div
                key={preset.id}
                className={`p-5 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected
                    ? "bg-sky-950/30 border-sky-500/50 ring-1 ring-sky-500/50"
                    : "bg-slate-800/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                      {preset.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">{preset.title}</h3>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    🎯 Indicado para: <span className="text-slate-200">{preset.targetCondition}</span>
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {preset.profile.gestures.map((g) => (
                      <span
                        key={g.id}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={() => {
                      onSelectPreset(preset);
                      onClose();
                    }}
                    className={`min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      isSelected
                        ? "bg-slate-800 text-slate-300 border border-slate-700 cursor-default"
                        : "bg-sky-600 hover:bg-sky-500 text-white shadow"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Perfil Ativo</span>
                      </>
                    ) : (
                      <span>Carregar Este Modelo</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
