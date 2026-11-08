import { describe, it, expect, vi } from "vitest";
import { ActionDispatcher } from "../src/index";

describe("ActionDispatcher", () => {
  it("despacha ação do tipo speech com sucesso", async () => {
    const dispatcher = new ActionDispatcher();
    const context = { gestureName: "sorrir", confidence: 0.95, timestamp: Date.now() };

    // Mock window.speechSynthesis
    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();
    (globalThis as unknown as { speechSynthesis: unknown }).speechSynthesis = {
      speak: mockSpeak,
      cancel: mockCancel,
    };
    (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = vi.fn(
      (text: string) => ({ text, lang: "pt-BR" })
    );

    const result = await dispatcher.dispatch(
      "speech",
      { text: "Sim, por favor" },
      context
    );

    expect(result).toBe(true);
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
  });

  it("despacha ação do tipo webhook via HTTP POST", async () => {
    const dispatcher = new ActionDispatcher();
    const context = { gestureName: "piscar-esq", confidence: 0.88, timestamp: Date.now() };

    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = mockFetch;

    const result = await dispatcher.dispatch(
      "webhook",
      { url: "https://example.com/api/action", method: "POST" },
      context
    );

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://example.com/api/action",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("despacha ação do tipo bridge para injeção via WebSocket", async () => {
    const dispatcher = new ActionDispatcher();
    const context = { gestureName: "boca-aberta", confidence: 0.92, timestamp: Date.now() };

    const mockSend = vi.fn();
    class MockWS {
      static OPEN = 1;
      readyState = 1;
      onopen: (() => void) | null = null;
      send = mockSend;
      constructor() {
        setTimeout(() => {
          if (this.onopen) this.onopen();
        }, 0);
      }
    }
    (globalThis as any).WebSocket = MockWS;

    const result = await dispatcher.dispatch(
      "bridge",
      { key: "PageDown" },
      context
    );

    expect(result).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(JSON.stringify({ type: "key", key: "PageDown" }));
  });
});
