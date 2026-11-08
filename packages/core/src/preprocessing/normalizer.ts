import { Point3D, VisionSource, FrameLandmarks } from "../types";

export class LandmarkNormalizer {
  /**
   * Normaliza pontos 3D da face:
   * Âncora: Ponto do Nariz (index 1)
   * Escala: Distância interocular (pontos 33 e 263)
   */
  public static normalizeFace(
    landmarks: Point3D[],
    mirror = false
  ): number[] {
    if (!landmarks || landmarks.length === 0) return [];

    const anchor = landmarks[1] ?? landmarks[0];
    const leftEye = landmarks[33] ?? landmarks[0];
    const rightEye = landmarks[263] ?? landmarks[0];

    const dx = rightEye.x - leftEye.x;
    const dy = rightEye.y - leftEye.y;
    const dz = rightEye.z - leftEye.z;
    const eyeDist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;

    const vector: number[] = [];
    for (const pt of landmarks) {
      const x = (mirror ? 1.0 - pt.x : pt.x) - anchor.x;
      const y = pt.y - anchor.y;
      const z = pt.z - anchor.z;

      vector.push(x / eyeDist, y / eyeDist, z / eyeDist);
    }
    return vector;
  }

  /**
   * Normaliza os 52 blendshapes faciais garantindo ordenação determinística das chaves
   */
  public static normalizeBlendshapes(
    blendshapes: Record<string, number>
  ): number[] {
    const keys = Object.keys(blendshapes).sort();
    return keys.map((k) => blendshapes[k] ?? 0);
  }

  /**
   * Normaliza pontos 3D da mão:
   * Âncora: Punho (index 0)
   * Escala: Distância do punho (0) ao osso médio (index 9 - MCP do dedo médio)
   */
  public static normalizeHand(
    landmarks: Point3D[],
    mirror = false
  ): number[] {
    if (!landmarks || landmarks.length === 0) return [];

    const wrist = landmarks[0];
    const middleMcp = landmarks[9] ?? landmarks[5] ?? landmarks[0];

    const dx = middleMcp.x - wrist.x;
    const dy = middleMcp.y - wrist.y;
    const dz = middleMcp.z - wrist.z;
    const handScale = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;

    const vector: number[] = [];
    for (const pt of landmarks) {
      const x = (mirror ? 1.0 - pt.x : pt.x) - wrist.x;
      const y = pt.y - wrist.y;
      const z = pt.z - wrist.z;

      vector.push(x / handScale, y / handScale, z / handScale);
    }
    return vector;
  }

  /**
   * Normaliza corpo/pose:
   * Âncora: Ponto médio entre os ombros (pontos 11 e 12)
   * Escala: Distância entre ombros
   */
  public static normalizePose(
    landmarks: Point3D[],
    mirror = false
  ): number[] {
    if (!landmarks || landmarks.length === 0) return [];

    const leftShoulder = landmarks[11] ?? landmarks[0];
    const rightShoulder = landmarks[12] ?? landmarks[0];

    const anchorX = (leftShoulder.x + rightShoulder.x) / 2;
    const anchorY = (leftShoulder.y + rightShoulder.y) / 2;
    const anchorZ = (leftShoulder.z + rightShoulder.z) / 2;

    const dx = rightShoulder.x - leftShoulder.x;
    const dy = rightShoulder.y - leftShoulder.y;
    const dz = rightShoulder.z - leftShoulder.z;
    const shoulderDist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;

    const vector: number[] = [];
    for (const pt of landmarks) {
      const x = (mirror ? 1.0 - pt.x : pt.x) - anchorX;
      const y = pt.y - anchorY;
      const z = pt.z - anchorZ;

      vector.push(x / shoulderDist, y / shoulderDist, z / shoulderDist);
    }
    return vector;
  }

  /**
   * Concatena de forma unificada e reprodutível apenas as fontes selecionadas
   */
  public static extractVector(
    frame: FrameLandmarks,
    sources: VisionSource[],
    options: { mirror?: boolean; useBlendshapes?: boolean } = {}
  ): number[] {
    const { mirror = false, useBlendshapes = true } = options;
    const fullVector: number[] = [];

    for (const src of sources) {
      if (src === "face" && frame.face) {
        if (useBlendshapes && frame.face.blendshapes) {
          const bsVector = this.normalizeBlendshapes(frame.face.blendshapes);
          fullVector.push(...bsVector);
        }
        if (frame.face.landmarks) {
          const facePoints = this.normalizeFace(frame.face.landmarks, mirror);
          fullVector.push(...facePoints);
        }
      } else if (src === "hand" && frame.hands?.landmarks) {
        for (const handPts of frame.hands.landmarks) {
          const handVector = this.normalizeHand(handPts, mirror);
          fullVector.push(...handVector);
        }
      } else if (src === "pose" && frame.pose?.landmarks) {
        const poseVector = this.normalizePose(frame.pose.landmarks, mirror);
        fullVector.push(...poseVector);
      }
    }

    return fullVector;
  }
}
