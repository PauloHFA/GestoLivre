import { describe, it, expect, vi } from "vitest";
import { BridgeServer } from "../src/server";
import { InputInjector } from "../src/injector";
import type { WebSocket } from "ws";

describe("BridgeServer (Desktop OS Input Injection)", () => {
  it("informa status correto com plataforma e porta", () => {
    const mockInjector = {
      getPlatform: () => "win32",
      sendKey: vi.fn(),
    } as unknown as InputInjector;

    const server = new BridgeServer({ port: 8765, injector: mockInjector });
    const status = server.getStatus();

    expect(status.port).toBe(8765);
    expect(status.platform).toBe("win32");
    expect(status.connectedClients).toBe(0);
  });

  it("responde ao comando ping com pong e métricas do bridge", async () => {
    const mockInjector = {
      getPlatform: () => "win32",
      sendKey: vi.fn(),
    } as unknown as InputInjector;

    const server = new BridgeServer({ port: 8765, injector: mockInjector });
    const mockWs = {
      send: vi.fn(),
    } as unknown as WebSocket;

    await server.handleMessage({ type: "ping" }, mockWs);

    expect(mockWs.send).toHaveBeenCalledTimes(1);
    const sentData = JSON.parse((mockWs.send as any).mock.calls[0][0]);
    expect(sentData.type).toBe("pong");
    expect(sentData.status.port).toBe(8765);
    expect(sentData.status.platform).toBe("win32");
  });

  it("recebe comando de tecla e aciona o injector correspondente", async () => {
    const mockSendKey = vi.fn().mockResolvedValue(true);
    const mockInjector = {
      getPlatform: () => "win32",
      sendKey: mockSendKey,
    } as unknown as InputInjector;

    const server = new BridgeServer({ port: 8765, injector: mockInjector });
    const mockWs = {
      send: vi.fn(),
    } as unknown as WebSocket;

    await server.handleMessage({ type: "key", key: "ArrowRight" }, mockWs);

    expect(mockSendKey).toHaveBeenCalledWith("ArrowRight");
    expect(mockWs.send).toHaveBeenCalledTimes(1);

    const sentData = JSON.parse((mockWs.send as any).mock.calls[0][0]);
    expect(sentData.type).toBe("ack");
    expect(sentData.key).toBe("ArrowRight");
    expect(sentData.success).toBe(true);
  });
});

describe("InputInjector", () => {
  it("identifica plataforma de execução do sistema", () => {
    const injector = new InputInjector();
    expect(typeof injector.getPlatform()).toBe("string");
    expect(["win32", "linux", "darwin"]).toContain(injector.getPlatform());
  });
});
