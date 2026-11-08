import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { JSDOM } from "jsdom";
import axe from "axe-core";
import { EmergencyButton } from "../src/EmergencyButton";
import { LiveMetricsBadge } from "../src/LiveMetricsBadge";
import { CountdownOverlay } from "../src/CountdownOverlay";
import { SampleGalleryModal } from "../src/SampleGalleryModal";
import { PresetPickerModal } from "../src/PresetPickerModal";
import { TremorCalibratorModal } from "../src/TremorCalibratorModal";

describe("Auditoria de Acessibilidade WCAG 2.2 AA (CA-RNF-04)", () => {
  const runAxeOnComponent = async (jsx: React.ReactElement): Promise<axe.AxeResults> => {
    const htmlString = ReactDOMServer.renderToString(jsx);
    const dom = new JSDOM(
      `<!DOCTYPE html><html lang="pt-BR"><head><title>Test</title></head><body><main>${htmlString}</main></body></html>`
    );

    // Executa axe-core no DOM do componente
    return await axe.run(dom.window.document.body, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
      },
    });
  };

  it("EmergencyButton não possui violações críticas ou graves de acessibilidade", async () => {
    const results = await runAxeOnComponent(
      <EmergencyButton isPaused={false} onToggle={() => {}} />
    );

    const severeViolations = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(severeViolations).toHaveLength(0);
  });

  it("LiveMetricsBadge possui estrutura semântica válida e acessível", async () => {
    const results = await runAxeOnComponent(
      <LiveMetricsBadge fps={30} latencyMs={25} confidence={0.92} />
    );

    const severeViolations = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(severeViolations).toHaveLength(0);
  });

  it("CountdownOverlay possui papéis e textos descritivos acessíveis", async () => {
    const results = await runAxeOnComponent(
      <CountdownOverlay gestureName="sorriso" countdown={3} sampleCount={0} targetSamples={40} />
    );

    const severeViolations = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(severeViolations).toHaveLength(0);
  });

  it("SampleGalleryModal atende às diretrizes de diálogo modal (role dialog, aria-modal, title)", async () => {
    const results = await runAxeOnComponent(
      <SampleGalleryModal
        gestureName="piscar-esq"
        samples={[]}
        isOpen={true}
        onClose={() => {}}
        onDeleteSample={() => {}}
        onDeleteAllSamples={() => {}}
      />
    );

    const severeViolations = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(severeViolations).toHaveLength(0);
  });

  it("PresetPickerModal atende às diretrizes de diálogo modal acessível", async () => {
    const html = ReactDOMServer.renderToString(
      <PresetPickerModal isOpen={true} onClose={() => {}} onSelectPreset={() => {}} />
    );
    expect(html).toContain("ELA — Comunicação Rápida por Gestos Faciais");

    const results = await runAxeOnComponent(
      <PresetPickerModal isOpen={true} onClose={() => {}} onSelectPreset={() => {}} />
    );

    const severeViolations = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(severeViolations).toHaveLength(0);
  });

  it("TremorCalibratorModal atende às diretrizes de diálogo modal acessível", async () => {
    const results = await runAxeOnComponent(
      <TremorCalibratorModal
        isOpen={true}
        onClose={() => {}}
        isCollecting={false}
        sampleCount={0}
        result={null}
        onStartCalibration={() => {}}
        onApplySettings={() => {}}
      />
    );

    const severeViolations = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(severeViolations).toHaveLength(0);
  });
});
