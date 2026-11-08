import { describe, it, expect } from "vitest";
import { SampleThumbnail, LiveMetricsBadge, EmergencyButton, CountdownOverlay, SampleGalleryModal } from "../src/index";

describe("@gestolivre/ui", () => {
  it("exporta todos os componentes visuais principais", () => {
    expect(SampleThumbnail).toBeDefined();
    expect(LiveMetricsBadge).toBeDefined();
    expect(EmergencyButton).toBeDefined();
    expect(CountdownOverlay).toBeDefined();
    expect(SampleGalleryModal).toBeDefined();
  });
});
