import {
  ClassificationPrediction,
  DecisionEngineConfig,
  GestureDefinition,
  GestureEventCallback,
  GestureEventPayload,
} from "../types";

export class DecisionEngine {
  private historySize: number;
  private hysteresisRatio: number;
  private history: ClassificationPrediction[] = [];
  private currentActiveGesture: string | null = null;
  private candidateGesture: string | null = null;
  private candidateStartTime: number = 0;
  private hasTriggered = false;
  private lastTriggerTime: Map<string, number> = new Map();
  private paused = false;

  private gestureConfigs: Map<string, GestureDefinition> = new Map();
  private listeners: Map<string, Set<GestureEventCallback>> = new Map([
    ["gesturestart", new Set()],
    ["gesturehold", new Set()],
    ["gestureend", new Set()],
  ]);

  constructor(config: DecisionEngineConfig = {}) {
    this.historySize = config.historySize ?? 5;
    this.hysteresisRatio = config.hysteresisRatio ?? 0.2;
  }

  public registerGestureConfig(gesture: GestureDefinition): void {
    this.gestureConfigs.set(gesture.name, gesture);
  }

  public registerGestureConfigs(gestures: GestureDefinition[]): void {
    for (const g of gestures) {
      this.registerGestureConfig(g);
    }
  }

  public on(event: "gesturestart" | "gesturehold" | "gestureend", callback: GestureEventCallback): void {
    this.listeners.get(event)?.add(callback);
  }

  public off(event: "gesturestart" | "gesturehold" | "gestureend", callback: GestureEventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  public pause(): void {
    this.paused = true;
    if (this.currentActiveGesture) {
      this.emit("gestureend", {
        name: this.currentActiveGesture,
        confidence: 0,
        timestamp: Date.now(),
      });
      this.currentActiveGesture = null;
      this.candidateGesture = null;
      this.hasTriggered = false;
    }
  }

  public resume(): void {
    this.paused = false;
    this.history = [];
  }

  public isPaused(): boolean {
    return this.paused;
  }

  private emit(event: "gesturestart" | "gesturehold" | "gestureend", payload: GestureEventPayload): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks || this.paused) return;
    for (const cb of callbacks) {
      try {
        cb(payload);
      } catch (err) {
        console.error(`Erro no listener do evento ${event}:`, err);
      }
    }
  }

  /**
   * Calcula média móvel ponderada das probabilidades para suavizar variações de quadros
   */
  private getSmoothedPrediction(): { name: string; smoothedConfidence: number } {
    if (this.history.length === 0) {
      return { name: "neutro", smoothedConfidence: 0 };
    }

    const confMap: Record<string, number> = {};
    for (const pred of this.history) {
      confMap[pred.name] = (confMap[pred.name] ?? 0) + pred.confidence;
    }

    let topName = "neutro";
    let maxTotal = 0;
    for (const [name, total] of Object.entries(confMap)) {
      if (total > maxTotal) {
        maxTotal = total;
        topName = name;
      }
    }

    return {
      name: topName,
      smoothedConfidence: maxTotal / this.history.length,
    };
  }

  /**
   * Processa cada predição de quadro (chamado a cada frame do detector)
   */
  public processFrame(rawPrediction: ClassificationPrediction, now: number = Date.now()): void {
    if (this.paused) return;

    // Atualiza histórico temporal
    this.history.push(rawPrediction);
    if (this.history.length > this.historySize) {
      this.history.shift();
    }

    const { name, smoothedConfidence } = this.getSmoothedPrediction();

    // Se for 'neutro' ou 'desconhecido', trata finalização de gesto ativo
    if (name === "neutro" || name === "desconhecido") {
      this.handleGestureEnd(now);
      return;
    }

    const config = this.gestureConfigs.get(name) ?? {
      id: name,
      name,
      sources: ["face"],
      threshold: 0.85,
      holdMs: 300,
      cooldownMs: 1000,
      mode: "single",
    };

    const enterThreshold = config.threshold;
    const exitThreshold = config.threshold * (1 - this.hysteresisRatio);

    // Se mudou de gesto candidato
    if (this.candidateGesture !== name) {
      if (this.currentActiveGesture && this.currentActiveGesture !== name) {
        this.handleGestureEnd(now);
      }

      if (smoothedConfidence >= enterThreshold) {
        this.candidateGesture = name;
        this.candidateStartTime = now;
        this.hasTriggered = false;
      }
      return;
    }

    // Mesmo gesto: verifica se ainda está acima do limiar de saída (histerese)
    if (smoothedConfidence < exitThreshold) {
      this.handleGestureEnd(now);
      return;
    }

    const elapsed = now - this.candidateStartTime;

    // Verifica sustentação (holdMs)
    if (elapsed >= config.holdMs) {
      const lastTrigger = this.lastTriggerTime.get(name) ?? 0;
      const inCooldown = now - lastTrigger < config.cooldownMs;

      if (!this.hasTriggered && !inCooldown) {
        this.currentActiveGesture = name;
        this.hasTriggered = true;
        this.lastTriggerTime.set(name, now);

        this.emit("gesturestart", {
          name,
          confidence: smoothedConfidence,
          timestamp: now,
          holdDurationMs: elapsed,
        });
      } else if (this.currentActiveGesture === name) {
        this.emit("gesturehold", {
          name,
          confidence: smoothedConfidence,
          timestamp: now,
          holdDurationMs: elapsed,
        });
      }
    }
  }

  private handleGestureEnd(now: number): void {
    if (this.currentActiveGesture) {
      const elapsed = now - this.candidateStartTime;
      this.emit("gestureend", {
        name: this.currentActiveGesture,
        confidence: 0,
        timestamp: now,
        holdDurationMs: elapsed,
      });
    }

    this.currentActiveGesture = null;
    this.candidateGesture = null;
    this.hasTriggered = false;
  }
}
