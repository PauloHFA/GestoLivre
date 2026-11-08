import { describe, it, expect, vi } from "vitest";
import { DecisionEngine } from "../src/engine/decision-engine";

describe("DecisionEngine", () => {
  it("não dispara ação quando gesto dura menos que holdMs (CA-ACT-01)", () => {
    const engine = new DecisionEngine({ historySize: 3, hysteresisRatio: 0.2 });
    engine.registerGestureConfig({
      id: "piscar-esq",
      name: "piscar-esquerdo",
      sources: ["face"],
      threshold: 0.85,
      holdMs: 400,
      cooldownMs: 1000,
      mode: "single",
    });

    const onStart = vi.fn();
    engine.on("gesturestart", onStart);

    const startTime = 1000;
    // Simula 250ms de quadros com alta confiança
    for (let t = startTime; t <= startTime + 250; t += 33) {
      engine.processFrame({ name: "piscar-esquerdo", confidence: 0.95, distance: 0.05 }, t);
    }

    // O gesto cessa antes de atingir 400 ms
    engine.processFrame({ name: "neutro", confidence: 0.9, distance: 0.05 }, startTime + 280);

    expect(onStart).not.toHaveBeenCalled();
  });

  it("dispara ação uma única vez quando gesto é mantido por tempo >= holdMs (CA-ACT-01)", () => {
    const engine = new DecisionEngine({ historySize: 3, hysteresisRatio: 0.2 });
    engine.registerGestureConfig({
      id: "piscar-esq",
      name: "piscar-esquerdo",
      sources: ["face"],
      threshold: 0.85,
      holdMs: 400,
      cooldownMs: 1000,
      mode: "single",
    });

    const onStart = vi.fn();
    const onHold = vi.fn();
    const onEnd = vi.fn();

    engine.on("gesturestart", onStart);
    engine.on("gesturehold", onHold);
    engine.on("gestureend", onEnd);

    const startTime = 1000;
    // Simula 500ms de quadros com confiança 0.95 (passa de 400ms)
    for (let t = startTime; t <= startTime + 500; t += 33) {
      engine.processFrame({ name: "piscar-esquerdo", confidence: 0.95, distance: 0.05 }, t);
    }

    // Retorna ao neutro
    engine.processFrame({ name: "neutro", confidence: 0.9, distance: 0.05 }, startTime + 533);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "piscar-esquerdo",
        confidence: expect.any(Number),
      })
    );
    expect(onHold).toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("pausa de emergência congela eventos imediatamente (CA-ACT-03)", () => {
    const engine = new DecisionEngine();
    engine.registerGestureConfig({
      id: "joinha",
      name: "joinha",
      sources: ["hand"],
      threshold: 0.8,
      holdMs: 100,
      cooldownMs: 1000,
      mode: "single",
    });

    const onStart = vi.fn();
    engine.on("gesturestart", onStart);

    engine.pause();
    expect(engine.isPaused()).toBe(true);

    // Mesmo enviando quadros válidos, nenhum evento deve disparar
    for (let t = 1000; t <= 1300; t += 33) {
      engine.processFrame({ name: "joinha", confidence: 0.95, distance: 0.05 }, t);
    }

    expect(onStart).not.toHaveBeenCalled();

    // Retoma
    engine.resume();
    expect(engine.isPaused()).toBe(false);
  });
});
