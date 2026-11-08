import { describe, it, expect, beforeEach } from "vitest";
import { ProfileManager } from "../src/profile/profile-manager";
import { GestureProfile } from "../src/types";

describe("ProfileManager", () => {
  let manager: ProfileManager;

  beforeEach(() => {
    manager = new ProfileManager();
  });

  it("exporta e importa perfil JSON preservando integridade (CA-PRF-01)", () => {
    const original: GestureProfile = {
      version: "1.0.0",
      id: "prof_test",
      name: "Maria - Cabeça",
      createdAt: "2026-11-08T00:00:00Z",
      updatedAt: "2026-11-08T00:00:00Z",
      activeSources: ["face"],
      gestures: [
        {
          id: "g1",
          name: "piscar-esq",
          sources: ["face"],
          threshold: 0.85,
          holdMs: 400,
          cooldownMs: 1000,
          mode: "single",
        },
      ],
      samples: [
        {
          id: "s1",
          gestureName: "piscar-esq",
          timestamp: 12345,
          vector: [0.1, 0.2, 0.9],
        },
      ],
      actions: [
        {
          id: "a1",
          name: "Falar Olá",
          type: "speech",
          payload: { text: "Olá" },
        },
      ],
    };

    const json = manager.exportProfileJson(original);
    expect(json).toContain("Maria - Cabeça");

    const restored = manager.importProfileJson(json);
    expect(restored.id).toBe(original.id);
    expect(restored.gestures.length).toBe(1);
    expect(restored.samples.length).toBe(1);
    expect(restored.actions.length).toBe(1);
  });

  it("rejeita JSON inválido com erro amigável", () => {
    const invalidJson = JSON.stringify({ wrong: "data" });
    expect(() => manager.importProfileJson(invalidJson)).toThrow("Arquivo de perfil inválido");
  });
});
