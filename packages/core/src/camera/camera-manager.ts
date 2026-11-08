export interface CameraOptions {
  deviceId?: string;
  width?: number;
  height?: number;
  mirror?: boolean;
}

export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private selectedDeviceId: string | null = null;
  private isMirrored: boolean = true;
  private running: boolean = false;

  constructor() {
    this.selectedDeviceId = localStorage.getItem("gestolivre_camera_device_id");
  }

  public isSupported(): boolean {
    return !!(
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    );
  }

  public isRunning(): boolean {
    return this.running;
  }

  public getStream(): MediaStream | null {
    return this.stream;
  }

  public getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  public async getAvailableDevices(): Promise<MediaDeviceInfo[]> {
    if (!this.isSupported()) return [];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === "videoinput");
    } catch {
      return [];
    }
  }

  public async start(
    videoElement: HTMLVideoElement,
    options: CameraOptions = {}
  ): Promise<MediaStream> {
    if (!this.isSupported()) {
      throw new Error(
        "Navegador não suporta acesso à câmera via getUserMedia ou contexto não seguro (requer HTTPS ou localhost)."
      );
    }

    this.stop();

    const deviceId = options.deviceId ?? this.selectedDeviceId;
    this.isMirrored = options.mirror ?? true;
    this.videoElement = videoElement;

    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        width: { ideal: options.width ?? 640 },
        height: { ideal: options.height ?? 480 },
        facingMode: "user",
      },
      audio: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = stream;
      this.running = true;

      this.videoElement.srcObject = stream;
      this.videoElement.style.transform = this.isMirrored ? "scaleX(-1)" : "none";
      await this.videoElement.play();

      // Salva o deviceId ativo
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings();
      if (settings?.deviceId) {
        this.selectedDeviceId = settings.deviceId;
        try {
          localStorage.setItem("gestolivre_camera_device_id", settings.deviceId);
        } catch {
          // LocalStorage desativado ou restrito
        }
      }

      return stream;
    } catch (err: unknown) {
      this.stop();
      const error = err as { name?: string; message?: string };
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        throw new Error("Permissão de câmera negada pelo usuário.");
      }
      if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
        throw new Error("Nenhuma câmera encontrada no dispositivo.");
      }
      throw new Error(`Falha ao iniciar a câmera: ${error?.message || "Erro desconhecido"}`);
    }
  }

  public stop(): void {
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.running = false;
  }
}
