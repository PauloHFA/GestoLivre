import { describe, it, expect, vi, beforeEach } from "vitest";
import { CameraManager } from "../src/camera/camera-manager";

describe("CameraManager (RF-CAM-01, RF-CAM-02, RF-CAM-07)", () => {
  let camera: CameraManager;

  beforeEach(() => {
    camera = new CameraManager();
  });

  it("informa corretamente se o ambiente suporta getUserMedia", () => {
    // No ambiente Node sem navigator.mediaDevices, deve retornar false
    expect(camera.isSupported()).toBe(false);
  });

  it("gerencia o ciclo de parada liberando tracks de vídeo (RF-CAM-07)", () => {
    const mockStop = vi.fn();
    const mockTrack = { stop: mockStop } as unknown as MediaStreamTrack;
    const mockStream = {
      getTracks: () => [mockTrack],
    } as unknown as MediaStream;

    // Injeta stream simulado
    (camera as unknown as { stream: MediaStream; running: boolean }).stream = mockStream;
    (camera as unknown as { running: boolean }).running = true;

    expect(camera.isRunning()).toBe(true);
    camera.stop();

    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(camera.isRunning()).toBe(false);
    expect(camera.getStream()).toBeNull();
  });
});
