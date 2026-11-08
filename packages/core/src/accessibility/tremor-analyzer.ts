import { Point3D } from "../types";

export interface TremorAnalysisResult {
  samplesCount: number;
  mean: { x: number; y: number };
  stdDev: { x: number; y: number };
  maxDisplacement: number;
  tremorSeverity: "low" | "moderate" | "high";
  recommendations: {
    deadzone: number;
    sensitivity: number;
    holdMs: number;
    cooldownMs: number;
  };
}

export class TremorAnalyzer {
  private samples: Array<{ x: number; y: number; timestamp: number }> = [];
  private isCollecting = false;

  public start(): void {
    this.samples = [];
    this.isCollecting = true;
  }

  public addSample(point: Point3D): void {
    if (!this.isCollecting) return;
    this.samples.push({
      x: point.x,
      y: point.y,
      timestamp: Date.now(),
    });
  }

  public stop(): TremorAnalysisResult {
    this.isCollecting = false;
    return this.analyze();
  }

  public getSampleCount(): number {
    return this.samples.length;
  }

  public analyze(): TremorAnalysisResult {
    const n = this.samples.length;
    if (n < 5) {
      // Retorna valores padrão caso não haja amostras suficientes
      return {
        samplesCount: n,
        mean: { x: 0.5, y: 0.5 },
        stdDev: { x: 0.01, y: 0.01 },
        maxDisplacement: 0.02,
        tremorSeverity: "low",
        recommendations: {
          deadzone: 0.02,
          sensitivity: 2.5,
          holdMs: 300,
          cooldownMs: 1000,
        },
      };
    }

    // Calcula médias
    const sumX = this.samples.reduce((acc, s) => acc + s.x, 0);
    const sumY = this.samples.reduce((acc, s) => acc + s.y, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    // Calcula desvio padrão
    const varianceX = this.samples.reduce((acc, s) => acc + Math.pow(s.x - meanX, 2), 0) / n;
    const varianceY = this.samples.reduce((acc, s) => acc + Math.pow(s.y - meanY, 2), 0) / n;
    const stdDevX = Math.sqrt(varianceX);
    const stdDevY = Math.sqrt(varianceY);
    const maxStdDev = Math.max(stdDevX, stdDevY);

    // Calcula deslocamento máximo a partir da média
    let maxDisplacement = 0;
    for (const s of this.samples) {
      const dist = Math.hypot(s.x - meanX, s.y - meanY);
      if (dist > maxDisplacement) {
        maxDisplacement = dist;
      }
    }

    // Classifica severidade do tremor
    let severity: "low" | "moderate" | "high" = "low";
    if (maxStdDev > 0.025 || maxDisplacement > 0.05) {
      severity = "high";
    } else if (maxStdDev > 0.012 || maxDisplacement > 0.025) {
      severity = "moderate";
    }

    // Gera recomendações personalizadas
    // Deadzone cobre 2.5 sigmas ou o deslocamento mediano observado
    const calculatedDeadzone = Math.min(Math.max(maxStdDev * 2.8, 0.015), 0.08);

    let recommendedSensitivity = 2.5;
    let recommendedHoldMs = 300;
    let recommendedCooldownMs = 1000;

    if (severity === "high") {
      recommendedSensitivity = 2.0; // Reduz sensibilidade para movimentos amplos e bruscos
      recommendedHoldMs = 450;       // Exige sustentação maior para filtrar espasmos involuntários
      recommendedCooldownMs = 1400;  // Previne disparos duplos
    } else if (severity === "moderate") {
      recommendedSensitivity = 2.6;
      recommendedHoldMs = 350;
      recommendedCooldownMs = 1100;
    } else {
      recommendedSensitivity = 3.0; // Movimento suave permite sensibilidade maior
      recommendedHoldMs = 250;
      recommendedCooldownMs = 800;
    }

    return {
      samplesCount: n,
      mean: { x: Number(meanX.toFixed(4)), y: Number(meanY.toFixed(4)) },
      stdDev: { x: Number(stdDevX.toFixed(4)), y: Number(stdDevY.toFixed(4)) },
      maxDisplacement: Number(maxDisplacement.toFixed(4)),
      tremorSeverity: severity,
      recommendations: {
        deadzone: Number(calculatedDeadzone.toFixed(4)),
        sensitivity: recommendedSensitivity,
        holdMs: recommendedHoldMs,
        cooldownMs: recommendedCooldownMs,
      },
    };
  }
}
