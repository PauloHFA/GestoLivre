import { describe, it, expect } from "vitest";
import { TremorAnalyzer } from "../src/accessibility/tremor-analyzer";

describe("TremorAnalyzer (Calibração Automática de Tremores)", () => {
  it("retorna parâmetros padrão se houver poucas amostras", () => {
    const analyzer = new TremorAnalyzer();
    analyzer.start();
    analyzer.addSample({ x: 0.5, y: 0.5, z: 0 });
    const result = analyzer.stop();

    expect(result.samplesCount).toBe(1);
    expect(result.tremorSeverity).toBe("low");
    expect(result.recommendations.deadzone).toBe(0.02);
  });

  it("detecta baixa oscilação e sugere alta sensibilidade e deadzone compacta", () => {
    const analyzer = new TremorAnalyzer();
    analyzer.start();

    // Simula 20 amostras com ruído muito baixo (< 0.002)
    for (let i = 0; i < 20; i++) {
      const jitter = (Math.sin(i) * 0.001);
      analyzer.addSample({ x: 0.5 + jitter, y: 0.5 + jitter, z: 0 });
    }

    const result = analyzer.stop();
    expect(result.samplesCount).toBe(20);
    expect(result.tremorSeverity).toBe("low");
    expect(result.recommendations.deadzone).toBeLessThanOrEqual(0.025);
    expect(result.recommendations.sensitivity).toBe(3.0);
    expect(result.recommendations.holdMs).toBe(250);
  });

  it("detecta tremores severos e aumenta deadzone, holdMs e cooldown para evitar falsos positivos", () => {
    const analyzer = new TremorAnalyzer();
    analyzer.start();

    // Simula 30 amostras com grande amplitude de espasmos/tremores (> 0.03)
    for (let i = 0; i < 30; i++) {
      const spasm = (Math.sin(i * 1.5) * 0.04);
      analyzer.addSample({ x: 0.5 + spasm, y: 0.5 + spasm, z: 0 });
    }

    const result = analyzer.stop();
    expect(result.samplesCount).toBe(30);
    expect(result.tremorSeverity).toBe("high");
    expect(result.recommendations.deadzone).toBeGreaterThanOrEqual(0.04);
    expect(result.recommendations.holdMs).toBe(450);
    expect(result.recommendations.cooldownMs).toBe(1400);
  });
});
