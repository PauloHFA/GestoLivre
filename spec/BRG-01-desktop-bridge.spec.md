# Especificação: BRG-01 — Desktop Bridge para Injeção de Entradas no Sistema Operacional

## Requisitos Cobertos
- **RF-EXT-01**: Ponte (Bridge) nativa multiplataforma (Windows/Linux/macOS) via WebSocket local (`ws://127.0.0.1:8765`) para injeção de teclas do SO.
- **RNF-SEC-03**: Isolamento e segurança estrita: comunicação estritamente local (localhost), sem tráfego de dados para a nuvem.

---

## Critério de Aceite: CA-BRG-01 — Comunicação Local via WebSocket

```gherkin
Funcionalidade: Ponte Desktop WebSocket para Injeção de Teclas
  Como um usuário utilizando aplicativos nativos (PowerPoint, tocador de mídia, leitor de e-book)
  Quero que gestos capturados na webcam pelo navegador enviem teclas reais para o Sistema Operacional
  Para controlar qualquer software desktop instalado sem estar confinado ao navegador.

  Cenário: Conexão e handshake ping/pong com o servidor Bridge
    Dado que o processo desktop @gestolivre/bridge está em execução na porta 8765
    Quando a aplicação web ou o executor BridgeAction envia uma mensagem do tipo "ping"
    Então o servidor responde com status contendo a plataforma do SO e quantidade de conexões ativas.

  Cenário: Injeção de tecla simulada no Sistema Operacional
    Dado que a conexão WebSocket com o Bridge está estabelecida
    Quando o usuário realiza o gesto mapeado para avançar slide (ex: piscar olho direito)
    E o executor despacha a ação de tecla com código "ArrowRight"
    Então o Bridge executa o comando nativo do SO correspondente (SendKeys no Windows, xdotool no Linux, System Events no macOS)
    E responde com confirmação de sucesso "ack" para a aplicação web.
```
