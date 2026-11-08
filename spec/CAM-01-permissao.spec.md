# Especificação: CAM-01 — Permissão, Câmera e Privacidade

## Requisitos Cobertos
- **RF-CAM-01**: Solicitar permissão da webcam de forma explícita e explicar o uso dos dados antes do pedido.
- **RF-CAM-02**: Listar e permitir escolher a câmera; lembrar a escolha.
- **RF-CAM-03**: Exibir pré-visualização espelhada com sobreposição dos landmarks (ativável).
- **RF-CAM-07**: Parar a câmera imediatamente e mostrar indicador claro quando estiver ativa.

---

## Critério de Aceite: CA-CAM-01 — Permissão e Privacidade

```gherkin
Funcionalidade: Permissão e Acesso à Câmera com Privacidade Total
  Como um usuário do GestoLivre
  Quero ser informado claramente sobre o processamento local dos meus dados visuais
  Para que eu possa conceder acesso à webcam com segurança e confiança.

  Cenário: Solicitação explícita e abertura da câmera
    Dado que o usuário abre o Studio pela primeira vez
    Quando clica em "Ativar câmera"
    Então vê um texto explicando que nenhum vídeo é gravado ou enviado para servidores
    E o navegador solicita permissão via getUserMedia
    E um indicador "câmera ativa" aparece visivelmente na interface enquanto a captura estiver em uso.

  Cenário: Encerramento imediato da câmera
    Dado que a câmera está ativa e transmitindo quadros
    Quando o usuário clica em "Desativar câmera"
    Então todos os MediaStreamTracks são interrompidos imediatamente (track.stop())
    E o indicador "câmera ativa" é removido
    E nenhum quadro subsequente é processado pelo detector.
```
