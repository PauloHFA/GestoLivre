import { IrisGazeEstimate } from "./iris-gaze";

export interface HeadCursorOptions {
  sensitivity?: number;     // Multiplicador de sensibilidade (padrão: 2.5)
  deadzone?: number;        // Raio central em que pequenos movimentos são ignorados (padrão: 0.02)
  smoothingFactor?: number; // Fator de suavização EMA (0 a 1, padrão: 0.25)
  dwellTimeMs?: number;     // Tempo para disparar clique automático (padrão: 1000ms)
  dwellRadius?: number;     // Raio de tolerância para manter dwell (padrão: 35px)
  screenWidth?: number;
  screenHeight?: number;
  enableGazeRefinement?: boolean; // Micro-ajuste do cursor pela íris (gaze tracking)
  gazeWeight?: number;           // Peso de influência do olhar fino (0 a 1, padrão: 0.20)
  onCursorMove?: (x: number, y: number) => void;
  onDwellProgress?: (progress: number) => void; // 0.0 a 1.0
  onDwellClick?: (x: number, y: number) => void;
}

export class HeadCursor {
  private sensitivity: number;
  private deadzone: number;
  private smoothingFactor: number;
  private dwellTimeMs: number;
  private dwellRadius: number;
  private screenWidth: number;
  private screenHeight: number;
  private enableGazeRefinement: boolean;
  private gazeWeight: number;

  private smoothX = 0;
  private smoothY = 0;
  private originX = 0.5;
  private originY = 0.5;
  private calibrated = false;

  private dwellStartX = 0;
  private dwellStartY = 0;
  private dwellStartTime = 0;
  private dwellActive = false;

  private onCursorMove?: (x: number, y: number) => void;
  private onDwellProgress?: (progress: number) => void;
  private onDwellClick?: (x: number, y: number) => void;

  constructor(options: HeadCursorOptions = {}) {
    this.sensitivity = options.sensitivity ?? 2.5;
    this.deadzone = options.deadzone ?? 0.02;
    this.smoothingFactor = options.smoothingFactor ?? 0.25;
    this.dwellTimeMs = options.dwellTimeMs ?? 1000;
    this.dwellRadius = options.dwellRadius ?? 35;
    this.screenWidth = options.screenWidth ?? (typeof window !== "undefined" ? window.innerWidth : 1280);
    this.screenHeight = options.screenHeight ?? (typeof window !== "undefined" ? window.innerHeight : 720);
    this.enableGazeRefinement = options.enableGazeRefinement ?? false;
    this.gazeWeight = options.gazeWeight ?? 0.20;

    this.onCursorMove = options.onCursorMove;
    this.onDwellProgress = options.onDwellProgress;
    this.onDwellClick = options.onDwellClick;

    // Inicializa a posição suave no centro da tela
    this.smoothX = this.screenWidth / 2;
    this.smoothY = this.screenHeight / 2;
    this.dwellStartX = this.smoothX;
    this.dwellStartY = this.smoothY;
  }

  public calibrateOrigin(normalizedX: number, normalizedY: number): void {
    this.originX = normalizedX;
    this.originY = normalizedY;
    this.smoothX = this.screenWidth / 2;
    this.smoothY = this.screenHeight / 2;
    this.dwellStartX = this.smoothX;
    this.dwellStartY = this.smoothY;
    this.calibrated = true;
  }

  public setDeadzone(deadzone: number): void {
    this.deadzone = deadzone;
  }

  public setSensitivity(sensitivity: number): void {
    this.sensitivity = sensitivity;
  }

  public setDwellTime(dwellTimeMs: number): void {
    this.dwellTimeMs = dwellTimeMs;
  }

  public setGazeRefinement(enabled: boolean, weight?: number): void {
    this.enableGazeRefinement = enabled;
    if (weight !== undefined) {
      this.gazeWeight = weight;
    }
  }

