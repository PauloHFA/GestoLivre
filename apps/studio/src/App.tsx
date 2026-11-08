import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  CameraOff,
  ShieldCheck,
  Play,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Eye,
  Sparkles,
  Activity,
} from "lucide-react";
import {
  CameraManager,
  VisionDetector,
  LandmarkNormalizer,
  KNNClassifier,
  DecisionEngine,
  ProfileManager,
  GestureProfile,
  GestureDefinition,
  GestureSample,
  ActionDefinition,
  VisionSource,
  TrainingEvaluationReport,
  ClassificationPrediction,
  HeadCursor,
  TremorAnalyzer,
  TremorAnalysisResult,
  AccessibilityPreset,
  IrisGazeTracker,
} from "@gestolivre/core";
import { ActionDispatcher } from "@gestolivre/actions";
import {
  EmergencyButton,
  CountdownOverlay,
  LiveMetricsBadge,
  SampleGalleryModal,
  HeadCursorOverlay,
  PresetPickerModal,
  TremorCalibratorModal,
} from "@gestolivre/ui";

export function App() {
  // Estado de Câmera e Visão
  const [cameraActive, setCameraActive] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [activeSources, setActiveSources] = useState<VisionSource[]>(["face", "hand"]);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [fps, setFps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);

  // Instâncias do Core
  const cameraRef = useRef<CameraManager>(new CameraManager());
  const detectorRef = useRef<VisionDetector>(new VisionDetector({ sources: ["face", "hand"] }));
  const classifierRef = useRef<KNNClassifier>(new KNNClassifier({ k: 5 }));
  const engineRef = useRef<DecisionEngine>(new DecisionEngine());
  const profileManagerRef = useRef<ProfileManager>(new ProfileManager());
  const actionDispatcherRef = useRef<ActionDispatcher>(new ActionDispatcher());

  // Cursor por Cabeça com Dwell Click (RF-ACT-07)
  const [headCursorEnabled, setHeadCursorEnabled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, progress: 0 });
  const headCursorRef = useRef<HeadCursor | null>(null);

  // Desktop Bridge Status (RF-EXT-01)
  const [bridgeConnected, setBridgeConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let timer: any = null;

    const checkBridge = () => {
      try {
        ws = new WebSocket("ws://localhost:8765");
        ws.onopen = () => {
          setBridgeConnected(true);
          ws?.close();
        };
        ws.onerror = () => {
          setBridgeConnected(false);
        };
      } catch {
        setBridgeConnected(false);
      }
    };

    checkBridge();
    timer = setInterval(checkBridge, 10000);

    return () => {
      if (timer) clearInterval(timer);
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    headCursorRef.current = new HeadCursor({
      sensitivity: 2.8,
      dwellTimeMs: 900,
      enableGazeRefinement: true,
      onCursorMove: (x, y) => {
        setCursorPos((prev) => ({ ...prev, x, y }));
      },
      onDwellProgress: (progress) => {
        setCursorPos((prev) => ({ ...prev, progress }));
      },
      onDwellClick: (x, y) => {
        const targetEl = document.elementFromPoint(x, y) as HTMLElement | null;
        if (targetEl && typeof targetEl.click === "function") {
          targetEl.click();
        }
        setActionLogs((prev) => [
          {
            id: Math.random().toString(36).substring(2, 9),
            time: new Date().toLocaleTimeString(),
            gesture: "Dwell Click (Cabeça)",
            actionType: "Clique",
            status: `Pos (${Math.round(x)}, ${Math.round(y)})`,
          },
          ...prev.slice(0, 19),
        ]);
      },
    });
  }, []);

  // Perfil e Gestos
  const [profile, setProfile] = useState<GestureProfile>(() =>
    profileManagerRef.current.createDefaultProfile("Meu Perfil de Acessibilidade")
  );
  const [trainingReport, setTrainingReport] = useState<TrainingEvaluationReport | null>(null);

  // Presets Clínicos & Calibração de Tremores
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isTremorModalOpen, setIsTremorModalOpen] = useState(false);
  const [isTremorCollecting, setIsTremorCollecting] = useState(false);
  const [tremorSampleCount, setTremorSampleCount] = useState(0);
  const [tremorResult, setTremorResult] = useState<TremorAnalysisResult | null>(null);
  const tremorAnalyzerRef = useRef<TremorAnalyzer>(new TremorAnalyzer());
  const isTremorCollectingRef = useRef(false);

  // Gravação de Amostras
  const [recordingGesture, setRecordingGesture] = useState<string | null>(null);
  const [recordingCountdown, setRecordingCountdown] = useState<number | null>(null);
  const [sampleCount, setSampleCount] = useState<number>(0);
  const [reviewingGesture, setReviewingGesture] = useState<string | null>(null);
  const targetSamples = 40;

  // Reconhecimento ao Vivo e Anti-Disparo
  const [isPaused, setIsPaused] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<ClassificationPrediction | null>(null);
  const [activeGestureUI, setActiveGestureUI] = useState<string | null>(null);
  const [actionLogs, setActionLogs] = useState<
    { id: string; time: string; gesture: string; actionType: string; status: string }[]
  >([]);

  // Novo Gesto Modal/Form
  const [newGestureName, setNewGestureName] = useState("");
  const [newGestureActionType, setNewGestureActionType] = useState<"speech" | "key" | "webhook" | "bridge">("speech");
  const [newGestureActionValue, setNewGestureActionValue] = useState("Olá, mundo!");

  // Elementos DOM
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Carrega dispositivos disponíveis
  useEffect(() => {
    cameraRef.current.getAvailableDevices().then((devs: MediaDeviceInfo[]) => {
      setDevices(devs);
      if (devs.length > 0 && !selectedDevice) {
        setSelectedDevice(devs[0].deviceId);
      }
    });
  }, [selectedDevice]);

  // Tecla de Emergência: Escape ou Barra de Espaço para Pausa Imediata (< 200ms)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        toggleEmergencyPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPaused]);

  // Registra eventos do motor de decisão
  useEffect(() => {
    const engine = engineRef.current;

    const onStart = (payload: { name: string; confidence: number; timestamp: number }) => {
      setActiveGestureUI(payload.name);

      // Procura ação vinculada ao gesto
      const gestureDef = profile.gestures.find((g: GestureDefinition) => g.name === payload.name);
      const actionDef = profile.actions.find((a: ActionDefinition) => a.id === gestureDef?.actionId);

      const logItem = {
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString(),
        gesture: payload.name,
        actionType: actionDef ? actionDef.type : "Sem ação",
        status: "Disparado",
      };

      setActionLogs((prev) => [logItem, ...prev.slice(0, 19)]);

      if (actionDef) {
        actionDispatcherRef.current.dispatch(
          actionDef.type,
          actionDef.payload,
          {
            gestureName: payload.name,
            confidence: payload.confidence,
            timestamp: payload.timestamp,
          }
        );
      }
    };

    const onEnd = () => {
      setActiveGestureUI(null);
    };

    engine.on("gesturestart", onStart);
    engine.on("gestureend", onEnd);

    return () => {
      engine.off("gesturestart", onStart);
      engine.off("gestureend", onEnd);
    };
  }, [profile]);

  const toggleEmergencyPause = () => {
    if (engineRef.current.isPaused()) {
      engineRef.current.resume();
      setIsPaused(false);
    } else {
      engineRef.current.pause();
      setIsPaused(true);
      setActiveGestureUI(null);
    }
  };

  // Iniciar / Parar Câmera
  const toggleCamera = async () => {
    if (cameraActive) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      cameraRef.current.stop();
      setCameraActive(false);
      setFps(0);
      setLatencyMs(0);
    } else {
      if (!videoRef.current) return;
      try {
        await detectorRef.current.initialize();
        await cameraRef.current.start(videoRef.current, {
          deviceId: selectedDevice || undefined,
          mirror: true,
        });
        setCameraActive(true);
        startVisionLoop();
      } catch (err: unknown) {
        const error = err as Error;
        alert(error.message || "Erro ao iniciar a câmera.");
      }
    }
  };

  // Loop de Processamento de Visão
  const recordingStateRef = useRef({
    recording: false,
    gestureName: "",
    count: 0,
  });

  const startVisionLoop = () => {
    const loop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState >= 2 && canvas) {
        const timestamp = performance.now();
        const frame = detectorRef.current.detectFrame(video, timestamp);
        const metrics = detectorRef.current.getMetrics();
        setFps(metrics.fps);
        setLatencyMs(metrics.latencyMs);

        // Renderiza Landmarks no Canvas Overlay
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (showLandmarks) {
            drawLandmarks(ctx, frame, canvas.width, canvas.height);
          }
        }

        // Rastreamento de Cabeça e Olhar para Cursor (RF-ACT-07/RF-ACT-09)
        if (headCursorEnabled && frame.face?.landmarks?.[1] && headCursorRef.current) {
          const nose = frame.face.landmarks[1];
          const gaze = IrisGazeTracker.estimate(frame.face.landmarks);
          headCursorRef.current.updateWithGaze(nose.x, nose.y, gaze);
        }

        // Calibração de Tremores em Repouso (RF-CAL-01)
        if (isTremorCollectingRef.current && frame.face?.landmarks?.[1]) {
          const nose = frame.face.landmarks[1];
          tremorAnalyzerRef.current.addSample(nose);
          const currentCount = tremorAnalyzerRef.current.getSampleCount();
          setTremorSampleCount(currentCount);

          if (currentCount >= 60) {
            isTremorCollectingRef.current = false;
            setIsTremorCollecting(false);
            const res = tremorAnalyzerRef.current.stop();
            setTremorResult(res);
          }
        }

        // Extrai vetor de características normalizado
        const vector = LandmarkNormalizer.extractVector(frame, activeSources, { mirror: true });

        // Coleta de Amostras se estiver gravando
        if (recordingStateRef.current.recording && vector.length > 0) {
          const sample: GestureSample = {
            id: "s_" + Math.random().toString(36).substring(2, 9),
            gestureName: recordingStateRef.current.gestureName,
            timestamp: Date.now(),
            vector,
          };

          setProfile((prev: GestureProfile) => ({
            ...prev,
            samples: [...prev.samples, sample],
          }));

          recordingStateRef.current.count++;
          setSampleCount(recordingStateRef.current.count);

          if (recordingStateRef.current.count >= targetSamples) {
            recordingStateRef.current.recording = false;
            setRecordingGesture(null);
            setRecordingCountdown(null);
          }
        }

        // Inferência em tempo real se o modelo estiver treinado
        if (vector.length > 0 && classifierRef.current.isTrained() && !recordingStateRef.current.recording) {
          const pred = classifierRef.current.predict(vector);
          setCurrentPrediction(pred);
          engineRef.current.processFrame(pred);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  // Desenha landmarks de forma leve no Canvas
  const drawLandmarks = (
    ctx: CanvasRenderingContext2D,
    frame: ReturnType<typeof detectorRef.current.detectFrame>,
    w: number,
    h: number
  ) => {
    ctx.save();
    // Espelha o canvas para alinhar com o vídeo
    ctx.translate(w, 0);
    ctx.scale(-1, 1);

    // Mãos
    if (frame.hands?.landmarks) {
      ctx.fillStyle = "#38bdf8";
      for (const hand of frame.hands.landmarks) {
        for (const pt of hand) {
          ctx.beginPath();
          ctx.arc(pt.x * w, pt.y * h, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Rosto
    if (frame.face?.landmarks) {
      ctx.fillStyle = "#34d399";
      // Desenha pontos principais para não sobrecarregar
      const keyIndices = [1, 33, 263, 61, 291, 13, 14, 159, 386];
      for (const idx of keyIndices) {
        const pt = frame.face.landmarks[idx];
        if (pt) {
          ctx.beginPath();
          ctx.arc(pt.x * w, pt.y * h, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  };

  // Iniciar Gravação com Contagem Regressiva
  const startRecording = (gestureName: string) => {
    if (!cameraActive) {
      alert("Ative a câmera antes de iniciar a gravação.");
      return;
    }

    setRecordingGesture(gestureName);
    setRecordingCountdown(3);
    setSampleCount(0);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setRecordingCountdown(count);
      } else {
        clearInterval(interval);
        setRecordingCountdown(null);
        recordingStateRef.current = {
          recording: true,
          gestureName,
          count: 0,
        };
      }
    }, 1000);
  };

  // Excluir Amostra Individual (RF-TRN-03)
  const handleDeleteSample = (sampleId: string) => {
    setProfile((prev: GestureProfile) => ({
      ...prev,
      samples: prev.samples.filter((s: GestureSample) => s.id !== sampleId),
    }));
  };

  const handleDeleteAllSamples = (gestureName: string) => {
    setProfile((prev: GestureProfile) => ({
      ...prev,
      samples: prev.samples.filter((s: GestureSample) => s.gestureName !== gestureName),
    }));
  };

  // Treinar Modelo
  const handleTrain = async () => {
    try {
      if (profile.samples.length === 0) {
        alert("Grave amostras antes de treinar.");
        return;
      }
      const report = await classifierRef.current.train(profile.samples);
      engineRef.current.registerGestureConfigs(profile.gestures);
      setTrainingReport(report);
      await profileManagerRef.current.saveProfile(profile);
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Erro no treino: ${error.message}`);
    }
  };

  // Carregar Modelo Pronto (Preset Clínico RF-PRF-05)
  const handleSelectPreset = async (preset: AccessibilityPreset) => {
    setProfile(preset.profile);
    engineRef.current.registerGestureConfigs(preset.profile.gestures);
    await profileManagerRef.current.saveProfile(preset.profile);
    if (preset.recommendedSettings.dwellTimeMs && headCursorRef.current) {
      headCursorRef.current.setDwellTime(preset.recommendedSettings.dwellTimeMs);
    }
    if (preset.recommendedSettings.sensitivity && headCursorRef.current) {
      headCursorRef.current.setSensitivity(preset.recommendedSettings.sensitivity);
    }
    if (preset.recommendedSettings.deadzone && headCursorRef.current) {
      headCursorRef.current.setDeadzone(preset.recommendedSettings.deadzone);
    }
    alert(
      `Modelo "${preset.title}" carregado com sucesso!\nCadastre ou grave as amostras dos gestos para calibrar à sua anatomia.`
    );
  };

  // Calibrar Tremores Automaticamente (RF-CAL-01)
  const handleStartTremorCalibration = () => {
    if (!cameraActive) {
      alert("Por favor, ative a câmera antes de iniciar a calibração de tremores.");
      return;
    }
    setTremorResult(null);
    setTremorSampleCount(0);
    tremorAnalyzerRef.current.start();
    isTremorCollectingRef.current = true;
    setIsTremorCollecting(true);
  };

  const handleApplyTremorSettings = (settings: {
    deadzone: number;
    sensitivity: number;
    holdMs: number;
    cooldownMs: number;
  }) => {
    if (headCursorRef.current) {
      headCursorRef.current.setDeadzone(settings.deadzone);
      headCursorRef.current.setSensitivity(settings.sensitivity);
    }
    // Atualiza parâmetros de gestos no perfil
    setProfile((prev: GestureProfile) => ({
      ...prev,
      gestures: prev.gestures.map((g: GestureDefinition) => ({
        ...g,
        holdMs: settings.holdMs,
        cooldownMs: settings.cooldownMs,
      })),
    }));
    engineRef.current.registerGestureConfigs(
      profile.gestures.map((g: GestureDefinition) => ({
        ...g,
        holdMs: settings.holdMs,
        cooldownMs: settings.cooldownMs,
      }))
    );
    alert(
      `Calibração adaptativa aplicada!\n• Deadzone: ${settings.deadzone}\n• Sensibilidade: ${settings.sensitivity}x\n• Sustentação: ${settings.holdMs} ms`
    );
  };

  // Adicionar Gesto Personalizado
  const handleAddGesture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGestureName.trim()) return;

    const actionId = "act_" + Math.random().toString(36).substring(2, 9);
    const gestureId = "gst_" + Math.random().toString(36).substring(2, 9);

    const gestureDef: GestureDefinition = {
      id: gestureId,
      name: newGestureName.trim(),
      sources: activeSources,
      threshold: 0.85,
      holdMs: 300,
      cooldownMs: 1000,
      mode: "single",
      actionId,
    };

    const actionPayload: Record<string, unknown> = {};
    if (newGestureActionType === "speech") actionPayload.text = newGestureActionValue;
    if (newGestureActionType === "key") actionPayload.key = newGestureActionValue;
    if (newGestureActionType === "webhook") actionPayload.url = newGestureActionValue;
    if (newGestureActionType === "bridge") actionPayload.key = newGestureActionValue;

    const actionDef: ActionDefinition = {
      id: actionId,
      name: `Ação para ${gestureDef.name}`,
      type: newGestureActionType,
      payload: actionPayload,
    };

    setProfile((prev: GestureProfile) => ({
      ...prev,
      gestures: [...prev.gestures, gestureDef],
      actions: [...prev.actions, actionDef],
    }));

    engineRef.current.registerGestureConfig(gestureDef);
    setNewGestureName("");
    setNewGestureActionValue("");
  };

  // Excluir Gesto
  const handleDeleteGesture = (name: string) => {
    if (!confirm(`Excluir o gesto "${name}" e todas as suas amostras?`)) return;
    setProfile((prev: GestureProfile) => ({
      ...prev,
      gestures: prev.gestures.filter((g: GestureDefinition) => g.name !== name),
      samples: prev.samples.filter((s: GestureSample) => s.gestureName !== name),
    }));
  };

  // Exportar Perfil
  const handleExportProfile = () => {
    const json = profileManagerRef.current.exportProfileJson(profile);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.name.toLowerCase().replace(/\s+/g, "_")}.gestolivre.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar Perfil
  const handleImportProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const content = ev.target?.result as string;
        const imported = profileManagerRef.current.importProfileJson(content);
        setProfile(imported);
        engineRef.current.registerGestureConfigs(imported.gestures);
        if (imported.samples.length > 0) {
          await classifierRef.current.train(imported.samples);
        }
        alert("Perfil importado com sucesso!");
      } catch (err: unknown) {
        const error = err as Error;
        alert(`Erro ao importar: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Alternar Fonte Ativa
  const toggleSource = (src: VisionSource) => {
    const nextSources = activeSources.includes(src)
      ? activeSources.filter((s) => s !== src)
      : [...activeSources, src];
    setActiveSources(nextSources);
    detectorRef.current.setSources(nextSources);
  };

  // Limpeza Geral (LGPD)
  const handleWipeAll = async () => {
    if (confirm("ATENÇÃO: Deseja apagar permanentemente todos os gestos, amostras e perfis locais?")) {
      await profileManagerRef.current.clearAllData();
      const defaultProf = profileManagerRef.current.createDefaultProfile();
      setProfile(defaultProf);
      setTrainingReport(null);
      setActionLogs([]);
      alert("Todos os dados locais foram excluídos.");
    }
  };

  const hasNeutralSamples = profile.samples.some((s: GestureSample) => s.gestureName === "neutro");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Barra de Navegação Superior */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label="Logo Mão e Janela">
            🪟✋
          </span>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              GestoLivre Studio
            </h1>
            <p className="text-xs text-slate-400">Reconhecimento por Webcam 100% Local · WCAG 2.2 AA</p>
          </div>
        </div>

        {/* Controles de Emergência e Indicadores */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              bridgeConnected
                ? "bg-indigo-950/80 border-indigo-500/40 text-indigo-300"
                : "bg-slate-800/80 border-slate-700 text-slate-400"
            }`}
            title={
              bridgeConnected
                ? "Desktop Bridge ativo na porta 8765 (Injeção de teclas do SO habilitada)"
                : "Desktop Bridge offline (porta 8765). Inicie 'pnpm --filter @gestolivre/bridge start' para controlar apps do SO"
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                bridgeConnected ? "bg-indigo-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span className="hidden sm:inline">
              {bridgeConnected ? "Bridge Desktop Conectado" : "Bridge Desktop Offline"}
            </span>
          </div>

          <EmergencyButton isPaused={isPaused} onToggle={toggleEmergencyPause} />

          {cameraActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Câmera Ativa</span>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Vídeo, Controles da Câmera e Diagnóstico (5 colunas) */}
        <section className="lg:col-span-5 flex flex-col gap-5" aria-labelledby="heading-camera">
          <h2 id="heading-camera" className="sr-only">
            Visão e Câmera
          </h2>

          {/* Banner de Privacidade RF-CAM-01 */}
          {!privacyAgreed && (
            <div className="bg-sky-950/60 border border-sky-500/40 rounded-xl p-4 flex gap-3 text-sm text-sky-200">
              <ShieldCheck className="w-6 h-6 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sky-100">Privacidade Absoluta Garantida (LGPD)</p>
                <p className="text-xs text-sky-300 mt-1">
                  Nenhum vídeo, foto ou áudio sai do seu computador. Os cálculos de aprendizado de máquina ocorrem
                  estritamente no seu navegador usando coordenadas geométricas.
                </p>
                <button
                  onClick={() => setPrivacyAgreed(true)}
                  className="mt-2 text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium px-3 py-1.5 rounded transition"
                >
                  Entendi e Concordo
                </button>
              </div>
            </div>
          )}

          {/* Área de Visualização da Webcam + Canvas */}
          <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {!cameraActive && (
              <div className="text-center p-6 flex flex-col items-center gap-3 text-slate-400 z-10">
                <CameraOff className="w-12 h-12 text-slate-500" />
                <p className="text-sm font-medium">A câmera está desativada.</p>
                <button
                  onClick={toggleCamera}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                  <span>Ativar Câmera</span>
                </button>
              </div>
            )}

            {/* Overlay de Gravação em Andamento */}
            {recordingGesture && (
              <CountdownOverlay
                gestureName={recordingGesture}
                countdown={recordingCountdown}
                sampleCount={sampleCount}
                targetSamples={targetSamples}
              />
            )}

            {/* Notificação de Gesto Disparado ao Vivo */}
            {activeGestureUI && (
              <div className="absolute top-4 left-4 right-4 bg-emerald-500/95 text-slate-950 font-black text-center py-2 px-4 rounded-xl shadow-xl text-lg uppercase tracking-wider animate-pulse z-10">
                🎉 Gesto Reconhecido: {activeGestureUI}
              </div>
            )}
          </div>

          {/* Configurações da Câmera e Detectores */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">Dispositivo de Vídeo:</span>
              <button
                onClick={toggleCamera}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  cameraActive ? "bg-rose-600/80 hover:bg-rose-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {cameraActive ? "Desativar Câmera" : "Ativar Câmera"}
              </button>
            </div>

            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
              aria-label="Selecionar câmera"
            >
              {devices.map((d: MediaDeviceInfo) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Câmera ${d.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>

            {/* Diagnóstico em Tempo Real (RNF-12) */}
            <LiveMetricsBadge
              fps={fps}
              latencyMs={latencyMs}
              confidence={currentPrediction?.confidence}
              className="pt-2 border-t border-slate-700/60"
            />

            {/* Alternar Detectores e Landmarks (RF-CAM-05) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs text-slate-300">
              <span>Fontes Ativas:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleSource("face")}
                  className={`px-2.5 py-1 rounded font-medium ${
                    activeSources.includes("face") ? "bg-sky-600 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                >
                  Rosto
                </button>
                <button
                  onClick={() => toggleSource("hand")}
                  className={`px-2.5 py-1 rounded font-medium ${
                    activeSources.includes("hand") ? "bg-sky-600 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                >
                  Mão
                </button>
                <button
                  onClick={() => toggleSource("pose")}
                  className={`px-2.5 py-1 rounded font-medium ${
                    activeSources.includes("pose") ? "bg-sky-600 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                >
                  Corpo
                </button>
                <button
                  onClick={() => setShowLandmarks((prev: boolean) => !prev)}
                  className={`px-2.5 py-1 rounded font-medium ${
                    showLandmarks ? "bg-emerald-700 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                >
                  Pontos
                </button>
                <button
                  onClick={() => setHeadCursorEnabled((prev: boolean) => !prev)}
                  className={`px-2.5 py-1 rounded font-medium ${
                    headCursorEnabled
                      ? "bg-amber-600 text-white ring-2 ring-amber-400 animate-pulse"
                      : "bg-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                  title="Controlar o cursor do mouse com a cabeça e clicar por fixação de tempo"
                >
                  {headCursorEnabled ? "🎯 Cursor Cabeça Ativo" : "🎯 Cursor Cabeça"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Painel Direito: Treinamento, Gestos, Ações e Logs (7 colunas) */}
        <section className="lg:col-span-7 flex flex-col gap-6" aria-labelledby="heading-gestures">
          {/* Assistente da Classe Neutro (RF-TRN-06) */}
          <div
            className={`border rounded-2xl p-5 ${
              hasNeutralSamples
                ? "bg-slate-800/40 border-emerald-500/30"
                : "bg-amber-950/40 border-amber-500/50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">1. Calibração da Classe Neutro (Repouso)</h3>
                  {hasNeutralSamples ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Calibrado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" /> Obrigatório
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Grave 40 amostras em estado natural (parado, falando, piscando normalmente). Essa classe é
                  essencial para impedir disparos acidentais enquanto você usa o computador.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {hasNeutralSamples && (
                  <button
                    onClick={() => setReviewingGesture("neutro")}
                    className="flex-shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                    title="Inspecionar e excluir amostras de repouso"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Revisar ({profile.samples.filter((s: GestureSample) => s.gestureName === "neutro").length})</span>
                  </button>
                )}

                <button
                  onClick={() => startRecording("neutro")}
                  disabled={!cameraActive}
                  className="flex-shrink-0 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{hasNeutralSamples ? "Gravar +40" : "Gravar Neutro"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Gestos Cadastrados e Ações Mapeadas */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 id="heading-gestures" className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>2. Seus Gestos Personalizados ({profile.gestures.length})</span>
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsPresetModalOpen(true)}
                  className="bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium text-xs px-3 py-2 rounded-xl transition shadow flex items-center gap-1.5"
                  title="Carregar configurações prontas para ELA, Paralisia Cerebral, Tetraplegia e Apresentações"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Modelos Prontos</span>
                </button>

                <button
                  onClick={() => {
                    setIsTremorModalOpen(true);
                    setTremorResult(null);
                  }}
                  disabled={!cameraActive}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 font-medium text-xs px-3 py-2 rounded-xl transition shadow flex items-center gap-1.5"
                  title="Ajustar automaticamente deadzone e sensibilidade com base no tremor em repouso"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Calibrar Tremores</span>
                </button>

                <button
                  onClick={handleTrain}
                  disabled={profile.samples.length < 2 || !cameraActive}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-lg flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Treinar Modelo Agora</span>
                </button>
              </div>
            </div>

            {/* Relatório de Treino (RF-TRN-04) */}
            {trainingReport && (
              <div className="mb-4 p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Acurácia Global do Modelo:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {(trainingReport.overallAccuracy * 100).toFixed(1)}%
                  </span>
                </div>
                {trainingReport.warnings.length > 0 && (
                  <div className="mt-2 text-amber-300 bg-amber-950/40 p-2 rounded">
                    {trainingReport.warnings.map((w: string, idx: number) => (
                      <p key={idx}>⚠️ {w}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lista de Gestos */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {profile.gestures.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Nenhum gesto cadastrado. Crie seu primeiro gesto abaixo (ex.: "piscar-esq", "sorriso", "joinha").
                </p>
              ) : (
                profile.gestures.map((gesture: GestureDefinition) => {
                  const gestureSamplesCount = profile.samples.filter(
                    (s: GestureSample) => s.gestureName === gesture.name
                  ).length;
                  const action = profile.actions.find((a: ActionDefinition) => a.id === gesture.actionId);

                  return (
                    <div
                      key={gesture.id}
                      className="bg-slate-900/60 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{gesture.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                            {gestureSamplesCount} amostras
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span>
                            Ação:{" "}
                            <strong className="text-slate-200">
                              {action?.type === "speech" && `Falar: "${action.payload.text}"`}
                              {action?.type === "key" && `Tecla: [${action.payload.key}]`}
                              {action?.type === "webhook" && `URL: ${action.payload.url}`}
                            </strong>
                          </span>
                          <span>Hold: {gesture.holdMs}ms</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {gestureSamplesCount > 0 && (
                          <button
                            onClick={() => setReviewingGesture(gesture.name)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
                            title="Revisar amostras gravadas deste gesto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver ({gestureSamplesCount})</span>
                          </button>
                        )}
                        <button
                          onClick={() => startRecording(gesture.name)}
                          disabled={!cameraActive}
                          className="text-xs bg-sky-600/80 hover:bg-sky-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg transition"
                        >
                          Gravar +40
                        </button>
                        <button
                          onClick={() => handleDeleteGesture(gesture.name)}
                          className="text-xs text-slate-400 hover:text-rose-400 p-1.5 transition"
                          title="Excluir gesto"
                          aria-label={`Excluir gesto ${gesture.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Formulário para Adicionar Novo Gesto */}
            <form onSubmit={handleAddGesture} className="mt-4 pt-4 border-t border-slate-700 flex flex-col gap-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Adicionar Novo Gesto
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nome do gesto (ex: piscar-esq)"
                  value={newGestureName}
                  onChange={(e) => setNewGestureName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none"
                  required
                />
                <select
                  value={newGestureActionType}
                  onChange={(e) => setNewGestureActionType(e.target.value as "speech" | "key" | "webhook" | "bridge")}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="speech">Falar frase (Voz sintetizada)</option>
                  <option value="key">Pressionar tecla no Navegador (ex: ArrowRight)</option>
                  <option value="bridge">Injetar Tecla no SO Desktop (Bridge)</option>
                  <option value="webhook">Disparar Webhook HTTP</option>
                </select>
                <input
                  type="text"
                  placeholder={
                    newGestureActionType === "speech"
                      ? "Frase a falar..."
                      : newGestureActionType === "key" || newGestureActionType === "bridge"
                      ? "Tecla (ex: ArrowRight, PageDown, Space)"
                      : "https://minha-api.com"
                  }
                  value={newGestureActionValue}
                  onChange={(e) => setNewGestureActionValue(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="self-end bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
              >
                + Criar Gesto
              </button>
            </form>
          </div>

          {/* Histórico / Log de Ações Disparadas (RF-ACT-06) */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
              <span>Registro de Disparos em Tempo Real</span>
              <span className="text-[11px] text-slate-400 font-normal">Últimas 20 ações</span>
            </h3>

            <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-xs text-slate-300">
              {actionLogs.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nenhuma ação disparada ainda.</p>
              ) : (
                actionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between bg-slate-900/40 px-3 py-1.5 rounded border border-slate-800"
                  >
                    <span className="text-emerald-400">[{log.time}]</span>
                    <span className="font-semibold text-slate-200">{log.gesture}</span>
                    <span className="text-sky-300">{log.actionType}</span>
                    <span className="text-xs text-slate-400">{log.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Gerenciamento de Perfil: Exportar / Importar / Excluir (RF-PRF-01/02/04) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportProfile}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar .gestolivre.json</span>
              </button>

              <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Perfil</span>
                <input type="file" accept=".json" onChange={handleImportProfile} className="hidden" />
              </label>
            </div>

            <button
              onClick={handleWipeAll}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-950/40 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Apagar Todos os Dados</span>
            </button>
          </div>
        </section>
      </main>
      {/* Modal de Revisão de Amostras (RF-TRN-03) */}
      {reviewingGesture && (
        <SampleGalleryModal
          gestureName={reviewingGesture}
          samples={profile.samples.filter((s: GestureSample) => s.gestureName === reviewingGesture)}
          isOpen={true}
          onClose={() => setReviewingGesture(null)}
          onDeleteSample={handleDeleteSample}
          onDeleteAllSamples={handleDeleteAllSamples}
        />
      )}
      {/* Overlay de Cursor por Cabeça com Dwell Click (RF-ACT-07) */}
      <HeadCursorOverlay
        x={cursorPos.x}
        y={cursorPos.y}
        progress={cursorPos.progress}
        active={headCursorEnabled && cameraActive}
      />

      {/* Catálogo de Presets Clínicos (RF-PRF-05) */}
      <PresetPickerModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectPreset={handleSelectPreset}
        currentProfileId={profile.id}
      />

      {/* Assistente de Calibração de Tremores (RF-CAL-01) */}
      <TremorCalibratorModal
        isOpen={isTremorModalOpen}
        onClose={() => {
          setIsTremorModalOpen(false);
          isTremorCollectingRef.current = false;
          setIsTremorCollecting(false);
        }}
        isCollecting={isTremorCollecting}
        sampleCount={tremorSampleCount}
        result={tremorResult}
        onStartCalibration={handleStartTremorCalibration}
        onApplySettings={handleApplyTremorSettings}
      />
    </div>
  );
}
