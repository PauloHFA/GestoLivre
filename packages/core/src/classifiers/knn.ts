import {
  Classifier,
  GestureSample,
  ClassificationPrediction,
  TrainingEvaluationReport,
} from "../types";

export interface KNNClassifierOptions {
  k?: number;
  metric?: "cosine" | "euclidean";
}

export class KNNClassifier implements Classifier {
  private samples: GestureSample[] = [];
  private k: number;
  private metric: "cosine" | "euclidean";
  private trained = false;
  private centroids: Map<string, number[]> = new Map();

  constructor(options: KNNClassifierOptions = {}) {
    this.k = options.k ?? 5;
    this.metric = options.metric ?? "cosine";
  }

  public isTrained(): boolean {
    return this.trained && this.samples.length > 0;
  }

  public static euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const d = a[i] - b[i];
      sum += d * d;
    }
    return Math.sqrt(sum);
  }

  public static cosineDistance(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const va = a[i];
      const vb = b[i];
      dot += va * vb;
      normA += va * va;
      normB += vb * vb;
    }
    if (normA === 0 || normB === 0) return 1.0;
    const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
    return 1 - Math.max(-1, Math.min(1, sim));
  }

  private distance(a: number[], b: number[]): number {
    return this.metric === "euclidean"
      ? KNNClassifier.euclideanDistance(a, b)
      : KNNClassifier.cosineDistance(a, b);
  }

  private calculateCentroid(vectors: number[][]): number[] {
    if (vectors.length === 0) return [];
    const dim = vectors[0].length;
    const centroid = new Array(dim).fill(0);
    for (const vec of vectors) {
      for (let i = 0; i < dim; i++) {
        centroid[i] += vec[i];
      }
    }
    return centroid.map((v) => v / vectors.length);
  }

  /**
   * Treina o classificador e executa avaliação por blocos temporais (20% teste)
   */
  public async train(samples: GestureSample[]): Promise<TrainingEvaluationReport> {
    if (samples.length === 0) {
      throw new Error("Não é possível treinar sem amostras gravadas.");
    }

    this.samples = [...samples];
    this.trained = true;

    // Agrupa por classe
    const byClass: Record<string, GestureSample[]> = {};
    for (const s of samples) {
      if (!byClass[s.gestureName]) {
        byClass[s.gestureName] = [];
      }
      byClass[s.gestureName].push(s);
    }

    // Calcula centróides
    this.centroids.clear();
    for (const [name, list] of Object.entries(byClass)) {
      this.centroids.set(name, this.calculateCentroid(list.map((l) => l.vector)));
    }

    // Avisos de sobreposição e distância para o neutro
    const warnings: string[] = [];
    const neutralCentroidDistance: Record<string, number> = {};
    const neutralCentroid = this.centroids.get("neutro");

    if (!neutralCentroid) {
      warnings.push("Atenção: A classe 'neutro' não foi gravada. Disparos acidentais podem ocorrer.");
    } else {
      for (const [name, centroid] of this.centroids.entries()) {
        if (name === "neutro") continue;
        const dist = this.distance(centroid, neutralCentroid);
        neutralCentroidDistance[name] = dist;
        if (dist < 0.15) {
          warnings.push(
            `O gesto '${name}' está muito próximo do 'neutro' (distância ${dist.toFixed(3)}). Recomenda-se regravar com movimentos mais marcados.`
          );
        }
      }
    }

    // Compara pares de gestos
    const gestureNames = Object.keys(byClass);
    for (let i = 0; i < gestureNames.length; i++) {
      for (let j = i + 1; j < gestureNames.length; j++) {
        const g1 = gestureNames[i];
        const g2 = gestureNames[j];
        const c1 = this.centroids.get(g1)!;
        const c2 = this.centroids.get(g2)!;
        const dist = this.distance(c1, c2);
        if (dist < 0.12) {
          warnings.push(
            `Os gestos '${g1}' e '${g2}' são muito parecidos entre si (distância ${dist.toFixed(3)}). Podem haver confusões no reconhecimento.`
          );
        }
      }
    }

    // Divisão por blocos temporais (20% final de cada classe como teste)
    const trainSet: GestureSample[] = [];
    const testSet: GestureSample[] = [];

    for (const [, list] of Object.entries(byClass)) {
      const splitIdx = Math.floor(list.length * 0.8);
      trainSet.push(...list.slice(0, splitIdx));
      testSet.push(...list.slice(splitIdx));
    }

    // Avaliação usando classificador temporário treinado no trainSet
    const tempKnn = new KNNClassifier({ k: Math.min(this.k, Math.max(1, Math.floor(trainSet.length / 4))), metric: this.metric });
    tempKnn.samples = trainSet;
    tempKnn.trained = true;

    const confusionMatrix: Record<string, Record<string, number>> = {};
    for (const g of gestureNames) {
      confusionMatrix[g] = {};
      for (const g2 of gestureNames) {
        confusionMatrix[g][g2] = 0;
      }
    }

    let correct = 0;
    const testTotal = testSet.length;

    for (const item of testSet) {
      const pred = tempKnn.predict(item.vector);
      if (confusionMatrix[item.gestureName] && confusionMatrix[item.gestureName][pred.name] !== undefined) {
        confusionMatrix[item.gestureName][pred.name]++;
      }
      if (pred.name === item.gestureName) {
        correct++;
      }
    }

    const overallAccuracy = testTotal > 0 ? correct / testTotal : 1.0;

    const perGesture: Record<string, { precision: number; recall: number; f1: number; samplesCount: number }> = {};
    for (const g of gestureNames) {
      const actualCount = testSet.filter((s) => s.gestureName === g).length;
      const truePositive = confusionMatrix[g]?.[g] ?? 0;
      let predictedCount = 0;
      for (const actual of gestureNames) {
        predictedCount += confusionMatrix[actual]?.[g] ?? 0;
      }

      const precision = predictedCount > 0 ? truePositive / predictedCount : 1.0;
      const recall = actualCount > 0 ? truePositive / actualCount : 1.0;
      const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

      perGesture[g] = {
        precision,
        recall,
        f1,
        samplesCount: byClass[g].length,
      };
    }

    return {
      overallAccuracy,
      perGesture,
      confusionMatrix,
      neutralCentroidDistance,
      warnings,
    };
  }

  /**
   * Realiza predição por k vizinhos mais próximos
   */
  public predict(vector: number[]): ClassificationPrediction {
    if (!this.trained || this.samples.length === 0) {
      return { name: "desconhecido", confidence: 0, distance: 1.0 };
    }

    const effectiveK = Math.min(this.k, this.samples.length);

    // Calcula distância para cada amostra
    const scored = this.samples.map((s) => ({
      name: s.gestureName,
      dist: this.distance(vector, s.vector),
    }));

    // Ordena pelo menor dist
    scored.sort((a, b) => a.dist - b.dist);

    const neighbors = scored.slice(0, effectiveK);

    // Votação ponderada pela proximidade (inverso da distância)
    const votes: Record<string, number> = {};
    let totalWeight = 0;

    for (const n of neighbors) {
      const weight = 1 / (n.dist + 1e-5);
      votes[n.name] = (votes[n.name] ?? 0) + weight;
      totalWeight += weight;
    }

    let bestName = neighbors[0].name;
    let maxWeight = 0;
    for (const [name, w] of Object.entries(votes)) {
      if (w > maxWeight) {
        maxWeight = w;
        bestName = name;
      }
    }

    const confidence = totalWeight > 0 ? maxWeight / totalWeight : 1.0;
    const avgDistance =
      neighbors.filter((n) => n.name === bestName).reduce((acc, n) => acc + n.dist, 0) /
      Math.max(1, neighbors.filter((n) => n.name === bestName).length);

    return {
      name: bestName,
      confidence,
      distance: avgDistance,
    };
  }
}