  /**
   * Atualização híbrida Cabeça + Micro-ajuste Ocular por Íris (Gaze Tracking)
   */
  public updateWithGaze(
    normalizedHeadX: number,
    normalizedHeadY: number,
    gazeEstimate?: IrisGazeEstimate | null,
    now: number = Date.now()
  ): {
    x: number;
    y: number;
    dwellProgress: number;
    clicked: boolean;
  } {
    if (this.enableGazeRefinement && gazeEstimate && gazeEstimate.confidence > 0.5) {
      const deltaGazeX = gazeEstimate.offsetNormalizedX * 0.03 * this.gazeWeight;
      const deltaGazeY = gazeEstimate.offsetNormalizedY * 0.03 * this.gazeWeight;
      return this.update(normalizedHeadX + deltaGazeX, normalizedHeadY + deltaGazeY, now);
    }
    return this.update(normalizedHeadX, normalizedHeadY, now);
  }

  /**
   * Processa o ponto central da cabeça/nariz normalizado (x: 0..1, y: 0..1)
   */
  public update(normalizedX: number, normalizedY: number, now: number = Date.now()): {
    x: number;
    y: number;
    dwellProgress: number;
    clicked: boolean;
  } {
    if (!this.calibrated) {
      this.calibrateOrigin(normalizedX, normalizedY);
    }

    // Deslocamento relativo ao ponto central calibrado
    // Inverte o eixo X para coincidir com o espelhamento natural da câmera
    const dx = -(normalizedX - this.originX);
    const dy = normalizedY - this.originY;

    // Filtro de Zona Morta (Deadzone)
    const dist = Math.sqrt(dx * dx + dy * dy);
    let targetX = this.screenWidth / 2;
    let targetY = this.screenHeight / 2;

    if (dist > this.deadzone) {
      targetX = this.screenWidth / 2 + dx * this.screenWidth * this.sensitivity;
      targetY = this.screenHeight / 2 + dy * this.screenHeight * this.sensitivity;
    }

    // Clamping nos limites da tela
    targetX = Math.max(0, Math.min(this.screenWidth, targetX));
    targetY = Math.max(0, Math.min(this.screenHeight, targetY));

    // Suavização Temporal Exponencial (EMA)
    this.smoothX += (targetX - this.smoothX) * this.smoothingFactor;
    this.smoothY += (targetY - this.smoothY) * this.smoothingFactor;

    if (this.onCursorMove) {
      this.onCursorMove(this.smoothX, this.smoothY);
    }

    // Lógica de Dwell Click
    let clicked = false;
    let dwellProgress = 0;

    const dwellDist = Math.hypot(this.smoothX - this.dwellStartX, this.smoothY - this.dwellStartY);

    if (dwellDist <= this.dwellRadius) {
      if (!this.dwellActive) {
        this.dwellActive = true;
        this.dwellStartTime = now;
        this.dwellStartX = this.smoothX;
        this.dwellStartY = this.smoothY;
      } else {
        const elapsed = now - this.dwellStartTime;
        dwellProgress = Math.min(1.0, elapsed / this.dwellTimeMs);

        if (this.onDwellProgress) {
          this.onDwellProgress(dwellProgress);
        }

        if (elapsed >= this.dwellTimeMs) {
          clicked = true;
          if (this.onDwellClick) {
            this.onDwellClick(this.smoothX, this.smoothY);
          }
          // Reinicia ciclo após o clique para evitar cliques repetidos acidentais
          this.dwellActive = false;
          this.dwellStartTime = now + 600; // Cooldown de 600ms
        }
      }
    } else {
      this.dwellActive = false;
      this.dwellStartX = this.smoothX;
      this.dwellStartY = this.smoothY;
      if (this.onDwellProgress) {
        this.onDwellProgress(0);
      }
    }

    return {
      x: this.smoothX,
      y: this.smoothY,
      dwellProgress,
      clicked,
    };
  }
}
