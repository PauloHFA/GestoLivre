import { TremorAnalysisResult } from "@gestolivre/core";
import { X, Activity, Play, CheckCircle2, RotateCcw } from "lucide-react";

export interface TremorCalibratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCollecting: boolean;
  sampleCount: number;
  targetSamples?: number;
  result: TremorAnalysisResult | null;
  onStartCalibration: () => void;
  onApplySettings: (settings: {
    deadzone: number;
    sensitivity: number;
    holdMs: number;
    cooldownMs: number;
  }) => void;
}

export function TremorCalibratorModal({
  isOpen,
  onClose,
  isCollecting,
  sampleCount,
  targetSamples = 60,
  result,
  onStartCalibration,
  onApplySettings,
}: TremorCalibratorModalProps) {
  if (!isOpen) return null;

  const progress = Math.min((sampleCount / targetSamples) * 100, 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-calibrator-title"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-calibrator-title" className="text-base font-bold text-slate-100">
                Assistente de Calibração de Tremores
              </h2>
              <p className="text-xs text-slate-400">
                Ajuste automático de estabilidade e deadzone por análise de repouso
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
            aria-label="Fechar assistente de calibração"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-6">
          {!result && !isCollecting && (
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-500/40 animate-spin" style={{ animationDuration: "12s" }} />
                <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/30">
                  <Activity className="w-8 h-8 text-sky-400" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-sm font-semibold text-slate-200">Como funciona a calibração?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Posicione-se confortavelmente em frente à câmera e mantenha o rosto e a cabeça em estado de repouso.
                  O sistema medirá micro-oscilações para calibrar a zona de amortecimento anti-tremor automaticamente.
                </p>
              </div>

              <button
                onClick={onStartCalibration}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Teste de 3 Segundos</span>
              </button>
            </div>
          )}

          {isCollecting && (
            <div className="text-center space-y-4 py-4">
              {/* Alvo com animação radial de progresso */}
              <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-slate-800"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-emerald-400 transition-all duration-100"
                    strokeWidth="6"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * progress) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {Math.round(progress)}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {sampleCount}/{targetSamples}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200">Mantenha a cabeça parada...</p>
                <p className="text-xs text-slate-400">Medindo amplitude natural de micromovimentos.</p>
              </div>
            </div>
          )}

          {result && !isCollecting && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400">Diagnóstico de Estabilidade</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold capitalize ${
                        result.tremorSeverity === "low"
                          ? "text-emerald-400"
                          : result.tremorSeverity === "moderate"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {result.tremorSeverity === "low"
                        ? "Excelente (Baixo Tremor)"
                        : result.tremorSeverity === "moderate"
                        ? "Moderado (Com Oscilação)"
                        : "Elevado (Espasmos / Involuntário)"}
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  <span>Amostras: {result.samplesCount}</span>
                </div>
              </div>

              {/* Tabela de Recomendações Calculadas */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Zona Morta (Deadzone)</span>
                  <p className="text-sm font-mono font-bold text-sky-400">
                    {result.recommendations.deadzone}
                  </p>
                  <p className="text-[10px] text-slate-500">Amortece tremores involuntários</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Sensibilidade do Cursor</span>
                  <p className="text-sm font-mono font-bold text-sky-400">
                    {result.recommendations.sensitivity}x
                  </p>
                  <p className="text-[10px] text-slate-500">Velocidade de rastreamento</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Sustentação (holdMs)</span>
                  <p className="text-sm font-mono font-bold text-sky-400">
                    {result.recommendations.holdMs} ms
                  </p>
                  <p className="text-[10px] text-slate-500">Tempo para confirmar gesto</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Intervalo (Cooldown)</span>
                  <p className="text-sm font-mono font-bold text-sky-400">
                    {result.recommendations.cooldownMs} ms
                  </p>
                  <p className="text-[10px] text-slate-500">Evita repetições indesejadas</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={onStartCalibration}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refazer Teste</span>
                </button>

                <button
                  onClick={() => {
                    onApplySettings(result.recommendations);
                    onClose();
                  }}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aplicar Calibração Recomendada</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
