import {
  FilesetResolver,
  FaceLandmarker,
  HandLandmarker,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { FrameLandmarks, VisionSource } from "../types";

export interface VisionDetectorOptions {
  wasmPath?: string;
  sources?: VisionSource[];
  numHands?: number;
  runningMode?: "VIDEO" | "IMAGE";
}

export class VisionDetector {
  private sources: Set<VisionSource>;
  private wasmPath: string;
  private faceLandmarker: FaceLandmarker | null = null;
  private handLandmarker: HandLandmarker | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private initialized = false;
  private lastFpsTimestamp = 0;
  private frameCount = 0;
  private currentFps = 0;
  private lastDetectionLatencyMs = 0;

  constructor(options: VisionDetectorOptions = {}) {
    this.sources = new Set(options.sources ?? ["face", "hand"]);
    // URL base padrão do CDN para os binários WASM se não especificado localmente
    this.wasmPath =
      options.wasmPath ??
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm";
  }

  public getMetrics(): { fps: number; latencyMs: number } {
    return {
      fps: this.currentFps,
      latencyMs: this.lastDetectionLatencyMs,
    };
  }

  public async setSources(newSources: VisionSource[]): Promise<void> {
    this.sources = new Set(newSources);
    if (this.initialized) {
      await this.initDetectors();
    }
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.initDetectors();
    this.initialized = true;
  }

  private async initDetectors(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(this.wasmPath);

    // Inicializa FaceLandmarker se "face" estiver ativo
    if (this.sources.has("face") && !this.faceLandmarker) {
      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
      });
    }

    // Inicializa HandLandmarker se "hand" estiver ativo
    if (this.sources.has("hand") && !this.handLandmarker) {
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
    }

    // Inicializa PoseLandmarker se "pose" estiver ativo
    if (this.sources.has("pose") && !this.poseLandmarker) {
      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    }
  }

  public detectFrame(
    video: HTMLVideoElement,
    timestamp: number = performance.now()
  ): FrameLandmarks {
    const startTime = performance.now();

    // Medição de FPS
    this.frameCount++;
    if (timestamp - this.lastFpsTimestamp >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsTimestamp));
      this.frameCount = 0;
      this.lastFpsTimestamp = timestamp;
    }

    const frameResult: FrameLandmarks = {
      timestamp,
    };

    // Detecção Facial
    if (this.sources.has("face") && this.faceLandmarker) {
      const res = this.faceLandmarker.detectForVideo(video, timestamp);
      if (res.faceLandmarks && res.faceLandmarks.length > 0) {
        const rawLms = res.faceLandmarks[0];
        const blendshapesMap: Record<string, number> = {};
        if (res.faceBlendshapes && res.faceBlendshapes.length > 0) {
          for (const cat of res.faceBlendshapes[0].categories) {
            blendshapesMap[cat.categoryName] = cat.score;
          }
        }
        frameResult.face = {
          landmarks: rawLms.map((pt) => ({ x: pt.x, y: pt.y, z: pt.z })),
          blendshapes: blendshapesMap,
        };
      }
    }

    // Detecção de Mãos
    if (this.sources.has("hand") && this.handLandmarker) {
      const res = this.handLandmarker.detectForVideo(video, timestamp);
      if (res.landmarks && res.landmarks.length > 0) {
        frameResult.hands = {
          landmarks: res.landmarks.map((hand) =>
            hand.map((pt) => ({ x: pt.x, y: pt.y, z: pt.z }))
          ),
          handedness: res.handednesses?.map((h) => h[0]?.displayName ?? "Hand") ?? [],
        };
      }
    }

    // Detecção de Corpo / Pose
    if (this.sources.has("pose") && this.poseLandmarker) {
      const res = this.poseLandmarker.detectForVideo(video, timestamp);
      if (res.landmarks && res.landmarks.length > 0) {
        frameResult.pose = {
          landmarks: res.landmarks[0].map((pt) => ({
            x: pt.x,
            y: pt.y,
            z: pt.z,
            visibility: pt.visibility,
          })),
        };
      }
    }

    this.lastDetectionLatencyMs = Math.round(performance.now() - startTime);
    return frameResult;
  }

  public close(): void {
    this.faceLandmarker?.close();
    this.handLandmarker?.close();
    this.poseLandmarker?.close();
    this.faceLandmarker = null;
    this.handLandmarker = null;
    this.poseLandmarker = null;
    this.initialized = false;
  }
}
