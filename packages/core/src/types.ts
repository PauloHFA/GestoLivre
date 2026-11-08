export type VisionSource = "face" | "hand" | "pose";

export interface Point3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface BlendshapeCategory {
  categoryName: string;
  score: number;
}

export interface FrameLandmarks {
  timestamp: number;
  face?: {
    landmarks: Point3D[];
    blendshapes: Record<string, number>;
  };
  hands?: {
    landmarks: Point3D[][];
    handedness: string[];
  };
  pose?: {
    landmarks: Point3D[];
  };
}

export interface GestureSample {
  id: string;
  gestureName: string;
  timestamp: number;
  vector: number[];
  previewLandmarks?: Point3D[];
}

export type GestureMode = "single" | "continuous" | "press-release";

export interface GestureDefinition {
  id: string;
  name: string;
  sources: VisionSource[];
  threshold: number;      // Padrão: 0.85
  holdMs: number;         // Padrão: 300 ms
  cooldownMs: number;     // Padrão: 1000 ms
  mode: GestureMode;
  actionId?: string;
}

export type ActionType = "speech" | "key" | "dom" | "webhook" | "bridge";

export interface ActionDefinition {
  id: string;
  name: string;
  type: ActionType;
  payload: {
    text?: string;        // Para fala TTS
    key?: string;         // Para tecla (ex: "ArrowRight", "Space")
    selector?: string;    // Para clique em seletor CSS
    url?: string;         // Para webhook HTTP
    method?: string;      // POST, GET
    wsMessage?: string;   // Mensagem WebSocket
  };
}

export interface GestureProfile {
  version: "1.0.0";
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  activeSources: VisionSource[];
  gestures: GestureDefinition[];
  samples: GestureSample[];
  actions: ActionDefinition[];
}

export interface ClassificationPrediction {
  name: string;
  confidence: number;
  distance: number;
}

export interface TrainingEvaluationReport {
  overallAccuracy: number;
  perGesture: Record<string, { precision: number; recall: number; f1: number; samplesCount: number }>;
  confusionMatrix: Record<string, Record<string, number>>;
  neutralCentroidDistance: Record<string, number>;
  warnings: string[];
}

export interface Classifier {
  train(samples: GestureSample[]): Promise<TrainingEvaluationReport>;
  predict(vector: number[]): ClassificationPrediction;
  isTrained(): boolean;
}

export interface GestureEventPayload {
  name: string;
  confidence: number;
  timestamp: number;
  holdDurationMs?: number;
}

export type GestureEventCallback = (payload: GestureEventPayload) => void;

export interface DecisionEngineConfig {
  historySize?: number;      // Número de quadros para média móvel (padrão: 5)
  hysteresisRatio?: number;  // Margem de desativação (padrão: 0.20 abaixo do limiar de ativação)
}
