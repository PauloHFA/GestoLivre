import { describe, it, expect, vi } from "vitest";
import { HeadCursor } from "../src/accessibility/head-cursor";

describe("HeadCursor (RF-ACT-07)", () => {
  it("inicia calibrando a origem neutra automaticamente", () => {
    const onMove = vi.fn();
    const cursor = new HeadCursor({
      screenWidth: 1000,
      screenHeight: 1000,
      onCursorMove: onMove,
    });

    // Primeira atualização calibra o centro em (0.5, 0.5)
    const result = cursor.update(0.5, 0.5);

    expect(result.x).toBeCloseTo(500, 0);
    expect(result.y).toBeCloseTo(500, 0);
    expect(onMove).toHaveBeenCalled();
  });

  it("ignora tremores e micro-movimentos dentro da zona morta (deadzone)", () => {
    const cursor = new HeadCursor({
      screenWidth: 1000,
      screenHeight: 1000,
      deadzone: 0.05,
    });

    // Calibra no centro
    cursor.calibrateOrigin(0.5, 0.5);

    // Micro-deslocamento de 0.01 (abaixo da deadzone de 0.05)
    const result = cursor.update(0.505, 0.505);

    // Deve permanecer no centro da tela
    expect(result.x).toBeCloseTo(500, 0);
    expect(result.y).toBeCloseTo(500, 0);
  });

  it("move o cursor proporcionalmente à sensibilidade para movimentos intencionais", () => {
    const cursor = new HeadCursor({
      screenWidth: 1000,
      screenHeight: 1000,
      sensitivity: 2.0,
      deadzone: 0.01,
      smoothingFactor: 1.0, // Resposta imediata para teste de cálculo
    });

    cursor.calibrateOrigin(0.5, 0.5);

    // Cabeça se move para a esquerda (x: 0.40 -> dx = -(0.40 - 0.50) = +0.10)
    // Com sensibilidade 2.0: deslocamento = +0.10 * 1000 * 2 = +200px
    const result = cursor.update(0.4, 0.5);

    expect(result.x).toBeCloseTo(700, 0); // 500 + 200 = 700
    expect(result.y).toBeCloseTo(500, 0);
  });

  it("dispara clique automático por fixação (dwell click) após atingir o tempo configurado", () => {
    const onDwellClick = vi.fn();
    const onDwellProgress = vi.fn();

    const cursor = new HeadCursor({
      screenWidth: 1000,
      screenHeight: 1000,
      dwellTimeMs: 800,
      dwellRadius: 30,
      smoothingFactor: 1.0,
      onDwellClick,
      onDwellProgress,
    });

    cursor.calibrateOrigin(0.5, 0.5);

    const baseTime = 10000;
    // Inicia dwell no instante baseTime
    cursor.update(0.5, 0.5, baseTime);

    // Ponto parado durante 400ms (50% do dwell)
    const midResult = cursor.update(0.5, 0.5, baseTime + 400);
    expect(midResult.clicked).toBe(false);
    expect(midResult.dwellProgress).toBeCloseTo(0.5, 1);
    expect(onDwellClick).not.toHaveBeenCalled();

    // Permanece parado até completar 800ms
    const finalResult = cursor.update(0.5, 0.5, baseTime + 800);
    expect(finalResult.clicked).toBe(true);
    expect(onDwellClick).toHaveBeenCalledTimes(1);
    expect(onDwellClick).toHaveBeenCalledWith(500, 500);
  });
});
