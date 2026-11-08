# Especificação: ACT-01 — Disparo com Sustentação e Anti-Disparo Acidental

## Requisitos Cobertos
- **RF-ACT-01**: Modo "teste ao vivo" mostrando gesto atual, confiança e latência.
- **RF-ACT-02**: Emitir eventos `gesturestart`, `gestureend`, `gesturehold` com payload (nome, confiança, timestamp).
- **RF-ACT-03**: Mapear gesto -> ação: tecla/atalho, clique em elemento, fala (Web Speech API), webhook HTTP, WebSocket.
- **RF-ACT-04**: Configurar por gesto: limiar, tempo de sustentação (`holdMs`), cooldown, modo.
- **RF-ACT-05**: Botão/atalho de emergência para pausar todo reconhecimento.

---

## Critério de Aceite: CA-ACT-01 — Disparo com Sustentação (Hold Time)

```gherkin
Funcionalidade: Rejeição de Movimentos Involuntários por Sustentação
  Como uma pessoa com tremor ou espasmo
  Quero que o sistema só dispare uma ação se o gesto for sustentado intencionalmente
  Para evitar ações indesejadas causadas por reflexos passageiros.

  Cenário: Gesto mantido por tempo insuficiente
    Dado o gesto "piscar-esquerdo" configurado com holdMs = 400
    Quando o usuário pisca rapidamente por 250 ms
    Então nenhuma ação é executada
    E nenhum evento "gesturestart" acionador é emitido.

  Cenário: Gesto mantido com sucesso
    Dado o gesto "piscar-esquerdo" configurado com holdMs = 400
    Quando o usuário mantém o olho fechado por >= 400 ms
    Então a ação mapeada é disparada exatamente uma vez
    E o ciclo de cooldown é ativado para impedir disparos múltiplos indesejados.
```

---

## Critério de Aceite: CA-ACT-02 — Taxa de Falsos Disparos em Repouso

```gherkin
Funcionalidade: Robustez contra Falsos Disparos em Uso Cotidiano
  Cenário: Uso normal com classe neutro ativa
    Dado um perfil treinado com gestos e a classe neutro
    Quando o usuário digita, conversa e se move naturalmente por 10 minutos
    Então a taxa de disparos indevidos é <= 1 por hora com as configurações padrão.
```

---

## Critério de Aceite: CA-ACT-03 — Pausa de Emergência Imediata

```gherkin
Funcionalidade: Interrupção Rápida de Segurança
  Cenário: Acionamento de parada imediata
    Dado o motor de reconhecimento ativo
    Quando o usuário pressiona a tecla de atalho de emergência (ex: Escape) ou clica no botão "Pausar"
    Então todo processamento de novas ações é congelado em tempo <= 200 ms
    E a interface reflete imediatamente o estado visual "Pausado".
```
