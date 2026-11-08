import { GestureProfile } from "../types";

export interface AccessibilityPreset {
  id: string;
  title: string;
  category: "ela" | "cerebral-palsy" | "tetraplegia" | "productivity";
  targetCondition: string;
  description: string;
  recommendedSettings: {
    deadzone?: number;
    sensitivity?: number;
    dwellTimeMs?: number;
    scanningIntervalMs?: number;
  };
  profile: GestureProfile;
}

export const ACCESSIBILITY_PRESETS: AccessibilityPreset[] = [
  {
    id: "preset-ela-communicator",
    title: "ELA — Comunicação Rápida por Gestos Faciais",
    category: "ela",
    targetCondition: "Esclerose Lateral Amiotrófica (ELA) e pessoas com fala preservada ou nula",
    description: "Configura gestos faciais de baixo esforço (piscar esquerdo, piscar direito, sorriso) para sintetizar frases essenciais e navegar em menus.",
    recommendedSettings: {
      dwellTimeMs: 1000,
    },
    profile: {
      version: "1.0.0",
      id: "prof-ela-comm",
      name: "ELA — Comunicação Essencial",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeSources: ["face"],
      gestures: [
        {
          id: "gst-piscar-esq",
          name: "piscar-olho-esquerdo",
          sources: ["face"],
          threshold: 0.85,
          holdMs: 350,
          cooldownMs: 1200,
          mode: "single",
          actionId: "act-sim",
        },
        {
          id: "gst-piscar-dir",
          name: "piscar-olho-direito",
          sources: ["face"],
          threshold: 0.85,
          holdMs: 350,
          cooldownMs: 1200,
          mode: "single",
          actionId: "act-nao",
        },
        {
          id: "gst-sorriso",
          name: "sorriso-suave",
          sources: ["face"],
          threshold: 0.82,
          holdMs: 400,
          cooldownMs: 1500,
          mode: "single",
          actionId: "act-obrigado",
        },
      ],
      actions: [
        {
          id: "act-sim",
          name: "Dizer 'Sim, por favor'",
          type: "speech",
          payload: { text: "Sim, por favor." },
        },
        {
          id: "act-nao",
          name: "Dizer 'Não, obrigado'",
          type: "speech",
          payload: { text: "Não, obrigado." },
        },
        {
          id: "act-obrigado",
          name: "Dizer 'Muito obrigado'",
          type: "speech",
          payload: { text: "Muito obrigado pela ajuda!" },
        },
      ],
      samples: [],
    },
  },
  {
    id: "preset-switch-scanning",
    title: "Paralisia Cerebral — Comutador Único por Abertura de Boca",
    category: "cerebral-palsy",
    targetCondition: "Pessoas com espasmos involuntários e capacidade de realizar 1 único movimento voluntário seguro",
    description: "Configura comutador (switch) de alta tolerância com cooldown estendido para acionar o motor de varredura (teclado virtual de duas etapas).",
    recommendedSettings: {
      scanningIntervalMs: 1200,
    },
    profile: {
      version: "1.0.0",
      id: "prof-switch-scanning",
      name: "Comutador Único Anti-Espasmo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeSources: ["face"],
      gestures: [
        {
          id: "gst-boca-aberta",
          name: "abrir-boca",
          sources: ["face"],
          threshold: 0.88,
          holdMs: 400,
          cooldownMs: 1200,
          mode: "single",
          actionId: "act-trigger-scanning",
        },
      ],
      actions: [
        {
          id: "act-trigger-scanning",
          name: "Pressionar Barra de Espaço (Switch)",
          type: "key",
          payload: { key: "Space" },
        },
      ],
      samples: [],
    },
  },
  {
    id: "preset-tetraplegia-headmouse",
    title: "Tetraplegia — Cursor por Cabeça com Dwell Click",
    category: "tetraplegia",
    targetCondition: "Lesão medular alta (C1-C5) com controle preservado de cabeça e pescoço",
    description: "Movimenta o cursor do mouse pela rotação e inclinação do nariz com filtro de tremor e clique automático por fixação visual (dwell).",
    recommendedSettings: {
      deadzone: 0.025,
      sensitivity: 2.8,
      dwellTimeMs: 850,
    },
    profile: {
      version: "1.0.0",
      id: "prof-headmouse",
      name: "Mouse de Cabeça Acessível",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeSources: ["face"],
      gestures: [
        {
          id: "gst-sobrancelha-alerta",
          name: "erguer-sobrancelhas",
          sources: ["face"],
          threshold: 0.85,
          holdMs: 350,
          cooldownMs: 1500,
          mode: "single",
          actionId: "act-emergency-stop",
        },
      ],
      actions: [
        {
          id: "act-emergency-stop",
          name: "Pausar/Retomar Navegação",
          type: "key",
          payload: { key: "Escape" },
        },
      ],
      samples: [],
    },
  },
  {
    id: "preset-desktop-slides",
    title: "Apresentações Desktop — Passador de Slides & Multimídia",
    category: "productivity",
    targetCondition: "Palestrantes, professores e pessoas sem uso das mãos para controlar PPT, Keynote e YouTube",
    description: "Injeta teclas nativas (PageDown / PageUp) no sistema operacional via Desktop Bridge.",
    recommendedSettings: {},
    profile: {
      version: "1.0.0",
      id: "prof-desktop-slides",
      name: "Passador de Slides por Gestos",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeSources: ["face", "hand"],
      gestures: [
        {
          id: "gst-proximo-slide",
          name: "mao-avancar-slide",
          sources: ["hand"],
          threshold: 0.85,
          holdMs: 300,
          cooldownMs: 800,
          mode: "single",
          actionId: "act-bridge-pagedown",
        },
        {
          id: "gst-slide-anterior",
          name: "mao-retroceder-slide",
          sources: ["hand"],
          threshold: 0.85,
          holdMs: 300,
          cooldownMs: 800,
          mode: "single",
          actionId: "act-bridge-pageup",
        },
      ],
      actions: [
        {
          id: "act-bridge-pagedown",
          name: "Avançar Slide (SO)",
          type: "bridge",
          payload: { key: "PageDown" },
        },
        {
          id: "act-bridge-pageup",
          name: "Voltar Slide (SO)",
          type: "bridge",
          payload: { key: "PageUp" },
        },
      ],
      samples: [],
    },
  },
];
