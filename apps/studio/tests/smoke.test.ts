import { describe, it, expect } from "vitest";
import { ProfileManager } from "@gestolivre/core";
import { ActionDispatcher } from "@gestolivre/actions";

describe("Studio Smoke Test", () => {
  it("carrega instâncias do ProfileManager e ActionDispatcher integradas", () => {
    const profileManager = new ProfileManager();
    const dispatcher = new ActionDispatcher();

    const profile = profileManager.createDefaultProfile("Perfil Studio Test");
    expect(profile.name).toBe("Perfil Studio Test");
    expect(profile.version).toBe("1.0.0");
    expect(dispatcher).toBeDefined();
  });
});
