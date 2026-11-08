import { ActionContext, ActionExecutor } from "../types";

export class SpeechAction implements ActionExecutor {
  public async execute(payload: Record<string, unknown>, _context: ActionContext): Promise<boolean> {
    const text = typeof payload.text === "string" ? payload.text : "";
    if (!text) return false;

    const speech =
      typeof window !== "undefined" && "speechSynthesis" in window
        ? window.speechSynthesis
        : typeof globalThis !== "undefined" && "speechSynthesis" in globalThis
        ? (globalThis as unknown as { speechSynthesis: SpeechSynthesis }).speechSynthesis
        : undefined;

    const Utterance =
      typeof SpeechSynthesisUtterance !== "undefined"
        ? SpeechSynthesisUtterance
        : typeof globalThis !== "undefined" && "SpeechSynthesisUtterance" in globalThis
        ? (globalThis as unknown as { SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance })
            .SpeechSynthesisUtterance
        : undefined;

    if (!speech || !Utterance) {
      console.warn("Web Speech API não disponível neste ambiente.");
      return false;
    }

    // Cancela falas anteriores para evitar fila longa
    speech.cancel();

    const utterance = new Utterance(text);
    utterance.lang = (payload.lang as string) ?? "pt-BR";
    utterance.rate = (payload.rate as number) ?? 1.0;
    utterance.pitch = (payload.pitch as number) ?? 1.0;

    speech.speak(utterance);
    return true;
  }
}
