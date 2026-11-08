import { describe, it, expect } from "vitest";
import { KNNClassifier } from "../src/classifiers/knn";
import { GestureSample } from "../src/types";

describe("KNNClassifier", () => {
  it("treina 10 gestos com 50 amostras cada em menos de 5 segundos e atinge alta acurácia", async () => {
    const samples: GestureSample[] = [];
    const numGestures = 10;
    const samplesPerGesture = 50;
    const dim = 52; // Exemplo de blendshapes

    const gestureNames = [
      "neutro",
      "piscar_esq",
      "piscar_dir",
      "sorrir",
      "abrir_boca",
      "erguer_sobrancelha",
      "inclinar_esq",
      "inclinar_dir",
      "olhar_cima",
      "bico",
    ];

    for (let g = 0; g < numGestures; g++) {
      const gName = gestureNames[g];
      for (let s = 0; s < samplesPerGesture; s++) {
        // Gera vetor característico para o gesto com leve ruído gaussiano
        const vec = new Array(dim).fill(0.05);
        vec[g * 4] = 0.85 + (Math.random() - 0.5) * 0.1;
        vec[g * 4 + 1] = 0.70 + (Math.random() - 0.5) * 0.1;

        samples.push({
          id: `sample_${g}_${s}`,
          gestureName: gName,
          timestamp: Date.now() + s * 30,
          vector: vec,
        });
      }
    }

    const knn = new KNNClassifier({ k: 3, metric: "cosine" });

    const startTime = performance.now();
    const report = await knn.train(samples);
    const durationMs = performance.now() - startTime;

    // RNF-03: Treino em <= 5000 ms
    expect(durationMs).toBeLessThan(5000);
    // CA-TRN-02: Acurácia >= 90%
    expect(report.overallAccuracy).toBeGreaterThanOrEqual(0.9);
    expect(knn.isTrained()).toBe(true);

    // Teste de inferência em amostra nova
    const testVec = new Array(dim).fill(0.05);
    testVec[3 * 4] = 0.86; // sorriso
    testVec[3 * 4 + 1] = 0.72;
    const pred = knn.predict(testVec);

    expect(pred.name).toBe("sorrir");
    expect(pred.confidence).toBeGreaterThan(0.7);
  });

  it("emite aviso quando a classe neutro não foi gravada", async () => {
    const samples: GestureSample[] = [
      { id: "1", gestureName: "joinha", timestamp: 1, vector: [1, 0, 0] },
      { id: "2", gestureName: "joinha", timestamp: 2, vector: [0.9, 0.1, 0] },
    ];

    const knn = new KNNClassifier();
    const report = await knn.train(samples);

    expect(report.warnings.some((w) => w.includes("neutro"))).toBe(true);
  });

  it("emite aviso quando dois gestos são extremamente parecidos", async () => {
    const samples: GestureSample[] = [
      { id: "1", gestureName: "neutro", timestamp: 1, vector: [0, 0, 0] },
      { id: "2", gestureName: "neutro", timestamp: 2, vector: [0, 0, 0] },
      { id: "3", gestureName: "gestoA", timestamp: 3, vector: [1, 0.01, 0] },
      { id: "4", gestureName: "gestoA", timestamp: 4, vector: [1, 0.02, 0] },
      { id: "5", gestureName: "gestoB", timestamp: 5, vector: [1, 0.015, 0] },
      { id: "6", gestureName: "gestoB", timestamp: 6, vector: [1, 0.025, 0] },
    ];

    const knn = new KNNClassifier({ metric: "euclidean" });
    const report = await knn.train(samples);

    expect(report.warnings.some((w) => w.includes("muito parecidos"))).toBe(true);
  });
});
