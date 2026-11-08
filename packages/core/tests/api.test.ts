import { describe, it, expect, vi } from "vitest";
import { GestoLivre } from "../src/index";

describe("API Headless (RF-API-01, RF-API-02, RF-API-03, CA-API-01)", () => {
  it("permite criar instância e configurar eventos totalmente sem interface gráfica", async () => {
    const gl = await GestoLivre.create({ sources: ["face"], classifier: "knn" });

    expect(gl).toBeDefined();
    expect(gl.camera).toBeDefined();
    expect(gl.detector).toBeDefined();
    expect(gl.engine).toBeDefined();
    expect(gl.profileManager).toBeDefined();

    const onStart = vi.fn();
    gl.on("gesturestart", onStart);

    const profile = gl.getProfile();
    expect(profile.version).toBe("1.0.0");
    expect(profile.name).toBeDefined();

    // Testa configuração declarativa de gesto
    gl.configure("piscar-esq", { threshold: 0.9, holdMs: 350 });
  });
});
