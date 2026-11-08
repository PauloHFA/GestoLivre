export interface ScanningItem<T = unknown> {
  id: string;
  label: string;
  value: T;
}

export interface ScanningEngineOptions<T = unknown> {
  items: ScanningItem<T>[][]; // Matriz de linhas e colunas (Varredura Linha-Coluna)
  intervalMs?: number;        // Intervalo de troca de item (padrão: 1200ms)
  onHighlight?: (rowIndex: number, colIndex: number | null) => void;
  onSelect?: (item: ScanningItem<T>) => void;
}

export type ScanningState = "idle" | "scanning-rows" | "scanning-cols";

/**
 * Motor de Varredura (Scanning Engine) para controle computacional com comutador único (RF-ACT-08)
 * Permite que usuários com apenas um único movimento voluntário selecionem qualquer tecla/ação.
 */
export class ScanningEngine<T = unknown> {
  private items: ScanningItem<T>[][];
  private intervalMs: number;
  private state: ScanningState = "idle";
  private currentRow = 0;
  private currentCol = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private onHighlight?: (rowIndex: number, colIndex: number | null) => void;
  private onSelect?: (item: ScanningItem<T>) => void;

  constructor(options: ScanningEngineOptions<T>) {
    this.items = options.items;
    this.intervalMs = options.intervalMs ?? 1200;
    this.onHighlight = options.onHighlight;
    this.onSelect = options.onSelect;
  }

  public getState(): ScanningState {
    return this.state;
  }

  public getCurrentIndices(): { row: number; col: number | null } {
    return {
      row: this.currentRow,
      col: this.state === "scanning-cols" ? this.currentCol : null,
    };
  }

  public setIntervalMs(ms: number): void {
    this.intervalMs = Math.max(300, ms);
    if (this.state !== "idle") {
      this.restartTimer();
    }
  }

  public start(): void {
    if (this.items.length === 0) return;
    this.state = "scanning-rows";
    this.currentRow = 0;
    this.currentCol = 0;
    this.notifyHighlight();
    this.restartTimer();
  }

  public stop(): void {
    this.clearTimer();
    this.state = "idle";
    this.currentRow = 0;
    this.currentCol = 0;
  }

  private restartTimer(): void {
    this.clearTimer();
    this.timer = setInterval(() => {
      this.tick();
    }, this.intervalMs);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Avanço automático de tempo do scanner
   */
  public tick(): void {
    if (this.state === "scanning-rows") {
      this.currentRow = (this.currentRow + 1) % this.items.length;
      this.notifyHighlight();
    } else if (this.state === "scanning-cols") {
      const activeRowItems = this.items[this.currentRow];
      if (!activeRowItems || activeRowItems.length === 0) {
        this.state = "scanning-rows";
        return;
      }
      this.currentCol = (this.currentCol + 1) % activeRowItems.length;
      this.notifyHighlight();
    }
  }

  /**
   * Disparado quando o gesto único configurado é ativado
   */
  public trigger(): ScanningItem<T> | null {
    if (this.state === "idle") {
      this.start();
      return null;
    }

    if (this.state === "scanning-rows") {
      // Fixa a linha e inicia varredura de colunas
      this.state = "scanning-cols";
      this.currentCol = 0;
      this.notifyHighlight();
      this.restartTimer();
      return null;
    }

    if (this.state === "scanning-cols") {
      // Seleciona o item da coluna ativa
      const row = this.items[this.currentRow];
      const item = row?.[this.currentCol];

      if (item && this.onSelect) {
        this.onSelect(item);
      }

      // Reinicia varredura na linha inicial
      this.state = "scanning-rows";
      this.currentCol = 0;
      this.notifyHighlight();
      this.restartTimer();

      return item ?? null;
    }

    return null;
  }

  private notifyHighlight(): void {
    if (this.onHighlight) {
      this.onHighlight(
        this.currentRow,
        this.state === "scanning-cols" ? this.currentCol : null
      );
    }
  }
}
