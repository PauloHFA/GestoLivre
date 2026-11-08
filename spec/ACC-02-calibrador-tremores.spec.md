# Especificação: ACC-02 — Assistente de Calibração Automática de Tremores

## Requisitos Cobertos
- **RF-CAL-01**: Análise em repouso da oscilação natural e amplitude de tremor involuntário da cabeça e face.
- **RF-CAL-02**: Cálculo estatístico de desvio padrão e ajuste automático da zona morta (`deadzone`), sensibilidade e tempo de sustentação (`holdMs`).

---

## Critério de Aceite: CA-ACC-02 — Análise e Calibração Adaptativa

```gherkin
Funcionalidade: Calibração Adaptativa de Tremores e Amplitude Motora
  Como uma pessoa com movimentos involuntários (ataxia, espasmos ou paralisia cerebral)
  Quero que o sistema meça meu padrão de tremor durante repouso
  Para ajustar automaticamente a zona morta e a sensibilidade sem adivinhação manual.

  Cenário: Detecção de tremor severo e aumento de deadzone
    Dado que o assistente de calibração está ativo coletando coordenadas da face em repouso
    Quando o usuário apresenta espasmos e tremores de alta amplitude (desvio padrão > 0.025)
    Então o analisador classifica o tremor como severo ("high")
    E calcula uma deadzone ampliada (>= 0.04) para absorver o tremor
    E sugere um holdMs estendido (>= 400ms) para rejeitar disparos acidentais.

  Cenário: Detecção de estabilidade e ajuste fino
    Dado que o usuário tem controle motor suave em repouso (desvio padrão < 0.005)
    Quando a análise é finalizada
    Então o sistema classifica a estabilidade como alta ("low")
    E ajusta a sensibilidade para 3.0 permitindo controle ágil com deadzone compacta.
```
