import { describe, it, expect } from "vitest";
import { IrisGazeTracker } from "../src/accessibility/iris-gaze";
import { Point3D } from "../src/types";

describe("IrisGazeTracker (Rastreamento Ocular por Íris)", () => {
  it("retorna null se não houver landmarks de íris suficientes (< 474)", () => {
    const fewLandmarks: Point3D[] = Array(468).fill({ x: 0.5, y: 0.5, z: 0 });
    const result = IrisGazeTracker.estimate(fewLandmarks);
    expect(result).toBeNull();
  });

  it("calcula olhar centralizado quando as pupilas estão no centro dos olhos", () => {
    const landmarks: Point3D[] = Array(478).fill({ x: 0.5, y: 0.5, z: 0 });

    // Olho esquerdo: cantos x = 0.30 e 0.40, íris x = 0.35 (centro exato)
    landmarks[33] = { x: 0.30, y: 0.5, z: 0 };
    landmarks[133] = { x: 0.40, y: 0.5, z: 0 };
    landmarks[468] = { x: 0.35, y: 0.5, z: 0 };

    // Olho direito: cantos x = 0.60 e 0.70, íris x = 0.65 (centro exato)
    landmarks[362] = { x: 0.60, y: 0.5, z: 0 };
    landmarks[263] = { x: 0.70, y: 0.5, z: 0 };
    landmarks[473] = { x: 0.65, y: 0.5, z: 0 };

    const result = IrisGazeTracker.estimate(landmarks);
    expect(result).not.toBeNull();
    expect(result!.horizontalRatio).toBeCloseTo(0.5, 1);
    expect(result!.offsetNormalizedX).toBeCloseTo(0.0, 1);
  });

  it("detecta olhar para a direita quando as pupilas se deslocam para a direita", () => {
    const landmarks: Point3D[] = Array(478).fill({ x: 0.5, y: 0.5, z: 0 });

    // Pupilas deslocadas para a direita do globo ocular (ex: 80% da largura)
    landmarks[33] = { x: 0.30, y: 0.5, z: 0 };
    landmarks[133] = { x: 0.40, y: 0.5, z: 0 };
    landmarks[468] = { x: 0.38, y: 0.5, z: 0 }; // 80%

    landmarks[362] = { x: 0.60, y: 0.5, z: 0 };
    landmarks[263] = { x: 0.70, y: 0.5, z: 0 };
    landmarks[473] = { x: 0.68, y: 0.5, z: 0 }; // 80%

    const result = IrisGazeTracker.estimate(landmarks);
    expect(result).not.toBeNull();
    expect(result!.horizontalRatio).toBeGreaterThan(0.7);
    expect(result!.offsetNormalizedX).toBeGreaterThan(0.4);
  });
});
