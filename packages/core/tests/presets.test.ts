import { describe, it, expect } from "vitest";
import { ACCESSIBILITY_PRESETS } from "../src/presets/index";

describe("Accessibility Presets", () => {
  it("contém presets clínicos para ELA, Paralisia Cerebral, Tetraplegia e Apresentações", () => {
    expect(ACCESSIBILITY_PRESETS.length).toBeGreaterThanOrEqual(4);
    const categories = ACCESSIBILITY_PRESETS.map((p) => p.category);
    expect(categories).toContain("ela");
    expect(categories).toContain("cerebral-palsy");
    expect(categories).toContain("tetraplegia");
    expect(categories).toContain("productivity");
  });

  it("cada preset possui perfil válido com gestos e ações consistentes", () => {
    for (const preset of ACCESSIBILITY_PRESETS) {
      expect(preset.profile.id).toBeDefined();
      expect(preset.profile.name).toBeDefined();
      expect(preset.profile.gestures.length).toBeGreaterThan(0);
      expect(preset.profile.actions.length).toBeGreaterThan(0);

      // Cada gesto aponta para uma ação existente
      for (const gesture of preset.profile.gestures) {
        if (gesture.actionId) {
          const action = preset.profile.actions.find((a) => a.id === gesture.actionId);
          expect(action).toBeDefined();
        }
      }
    }
  });
});
