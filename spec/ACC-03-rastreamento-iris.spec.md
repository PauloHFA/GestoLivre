# Especificação: ACC-03 — Rastreamento Ocular por Íris (Gaze Tracking Refinado)

## Requisitos Cobertos
- **RF-ACT-09**: Estimativa vetorial de direcionamento do olhar a partir dos marcos da íris e cantos dos olhos (MediaPipe Face Mesh 478 pontos).
- **RF-ACT-10**: Modo híbrido Cabeça + Olhar no controle de cursor, permitindo micro-ajuste sub-pixel sem sobrecarga cervical.

---

## Critério de Aceite: CA-ACC-03 — Estimativa Ocular e Micro-Ajuste do Cursor

```gherkin
Funcionalidade: Rastreamento Ocular Fino por Íris (Gaze Tracking)
  Como uma pessoa com mobilidade cervical reduzida ou fadigável
  Quero que pequenos desvios do olhar ajustem a mira do cursor
  Para alcançar botões pequenos e realizar cliques com dwell sem forçar o pescoço.

  Cenário: Detecção de direcionamento do olhar lateral
    Dado que a face do usuário possui marcos refinados de íris (landmarks >= 474)
    Quando as pupilas se deslocam para o canto do globo ocular
    Então o IrisGazeTracker calcula uma proporção horizontal (horizontalRatio > 0.70)
    E produz um vetor de desvio ocular normalizado centrado em zero.

  Cenário: Micro-ajuste híbrido no HeadCursor
    Dado o cursor de cabeça ativo com refinamento de olhar habilitado
    Quando o usuário olha para um botão próximo sem rotacionar a cabeça
    Então o HeadCursor adiciona o delta suave de olhar à posição do cursor
    E permite a estabilização para o disparo do dwell click.
```
