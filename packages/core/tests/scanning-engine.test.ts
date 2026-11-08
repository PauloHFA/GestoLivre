import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ScanningEngine, ScanningItem } from "../src/accessibility/scanning-engine";

describe("ScanningEngine (RF-ACT-08)", () => {
  let engine: ScanningEngine<string>;
  const sampleGrid: ScanningItem<string>[][] = [
    [
      { id: "A", label: "A", value: "A" },
      { id: "B", label: "B", value: "B" },
      { id: "C", label: "C", value: "C" },
    ],
    [
      { id: "D", label: "D", value: "D" },
      { id: "E", label: "E", value: "E" },
      { id: "F", label: "F", value: "F" },
    ],
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    engine?.stop();
    vi.useRealTimers();
  });

  it("inicia em estado ocioso e avança linhas periodicamente ao iniciar", () => {
    const onHighlight = vi.fn();
    engine = new ScanningEngine({
      items: sampleGrid,
      intervalMs: 1000,
      onHighlight,
    });

    expect(engine.getState()).toBe("idle");

    engine.start();
    expect(engine.getState()).toBe("scanning-rows");
    expect(engine.getCurrentIndices()).toEqual({ row: 0, col: null });

    // Avança 1 segundo -> deve ir para a linha 1
    vi.advanceTimersByTime(1000);
    expect(engine.getCurrentIndices()).toEqual({ row: 1, col: null });

    // Avança mais 1 segundo -> deve voltar ciclicamente para a linha 0
    vi.advanceTimersByTime(1000);
    expect(engine.getCurrentIndices()).toEqual({ row: 0, col: null });
  });

  it("primeiro acionamento de comutador fixa a linha e inicia varredura de colunas", () => {
    engine = new ScanningEngine({
      items: sampleGrid,
      intervalMs: 1000,
    });

    engine.start();
    // Avança até a linha 1
    vi.advanceTimersByTime(1000);
    expect(engine.getCurrentIndices()).toEqual({ row: 1, col: null });

    // Dispara comutador único
    const result = engine.trigger();
    expect(result).toBeNull(); // Primeiro clique apenas seleciona a linha
    expect(engine.getState()).toBe("scanning-cols");
    expect(engine.getCurrentIndices()).toEqual({ row: 1, col: 0 });

    // Avança 1 segundo -> deve avançar para a coluna 1 da mesma linha
    vi.advanceTimersByTime(1000);
    expect(engine.getCurrentIndices()).toEqual({ row: 1, col: 1 });
  });

  it("segundo acionamento de comutador seleciona o item e reinicia a varredura de linhas", () => {
    const onSelect = vi.fn();
    engine = new ScanningEngine({
      items: sampleGrid,
      intervalMs: 1000,
      onSelect,
    });

    engine.start();
    // Seleciona a linha 0
    engine.trigger();
    expect(engine.getState()).toBe("scanning-cols");

    // Avança até a coluna 1 (Letra B)
    vi.advanceTimersByTime(1000);
    expect(engine.getCurrentIndices()).toEqual({ row: 0, col: 1 });

    // Dispara comutador para escolher a Letra B
    const selectedItem = engine.trigger();

    expect(selectedItem).toEqual({ id: "B", label: "B", value: "B" });
    expect(onSelect).toHaveBeenCalledWith({ id: "B", label: "B", value: "B" });

    // Deve retornar para o modo de linhas automaticamente
    expect(engine.getState()).toBe("scanning-rows");
    expect(engine.getCurrentIndices()).toEqual({ row: 0, col: null });
  });

  it("interrompe a varredura corretamente ao chamar stop()", () => {
    engine = new ScanningEngine({ items: sampleGrid, intervalMs: 1000 });
    engine.start();
    expect(engine.getState()).toBe("scanning-rows");

    engine.stop();
    expect(engine.getState()).toBe("idle");

    vi.advanceTimersByTime(2000);
    expect(engine.getCurrentIndices()).toEqual({ row: 0, col: null });
  });
});
