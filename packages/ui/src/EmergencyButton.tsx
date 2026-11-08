import React from "react";
import { AlertOctagon } from "lucide-react";

export interface EmergencyButtonProps {
  isPaused: boolean;
  onToggle: () => void;
  className?: string;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  isPaused,
  onToggle,
  className = "",
}) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition shadow-lg ${
        isPaused
          ? "bg-amber-600 hover:bg-amber-500 text-white animate-pulse"
          : "bg-rose-600 hover:bg-rose-500 text-white"
      } ${className}`}
      title="Atalho de teclado: Escape"
      aria-label={isPaused ? "Retomar reconhecimento de gestos" : "Pausa de emergência no reconhecimento"}
    >
      <AlertOctagon className="w-5 h-5 flex-shrink-0" />
      <span>{isPaused ? "RECONHECIMENTO PAUSADO" : "PAUSA DE EMERGÊNCIA (Esc)"}</span>
    </button>
  );
};
