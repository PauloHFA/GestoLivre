import { describe, it, expect } from "vitest";
import { LandmarkNormalizer } from "../src/preprocessing/normalizer";
import { Point3D } from "../src/types";

describe("LandmarkNormalizer", () => {
  it("normaliza pontos da face com invariância a translação e escala", () => {
    // Face sintética
    const rawFace: Point3D[] = [];
    for (let i = 0; i < 468; i++) {
      rawFace.push({ x: 100 + i * 0.1, y: 200 + i * 0.1, z: i * 0.05 });
    }
    // Define pontos de referência: 1 (nariz), 33 (olho esquerdo), 263 (olho direito)
    rawFace[1] = { x: 150, y: 250, z: 0 };
    rawFace[33] = { x: 130, y: 230, z: 0 };
    rawFace[263] = { x: 170, y: 230, z: 0 };

    const norm1 = LandmarkNormalizer.normalizeFace(rawFace);
    expect(norm1.length).toBe(468 * 3);

    // O ponto do nariz normalizado deve ter coordenadas (0, 0, 0)
    expect(norm1[1 * 3]).toBeCloseTo(0, 4);
    expect(norm1[1 * 3 + 1]).toBeCloseTo(0, 4);
    expect(norm1[1 * 3 + 2]).toBeCloseTo(0, 4);

    // Se transladarmos toda a face por +50 em x e +100 em y, os pontos normalizados devem ser idênticos
    const translatedFace = rawFace.map((pt) => ({ x: pt.x + 50, y: pt.y + 100, z: pt.z }));
    const norm2 = LandmarkNormalizer.normalizeFace(translatedFace);

    for (let i = 0; i < norm1.length; i++) {
      expect(norm1[i]).toBeCloseTo(norm2[i], 4);
    }
  });

  it("normaliza blendshapes em ordem alfabética determinística", () => {
    const rawBs = {
      mouthSmileLeft: 0.8,
      jawOpen: 0.1,
      eyeBlinkLeft: 0.95,
      browInnerUp: 0.4,
    };

    const vec = LandmarkNormalizer.normalizeBlendshapes(rawBs);
    // Ordem alfabética: browInnerUp (0.4), eyeBlinkLeft (0.95), jawOpen (0.1), mouthSmileLeft (0.8)
    expect(vec).toEqual([0.4, 0.95, 0.1, 0.8]);
  });

  it("normaliza landmarks de mão ancorados no punho", () => {
    const hand: Point3D[] = [];
    for (let i = 0; i < 21; i++) {
      hand.push({ x: 50 + i * 2, y: 80 + i * 3, z: 0 });
    }
    hand[0] = { x: 50, y: 80, z: 0 }; // Punho
    hand[9] = { x: 50, y: 180, z: 0 }; // MCP Médio (distância 100)

    const normHand = LandmarkNormalizer.normalizeHand(hand);
    expect(normHand.length).toBe(21 * 3);
    expect(normHand[0]).toBeCloseTo(0, 4);
    expect(normHand[1]).toBeCloseTo(0, 4);
    expect(normHand[9 * 3 + 1]).toBeCloseTo(1, 4); // y normalizado deve ser 1.0
  });
});
