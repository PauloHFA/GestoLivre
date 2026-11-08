import { CameraManager, CameraOptions } from "./camera/camera-manager";
import { VisionDetector } from "./vision/vision-detector";
import { LandmarkNormalizer } from "./preprocessing/normalizer";
import { KNNClassifier } from "./classifiers/knn";
import { DecisionEngine } from "./engine/decision-engine";
import { ProfileManager } from "./profile/profile-manager";
import {
  VisionSource,
  GestureProfile,
  GestureDefinition,
  GestureEventCallback,
  TrainingEvaluationReport,
  ClassificationPrediction,
} from "./types";

export * from "./types";
export * from "./camera/camera-manager";
export * from "./vision/vision-detector";
export * from "./preprocessing/normalizer";
export * from "./classifiers/knn";
export * from "./engine/decision-engine";
export * from "./profile/profile-manager";
export * from "./accessibility/scanning-engine";
export * from "./accessibility/head-cursor";
export * from "./accessibility/tremor-analyzer";
export * from "./presets/index";

export interface GestoLivreOptions {
  sources?: VisionSource[];
  classifier?: "knn";
  knnK?: number;
}

export class GestoLivre {
  public camera: CameraManager;
  public detector: VisionDetector;
  public engine: DecisionEngine;
  public profileManager: ProfileManager;
  public classifier: KNNClassifier;

  private currentProfile: GestureProfile;
  private activeSources: VisionSource[];
  private isProcessing = false;
  private animFrameId: number | null = null;

  private constructor(options: GestoLivreOptions = {}) {
    this.activeSources = options.sources ?? ["face", "hand"];
    this.camera = new CameraManager();
    this.detector = new VisionDetector({ sources: this.activeSources });
    this.engine = new DecisionEngine();
    this.profileManager = new ProfileManager();
    this.classifier = new KNNClassifier({ k: options.knnK ?? 5 });
    this.currentProfile = this.profileManager.createDefaultProfile();
  }

  public static async create(options: GestoLivreOptions = {}): Promise<GestoLivre> {
    const instance = new GestoLivre(options);
    return instance;
  }

  public getProfile(): GestureProfile {
    return this.currentProfile;
  }

  public setProfile(profile: GestureProfile): void {
    this.currentProfile = profile;
    this.activeSources = profile.activeSources;
    this.engine.registerGestureConfigs(profile.gestures);
    if (profile.samples.length > 0) {
      this.classifier.train(profile.samples).catch(console.error);
    }
  }

  public async startVideoProcessing(
    videoElement: HTMLVideoElement,
    cameraOptions: CameraOptions = {},
    onFrameProcessed?: (prediction: ClassificationPrediction, metrics: { fps: number; latencyMs: number }) => void
  ): Promise<void> {
    await this.detector.initialize();
    await this.camera.start(videoElement, cameraOptions);

    this.isProcessing = true;

    const loop = () => {
      if (!this.isProcessing) return;

      if (videoElement.readyState >= 2) {
        const frame = this.detector.detectFrame(videoElement, performance.now());
        const vector = LandmarkNormalizer.extractVector(frame, this.activeSources, {
          mirror: cameraOptions.mirror ?? true,
        });

        if (vector.length > 0 && this.classifier.isTrained()) {
          const prediction = this.classifier.predict(vector);
          this.engine.processFrame(prediction);
          if (onFrameProcessed) {
            onFrameProcessed(prediction, this.detector.getMetrics());
          }
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stopVideoProcessing(): void {
    this.isProcessing = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.camera.stop();
  }

  public on(event: "gesturestart" | "gesturehold" | "gestureend", callback: GestureEventCallback): void {
    this.engine.on(event, callback);
  }

  public off(event: "gesturestart" | "gesturehold" | "gestureend", callback: GestureEventCallback): void {
    this.engine.off(event, callback);
  }

  public configure(gestureName: string, config: Partial<GestureDefinition>): void {
    const existing = this.currentProfile.gestures.find((g) => g.name === gestureName);
    if (existing) {
      Object.assign(existing, config);
      this.engine.registerGestureConfig(existing);
    }
  }

  public async fit(): Promise<TrainingEvaluationReport> {
    const report = await this.classifier.train(this.currentProfile.samples);
    this.engine.registerGestureConfigs(this.currentProfile.gestures);
    return report;
  }
}
