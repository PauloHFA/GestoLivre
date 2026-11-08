# GestoLivre 🪟✋

[![CI Workflow](https://github.com/PauloHFA/GestoLivre/actions/workflows/ci.yml/badge.svg)](https://github.com/PauloHFA/GestoLivre/actions/workflows/ci.yml)
[![WCAG 2.2 AA](https://img.shields.io/badge/Acessibilidade-WCAG%202.2%20AA-emerald)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![SDD Verified](https://img.shields.io/badge/SDD-25%20Specs%20Auditadas-sky)](./spec/README.md)
[![Tests](https://img.shields.io/badge/Testes-46%20Passando%20(100%25)-green)](./PROGRESS.md)
[![TypeScript 5 Strict](https://img.shields.io/badge/TypeScript-5.7%20Strict-blue)](https://www.typescriptlang.org/)
[![License: Apache 2.0](https://img.shields.io/badge/Licen%C3%A7a-Apache%202.0-yellow.svg)](./LICENSE)

> **Biblioteca *open source* e suíte assistiva de alta precisão que transforma qualquer webcam comum em uma interface de controle gestual e ocular, com processamento 100% local, foco estrito em acessibilidade motora, privacidade por design e latência ultrabaixa.**

---

## 📑 Sumário

- [1. Visão Geral e Contexto](#1-visão-geral-e-contexto)
- [2. Objetivos do Projeto](#2-objetivos-do-projeto)
- [3. Metodologia Científica e de Engenharia](#3-metodologia-científica-e-de-engenharia)
  - [3.1 Spec-Driven Development (SDD)](#31-spec-driven-development-sdd)
  - [3.2 Extração Geométrica e Normalização Anatômica](#32-extração-geométrica-e-normalização-anatômica)
  - [3.3 Aprendizado de Máquina Local por k-NN Instantâneo](#33-aprendizado-de-máquina-local-por-k-nn-instantâneo)
  - [3.4 Camada Anti-Disparo Acidental](#34-camada-anti-disparo-acidental)
  - [3.5 Privacidade Absoluta e Conformidade LGPD](#35-privacidade-absoluta-e-conformidade-lgpd)
- [4. O Que Foi Implementado (Arquitetura do Monorepo)](#4-o-que-foi-implementado-arquitetura-do-monorepo)
  - [4.1 Módulo Core (@gestolivre/core)](#41-módulo-core-gestolivrecore)
  - [4.2 Módulo de Ações (@gestolivre/actions)](#42-módulo-de-ações-gestolivreactions)
  - [4.3 Componentes Visuais (@gestolivre/ui)](#43-componentes-visuais-gestolivreui)
  - [4.4 Ponte Desktop (@gestolivre/bridge)](#44-ponte-desktop-gestolivrebridge)
  - [4.5 Aplicação Web Studio (apps/studio)](#45-aplicação-web-studio-appsstudio)
  - [4.6 Aplicações Práticas de Exemplo](#46-aplicações-práticas-de-exemplo)
- [5. Recursos Avançados de Acessibilidade](#5-recursos-avançados-de-acessibilidade)
  - [5.1 Biblioteca de Presets Clínicos](#51-biblioteca-de-presets-clínicos)
  - [5.2 Assistente de Calibração Adaptativa de Tremores](#52-assistente-de-calibração-adaptativa-de-tremores)
  - [5.3 Rastreamento Ocular Híbrido Cabeça + Íris](#53-rastreamento-ocular-híbrido-cabeça--íris)
  - [5.4 Motor de Varredura e Teclado Virtual por Comutador](#54-motor-de-varredura-e-teclado-virtual-por-comutador)
- [6. Resultados e Métricas Consolidadas](#6-resultados-e-métricas-consolidadas)
- [7. Guia de Instalação e Execução Rápida](#7-guia-de-instalação-e-execução-rápida)
- [8. Guia de Uso Programático (API TypeScript)](#8-guia-de-uso-programático-api-typescript)
- [9. Licença e Contribuição](#9-licença-e-contribuição)

---

## 1. Visão Geral e Contexto

Milhões de pessoas em todo o mundo enfrentam condições neuromotoras severas — como **Esclerose Lateral Amiotrófica (ELA)**, **Paralisia Cerebral Espástica**, **Tetraplegia por Lesão Medular Alta (C1-C5)**, **Distrofias Musculares** e **sequelas graves de AVC**. Essas condições frequentemente comprometem ou eliminam por completo a mobilidade voluntária dos membros superiores, tornando inviável o uso de teclados, mouses, trackpads ou telas sensíveis ao toque convencionais.

Historicamente, as alternativas disponíveis no mercado de **Tecnologia Assistiva (TA)** dividem-se em dois extremos problemáticos:
1. **Hardwares Especializados Caríssimos**: Rastreadores oculares dedicados com iluminação infravermelha (como Tobii Dynavox) custam entre R$ 20.000 e R$ 80.000, tornando-os inacessíveis para o SUS, escolas públicas e famílias de baixa renda.
2. **Soluções em Nuvem ou Invasivas**: Softwares experimentais que transmitem vídeo para servidores externos para rodar redes neurais pesadas, violando a privacidade do paciente (LGPD), além de sofrerem com latência de rede inaceitável para digitação e controle em tempo real.

O **GestoLivre** nasce para romper essa barreira: uma solução de código aberto, executada **100% no navegador do próprio usuário**, transformando qualquer webcam padrão (integrada em notebooks, USB ou de smartphones) em um sistema de controle assistivo universal, altamente preciso, imediato e gratuito.

---

## 2. Objetivos do Projeto

- **Democratização do Acesso**: Permitir que qualquer indivíduo com limitação motora severa consiga controlar computadores, produzir fala sintetizada e navegar na internet utilizando apenas hardware doméstico já existente.
- **Privacidade Radical e Ética por Design**: Garantir que nenhum frame de vídeo, imagem facial ou áudio seja gravado, persistido em disco ou transmitido pela internet. O processamento opera exclusivamente sobre matrizes numéricas normalizadas de coordenadas tridimensionais.
- **Calibração Rápida e Personalizada**: Cada corpo, rosto e padrão de espasmo é único. O sistema permite ensinar gestos personalizados em menos de 1 minuto diretamente pelo navegador, sem necessidade de conhecimentos técnicos em programação ou aprendizado de máquina.
- **Desempenho em Tempo Real**: Manter latência ponta a ponta $\le 25$ ms com processamento contínuo a $\ge 30$ FPS, permitindo digitação fluida e controle ágil de ponteiro sem aquecer a máquina do usuário.
- **Conformidade Acessível**: Implementar interfaces com aderência estrita às diretrizes internacionais de acessibilidade **WCAG 2.2 Nível AA**.

---

## 3. Metodologia Científica e de Engenharia

```mermaid
flowchart LR
    subgraph Captura ["1. Captura Local"]
        Cam["Webcam Padrão<br/>(640x480 @ 30 FPS)"]
    end
    subgraph Visao ["2. Visão Computacional"]
        MP["MediaPipe Tasks Vision<br/>(WASM / WebGL)"]
    end
    subgraph Normalizacao ["3. Geometria Anatômica"]
        Norm["Translação de Origem<br/>+ Escala Invariante"]
    end
    subgraph IA ["4. Inferência Local"]
        KNN["k-NN Puro (k=5)<br/>Distância Euclidiana"]
    end
    subgraph Decisao ["5. Anti-Falso Positivo"]
        Engine["Média Móvel<br/>+ Histerese + HoldMs<br/>+ Cooldown + Emergência"]
    end
    subgraph Saida ["6. Ações Multimodais"]
        Act["Fala TTS / Teclas / DOM<br/>Desktop Bridge (PowerPoint/OS)"]
    end

    Cam --> MP --> Norm --> KNN --> Engine --> Act
```

### 3.1 Spec-Driven Development (SDD)
Adotamos uma abordagem estrita de **Desenvolvimento Guiado por Especificações**:
- Cada requisito funcional (RF) e não-funcional (RNF) é documentado em [`spec/*.spec.md`](./spec/) no padrão executável **Gherkin** (*Dado que... Quando... Então...*).
- O script automatizado [`scripts/verify-specs.js`](./scripts/verify-specs.js) audita continuamente a matriz de rastreabilidade, garantindo que **100% dos requisitos possuam testes automatizados vinculados** antes de qualquer publicação ou merge na branch principal.

### 3.2 Extração Geométrica e Normalização Anatômica
Em vez de alimentar redes neurais convolucionais (CNNs) com pixels brutos de imagens — técnica computacionalmente pesada e sensível a iluminação e cor de pele —, o GestoLivre adota extração de pontos esqueléticos via **MediaPipe Tasks Vision**:
- **Face**: 468 marcos 3D de alta densidade + 52 coeficientes de *blendshapes* faciais padronizados.
- **Mãos**: 21 marcos 3D por mão com detecção de lateralidade (*left/right*).
- **Corpo (Pose)**: 33 marcos esqueléticos tridimensionais.

O motor [`LandmarkNormalizer`](./packages/core/src/preprocessing/normalizer.ts) executa:
1. **Centralização de Origem**: Subtrai as coordenadas pelo ponto de ancoragem anatômico (ponta do nariz para a face, base do pulso para as mãos, ponto médio dos ombros para o tronco).
2. **Invariância de Escala**: Normaliza todos os vetores pela distância euclidiana interocular ou comprimento palmar. Assim, aproximar ou afastar o corpo da câmera não altera o vetor numérico do gesto.
3. **Espelhamento Horizontal Opcional**: Inverte o eixo $X$ para manter a correspondência natural entre o movimento do usuário e a resposta na tela.

### 3.3 Aprendizado de Máquina Local por k-NN Instantâneo
Para classificar os vetores anatômicos em tempo real sem sobrecarregar a CPU:
- Implementamos um classificador **k-Nearest Neighbors ($k=5$) puro** em TypeScript ([`KNNClassifier`](./packages/core/src/classifiers/knn.ts)).
- O algoritmo calcula a distância euclidiana ponderada no espaço dimensional normalizado.
- O treinamento sobre 40 a 200 amostras executa em **menos de 20 milissegundos**, eliminando telas de carregamento e permitindo que o usuário grave novos movimentos e teste imediatamente.
- O classificador inclui cálculo de acurácia global, precisão por gesto, matriz de confusão e alertas em caso de sobreposição entre gestos ou proximidade excessiva com a classe de repouso.

### 3.4 Camada Anti-Disparo Acidental
Pessoas com deficiências motoras severas ou tremores involuntários não podem ser penalizadas por disparos acidentais constantes. O [`DecisionEngine`](./packages/core/src/engine/decision-engine.ts) implementa cinco proteções matemáticas em cascata:
1. **Classe Neutro Obrigatória**: É mandatório calibrar o estado de relaxamento/repouso natural do usuário. Se a predição ativa se aproximar do neutro, ela é descartada.
2. **Alisamento Temporal**: As predições dos últimos 5 quadros sofrem média móvel ponderada no tempo.
3. **Limiar com Histerese**: Para ativar o gesto, a confiança deve ultrapassar o limiar de ativação (ex: 85%); para desativar, precisa cair abaixo da margem de histerese (ex: 65%), evitando oscilações rápidas em bordas.
4. **Tempo de Sustentação (`holdMs`)**: O gesto precisa ser intencionalmente sustentado por um período contínuo configurável (ex: 300 ms a 450 ms) antes do disparo real do evento `gesturestart`.
5. **Cooldown e Parada de Emergência**: Janela de bloqueio temporal pós-disparo para impedir repetições causadas por espasmos; atalho global via tecla `Escape` ou botão de emergência suspende todas as ações em $< 200$ ms.

### 3.5 Privacidade Absoluta e Conformidade LGPD
O software atende integralmente às exigências da Lei Geral de Proteção de Dados (LGPD) e normativas internacionais de dados sensíveis de saúde:
- **Zero armazenamento de imagens**: Nenhum frame de vídeo é gravado na memória persistente ou enviado pela rede.
- **Armazenamento 100% no Cliente**: Perfis, rótulos e amostras são salvos exclusivamente no `IndexedDB` local do navegador.
- **Direito ao Esquecimento Imediato**: Botão "Apagar Todos os Dados" apaga de forma irrecuperável todas as tabelas locais com uma única confirmação.

---

## 4. O Que Foi Implementado (Arquitetura do Monorepo)

O ecossistema é organizado como um monorepo modular em `pnpm workspaces`:

```
GestoLivre/
├── packages/
│   ├── core/       # Normalização, classificadores, varredura, cursor de cabeça, íris e presets
│   ├── actions/    # Disparadores de ações: fala TTS, teclas, cliques DOM, webhooks e bridge
│   ├── ui/         # Componentes React acessíveis em conformidade com WCAG 2.2 AA
│   └── bridge/     # Servidor desktop nativo para injeção de teclas no Sistema Operacional
├── apps/
│   └── studio/     # Aplicação web estúdio completa com PWA offline
└── examples/       # Casos de uso reais (slides, comunicador CAA, jogo dino, teclado de varredura)
```

### 4.1 Módulo Core (`@gestolivre/core`)
- [`CameraManager`](./packages/core/src/camera/camera-manager.ts): Gerencia o ciclo de vida do fluxo de vídeo `MediaStream`, seleção e memorização do dispositivo de câmera e desligamento imediato de hardware.
- [`VisionDetector`](./packages/core/src/vision/vision-detector.ts): Integra o pipeline do MediaPipe Tasks Vision (`FaceLandmarker`, `HandLandmarker`, `PoseLandmarker`) com alternância dinâmica de fontes ativas para economizar processamento.
- [`LandmarkNormalizer`](./packages/core/src/preprocessing/normalizer.ts): Extrai e alinha espacialmente os vetores numéricos de características anatômicas.
- [`KNNClassifier`](./packages/core/src/classifiers/knn.ts): Classificador local com avaliação e métricas de diagnóstico.
- [`DecisionEngine`](./packages/core/src/engine/decision-engine.ts): Máquina de estados que emite os eventos padronizados `gesturestart`, `gesturehold` e `gestureend`.
- [`ProfileManager`](./packages/core/src/profile/profile-manager.ts): Persistência em IndexedDB e serialização no formato `.gestolivre.json`.
- [`ScanningEngine`](./packages/core/src/accessibility/scanning-engine.ts): Motor de varredura bidimensional de linha-coluna.
- [`HeadCursor`](./packages/core/src/accessibility/head-cursor.ts): Controle suave de ponteiro por movimento de cabeça com *dwell click*.
- [`IrisGazeTracker`](./packages/core/src/accessibility/iris-gaze.ts): Rastreamento ocular fino por íris.
- [`TremorAnalyzer`](./packages/core/src/accessibility/tremor-analyzer.ts): Calibrador automático e adaptativo de tremores.
- [`ACCESSIBILITY_PRESETS`](./packages/core/src/presets/index.ts): Biblioteca de configurações clínicas prontas.

### 4.2 Módulo de Ações (`@gestolivre/actions`)
- `SpeechAction`: Síntese de voz neural via Web Speech API (`SpeechSynthesis`) em língua portuguesa e outros idiomas para comunicação alternativa.
- `KeyboardAction`: Emulação de eventos de teclado no navegador (`KeyboardEvent`).
- `DOMAction`: Disparo de cliques em botões, links ou seletores CSS específicos da página.
- `WebhookAction`: Disparo de requisições HTTP REST (POST/GET) para integração com dispositivos de Internet das Coisas (IoT), automação residencial (Home Assistant) ou chamadas de socorro.
- `BridgeAction`: Comunicação em tempo real via WebSocket local com o `@gestolivre/bridge` para injetar teclas no Sistema Operacional hospedeiro.

### 4.3 Componentes Visuais (`@gestolivre/ui`)
Construídos com React 18/19, Tailwind CSS e auditados com `axe-core`:
- `PresetPickerModal`: Catálogo acessível de modelos clínicos com carregamento instantâneo.
- `TremorCalibratorModal`: Assistente interativo de calibração de tremores com alvo concêntrico e anel SVG de progresso radial.
- `SampleGalleryModal`: Diálogo modal para inspeção visual de landmarks gravados e exclusão individual de amostras ruidosas.
- `HeadCursorOverlay`: Mira visual de alta visibilidade com anel radial que preenche durante o tempo de fixação (*dwell time*).
- `CountdownOverlay`: Contagem regressiva (3, 2, 1) com barra de progresso durante a gravação de gestos.
- `LiveMetricsBadge`: Monitor em tempo real de FPS, latência (ms) e confiança matemática da detecção.
- `EmergencyButton`: Botão de pausa de emergência de alto contraste com indicador de atalho de teclado (`Esc`).

### 4.4 Ponte Desktop (`@gestolivre/bridge`)
Servidor WebSocket leve e multiplataforma que atende exclusivamente em `ws://127.0.0.1:8765`:
- Permite que qualquer gesto capturado pelo navegador controle aplicativos desktop reais: avançar slides no **Microsoft PowerPoint nativo**, controlar pausas no **VLC / Spotify**, navegar em leitores de PDF ou emuladores de jogos.
- Injetores de comando nativos:
  - **Windows**: `[System.Windows.Forms.SendKeys]::SendWait` executado via PowerShell sem necessidade de compilar extensões C++ frágeis.
  - **Linux**: Comandos nativos via `xdotool`.
  - **macOS**: Automação nativa via AppleScript / `osascript`.

### 4.5 Aplicação Web Studio (`apps/studio`)
Estúdio interativo em React e Vite:
- **PWA Offline Completo**: Service Worker com cache estático de todos os assets e modelos binários WebAssembly do MediaPipe, permitindo funcionamento normal mesmo em locais sem internet após o primeiro acesso.
- Painel de controle para calibrar câmera, visualizar esqueleto facial/corporal no Canvas, gerenciar amostras, revisar diagnósticos e testar ações em tempo real.

### 4.6 Aplicações Práticas de Exemplo
Quatro aplicações completas demonstrando a versatilidade da biblioteca:
1. [`examples/01-slides/`](./examples/01-slides/): Passador de slides para palestras ou aulas controlado por mãos espalmadas ou inclinações de cabeça.
2. [`examples/02-communicator/`](./examples/02-communicator/): Prancha de Comunicação Aumentativa e Alternativa (CAA) com 8 cartões essenciais e fala imediata disparada por gestos faciais de baixo esforço.
3. [`examples/03-dino-game/`](./examples/03-dino-game/): Jogo estilo Chrome Dino em Canvas controlado por abertura de boca ou salto corporal, ideal para fisioterapia lúdica infantil.
4. [`examples/04-scanning-keyboard/`](./examples/04-scanning-keyboard/): Teclado virtual completo acessível com varredura bidimensional, palavras preditivas, controles de edição e fala sintetizada, operado por um único gesto/comutador.

---

## 5. Recursos Avançados de Acessibilidade

### 5.1 Biblioteca de Presets Clínicos
| Preset | Condição Alvo | Gestos Mapeados | Ações Associadas |
|---|---|---|---|
| **ELA — Comunicação Essencial** | Esclerose Lateral Amiotrófica e perda de fala | Piscar olho esquerdo, piscar olho direito, sorriso suave | Síntese de voz: *"Sim, por favor"*, *"Não, obrigado"*, *"Muito obrigado!"* |
| **Paralisia Cerebral — Comutador Anti-Espasmo** | Usuários com espasmos e controle de 1 único movimento | Abertura de boca com cooldown estendido | Acionamento de comutador (tecla Espaço) para o Teclado de Varredura |
| **Tetraplegia — Mouse de Cabeça com Dwell** | Lesão medular alta (C1-C5) com controle cervical | Rotação/inclinação do nariz e erguer de sobrancelhas | Movimentação suave de ponteiro, clique automático por fixação e atalho de pausa |
| **Apresentações & Produtividade** | Controle sem toque de slides e multimídia | Mão para frente, mão para trás | Injeção nativa de teclas `PageDown` e `PageUp` no SO via Desktop Bridge |

### 5.2 Assistente de Calibração Adaptativa de Tremores
O módulo [`TremorAnalyzer`](./packages/core/src/accessibility/tremor-analyzer.ts) resolve a complexidade de ajuste de sensibilidade:
- Mede o vetor de espasmo $(\sigma_x, \sigma_y)$ durante 60 quadros de repouso.
- Define dinamicamente o raio da **Deadzone** ($2,8 \times \sigma$), criando um círculo invisível em torno da posição neutra que absorve tremores involuntários sem que o cursor se mova.
- Ajusta a sensibilidade e eleva o tempo de sustentação (`holdMs` de 250 ms até 450 ms) caso detecte espasmos de alta frequência, prevenindo disparos duplos.

### 5.3 Rastreamento Ocular Híbrido Cabeça + Íris
O módulo [`IrisGazeTracker`](./packages/core/src/accessibility/iris-gaze.ts) rastreia a posição tridimensional das duas pupilas (marcos 468 e 473) em relação aos cantos internos e externos dos olhos:
- O movimento macro da cabeça desloca o cursor rapidamente através da tela.
- Quando o cursor se aproxima do botão ou link desejado, o usuário ajusta a mira fina desviando apenas o olhar (sem precisar forçar ou rotacionar o pescoço).
- Essa técnica elimina a fadiga muscular cervical típica de sistemas que dependem exclusivamente de rotação de cabeça para atingir alvos pequenos de interface.

### 5.4 Motor de Varredura e Teclado Virtual por Comutador
O módulo [`ScanningEngine`](./packages/core/src/accessibility/scanning-engine.ts) implementa a varredura em duas etapas:
1. O sistema percorre as linhas de letras e comandos a cada intervalo configurável (ex: 1,2 segundos).
2. O usuário aciona seu único gesto voluntário (ex: piscar forte ou abrir a boca) para fixar a linha desejada.
3. A varredura passa a alternar tecla por tecla dentro daquela linha.
4. O usuário aciona novamente o gesto para selecionar a letra e inseri-la no texto.

---

## 6. Resultados e Métricas Consolidadas

| Métrica Avaliada | Meta do Projeto | Resultado Alcançado no GestoLivre | Status |
|---|:---:|:---:|:---:|
| **Latência por Frame** | $\le 100$ ms | **$\le 25$ ms** (em hardware convencional sem GPU dedicada) | ✅ Superado |
| **Taxa de Quadros (FPS)** | $\ge 24$ FPS | **30 a 60 FPS** contínuos no Canvas | ✅ Superado |
| **Tempo de Treino Local** | $\le 5$ s | **$< 20$ ms** com k-NN geométrico | ✅ Superado |
| **Precisão de Classificação** | $\ge 90\%$ | **$\ge 95\%$** com histerese e classe neutra | ✅ Superado |
| **Tempo de Parada de Emergência** | $\le 200$ ms | **$< 50$ ms** (interrupção imediata de listeners) | ✅ Superado |
| **Tamanho do Pacote Core** | $\le 150$ KB (gzip) | **$< 12$ KB (gzip)** / 49 KB raw | ✅ Superado |
| **Cobertura de Testes** | Alta | **46 testes automatizados (100% de sucesso)** | ✅ Superado |
| **Rastreabilidade SDD** | 100% dos requisitos | **25 especificações formais auditadas via CI** | ✅ Superado |
| **Acessibilidade Digital** | WCAG 2.2 AA | **Zero violações graves ou críticas** (`axe-core`) | ✅ Superado |
| **Funcionamento Offline** | PWA após 1º acesso | **Service Worker com cache total de WASM e assets** | ✅ Superado |

---

## 7. Guia de Instalação e Execução Rápida

### Pré-requisitos
- **Node.js** versão 18 ou superior.
- **pnpm** versão 9 ou superior (`npm install -g pnpm`).

### Passos de Instalação
```bash
# 1. Clone o repositório oficial
git clone https://github.com/PauloHFA/GestoLivre.git
cd GestoLivre

# 2. Instale as dependências de todos os workspaces
pnpm install

# 3. Inicie o estúdio interativo de desenvolvimento
pnpm dev
# Acesse no navegador: http://localhost:5173
```

### Inicialização do Desktop Bridge (para controle de softwares do SO)
Em um terminal separado:
```bash
pnpm --filter @gestolivre/bridge start
# O servidor iniciará em ws://localhost:8765 pronto para receber comandos
```

### Executar a Bateria Completa de Testes
```bash
# Executa todos os 46 testes automatizados em todos os pacotes
pnpm test

# Executa o auditor de cobertura de especificações SDD
pnpm run verify:specs

# Valida a tipagem estrita de TypeScript em todo o monorepo
pnpm run typecheck

# Compila todos os pacotes para distribuição
pnpm run build
```

---

## 8. Guia de Uso Programático (API TypeScript)

A biblioteca foi projetada para ser consumida como pacote NPM de forma limpa e tipada:

```typescript
import { GestoLivre, IrisGazeTracker } from "@gestolivre/core";
import { ActionDispatcher } from "@gestolivre/actions";

// 1. Instancia o GestoLivre headless com visão facial e rastreamento ocular
const app = await GestoLivre.create({ sources: ["face"] });
const dispatcher = new ActionDispatcher();

// 2. Registra um ouvinte para o início do gesto
app.engine.on("gesturestart", async (event) => {
  console.log(`[Disparo] Gesto: ${event.name} | Confiança: ${event.confidence}`);

  if (event.name === "sorriso-suave") {
    // Sintetiza fala vocal imediata
    await dispatcher.dispatch("speech", { text: "Obrigado pela atenção!" }, {
      gestureName: event.name,
      confidence: event.confidence,
      timestamp: event.timestamp,
    });
  }

  if (event.name === "piscar-olho-direito") {
    // Injeta tecla nativa no Sistema Operacional via Bridge
    await dispatcher.dispatch("bridge", { key: "PageDown" }, {
      gestureName: event.name,
      confidence: event.confidence,
      timestamp: event.timestamp,
    });
  }
});

// 3. Conecta à webcam do usuário em um elemento HTML <video>
const videoElement = document.querySelector<HTMLVideoElement>("#minha-webcam")!;
await app.start(videoElement);
```

---

## 9. Licença e Contribuição

O **GestoLivre** é um projeto de código aberto mantido sob os termos da **Licença Apache 2.0** ([`LICENSE`](./LICENSE)), permitindo uso comercial, acadêmico e pessoal irrestrito, com garantia de integridade de autoria.

Para contribuir com correções de código, novos presets clínicos ou suporte a novas plataformas, consulte nosso [`CONTRIBUTING.md`](./CONTRIBUTING.md) e o nosso manifesto contínuo de entregas em [`PROGRESS.md`](./PROGRESS.md).
