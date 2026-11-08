import { Point3D } from "../types";

export interface IrisGazeEstimate {
  horizontalRatio: number; // 0.0 (olhando esquerda) a 1.0 (olhando direita), 0.5 é centro
  verticalRatio: number;   // 0.0 (olhando cima) a 1.0 (olhando baixo), 0.5 é centro
  offsetNormalizedX: number; // -1.0 a +1.0 (deslocamento centrado em 0)
  offsetNormalizedY: number; // -1.0 a +1.0 (deslocamento centrado em 0)
  confidence: number;
}

export class IrisGazeTracker {
  // Índices anatômicos MediaPipe Face Mesh com refinamento de íris (478 pontos)
  private static readonly LEFT_IRIS_CENTER = 468;
  private static readonly RIGHT_IRIS_CENTER = 473;
  private static readonly LEFT_EYE_OUTER = 33;
  private static readonly LEFT_EYE_INNER = 133;
  private static readonly RIGHT_EYE_INNER = 362;
  private static readonly RIGHT_EYE_OUTER = 263;

  private static readonly LEFT_EYE_TOP = 159;
  private static readonly LEFT_EYE_BOTTOM = 145;
  private static readonly RIGHT_EYE_TOP = 386;
  private static readonly RIGHT_EYE_BOTTOM = 374;

  /**
   * Estima o vetor de direcionamento do olhar a partir das coordenadas da íris e cantos dos olhos.
   */
  public static estimate(landmarks: Point3D[]): IrisGazeEstimate | null {
    if (!landmarks || landmarks.length < 474) {
      return null;
    }

    const leftIris = landmarks[this.LEFT_IRIS_CENTER];
    const rightIris = landmarks[this.RIGHT_IRIS_CENTER];
    const leftOuter = landmarks[this.LEFT_EYE_OUTER];
    const leftInner = landmarks[this.LEFT_EYE_INNER];
    const rightInner = landmarks[this.RIGHT_EYE_INNER];
    const rightOuter = landmarks[this.RIGHT_EYE_OUTER];

    if (!leftIris || !rightIris || !leftOuter || !leftInner || !rightInner || !rightOuter) {
      return null;
    }

    // Proporção horizontal esquerda: distância do canto externo dividido pela largura do olho
    const leftWidth = Math.abs(leftInner.x - leftOuter.x);
    const rightWidth = Math.abs(rightOuter.x - rightInner.x);

    if (leftWidth < 0.005 || rightWidth < 0.005) {
      return null; // Olho muito fechado ou face distante
    }

    const ratioLeftH = (leftIris.x - Math.min(leftOuter.x, leftInner.x)) / leftWidth;
    const ratioRightH = (rightIris.x - Math.min(rightInner.x, rightOuter.x)) / rightWidth;
    const avgH = (ratioLeftH + ratioRightH) / 2;

    // Proporção vertical
    const leftTop = landmarks[this.LEFT_EYE_TOP];
    const leftBottom = landmarks[this.LEFT_EYE_BOTTOM];
    const rightTop = landmarks[this.RIGHT_EYE_TOP];
    const rightBottom = landmarks[this.RIGHT_EYE_BOTTOM];

    let avgV = 0.5;
    if (leftTop && leftBottom && rightTop && rightBottom) {
      const leftHeight = Math.abs(leftBottom.y - leftTop.y);
      const rightHeight = Math.abs(rightBottom.y - rightTop.y);
      if (leftHeight > 0.004 && rightHeight > 0.004) {
        const ratioLeftV = (leftIris.y - Math.min(leftTop.y, leftBottom.y)) / leftHeight;
        const ratioRightV = (rightIris.y - Math.min(rightTop.y, rightBottom.y)) / rightHeight;
        avgV = (ratioLeftV + ratioRightV) / 2;
      }
    }

    // Normaliza de [0..1] para deslocamento [-1..+1] centrado em zero
    const clampedH = Math.max(0, Math.min(1, avgH));
    const clampedV = Math.max(0, Math.min(1, avgV));
    const offsetNormalizedX = (clampedH - 0.5) * 2;
    const offsetNormalizedY = (clampedV - 0.5) * 2;

    return {
      horizontalRatio: Number(clampedH.toFixed(3)),
      verticalRatio: Number(clampedV.toFixed(3)),
      offsetNormalizedX: Number(offsetNormalizedX.toFixed(3)),
      offsetNormalizedY: Number(offsetNormalizedY.toFixed(3)),
      confidence: 0.9,
    };
  }
}
