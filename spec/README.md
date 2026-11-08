# Matriz de Rastreabilidade — Spec-Driven Development (SDD)

Este diretório contém as especificações executáveis e critérios de aceite no formato **Dado / Quando / Então** (Given/When/Then), vinculando os requisitos do documento aos testes automatizados.

## Mapeamento de Requisitos e Testes

| ID Requisito | Descrição | Arquivo Spec | Teste Automatizado Vinculado | Status |
|---|---|---|---|---|
| **RF-CAM-01** | Permissão explícita da webcam com texto de privacidade prévio | [`CAM-01-permissao.spec.md`](./CAM-01-permissao.spec.md) | `packages/core/tests/camera.test.ts` | 📝 Especificado |
| **RF-CAM-02** | Seleção e memorização do dispositivo de câmera | [`CAM-01-permissao.spec.md`](./CAM-01-permissao.spec.md) | `packages/core/tests/camera.test.ts` | 📝 Especificado |
| **RF-CAM-03** | Pré-visualização espelhada com overlay de landmarks | [`CAM-01-permissao.spec.md`](./CAM-01-permissao.spec.md) | `apps/studio/tests/camera-preview.test.ts` | 📝 Especificado |
| **RF-CAM-07** | Indicador claro de status ativo e encerramento imediato | [`CAM-01-permissao.spec.md`](./CAM-01-permissao.spec.md) | `packages/core/tests/camera.test.ts` | 📝 Especificado |
| **RF-TRN-01** | CRUD de gestos e seleção de fontes (mão, rosto, corpo) | [`TRN-01-treino-rapido.spec.md`](./TRN-01-treino-rapido.spec.md) | `packages/core/tests/trainer.test.ts` | 📝 Especificado |
| **RF-TRN-02** | Gravação de amostras com contagem regressiva e meta | [`TRN-01-treino-rapido.spec.md`](./TRN-01-treino-rapido.spec.md) | `packages/core/tests/trainer.test.ts` | 📝 Especificado |
| **RF-TRN-04** | Treino k-NN local em $\le 5$s com acurácia $\ge 90\%$ | [`TRN-01-treino-rapido.spec.md`](./TRN-01-treino-rapido.spec.md) | `packages/core/tests/classifier-knn.test.ts` | 📝 Especificado |
| **RF-TRN-06** | Assistente guiado obrigatório para classe `neutro` | [`TRN-01-treino-rapido.spec.md`](./TRN-01-treino-rapido.spec.md) | `packages/core/tests/trainer.test.ts` | 📝 Especificado |
| **RF-TRN-07** | Alerta de sobreposição entre gestos / distância para neutro | [`TRN-01-treino-rapido.spec.md`](./TRN-01-treino-rapido.spec.md) | `packages/core/tests/classifier-knn.test.ts` | 📝 Especificado |
| **RF-ACT-01** | Teste ao vivo com gesto detectado, confiança e latência | [`ACT-01-disparo-sustentado.spec.md`](./ACT-01-disparo-sustentado.spec.md) | `packages/core/tests/engine.test.ts` | 📝 Especificado |
| **RF-ACT-02** | Ciclo de eventos `gesturestart`, `gesturehold`, `gestureend` | [`ACT-01-disparo-sustentado.spec.md`](./ACT-01-disparo-sustentado.spec.md) | `packages/core/tests/engine.test.ts` | 📝 Especificado |
| **RF-ACT-03** | Mapeamento de ações (tecla, clique, fala TTS, webhook) | [`ACT-01-disparo-sustentado.spec.md`](./ACT-01-disparo-sustentado.spec.md) | `packages/actions/tests/actions.test.ts` | 📝 Especificado |
| **RF-ACT-04** | Histerese, sustentação (`holdMs`) e cooldown | [`ACT-01-disparo-sustentado.spec.md`](./ACT-01-disparo-sustentado.spec.md) | `packages/core/tests/engine.test.ts` | 📝 Especificado |
| **RF-ACT-05** | Botão/atalho de emergência para suspender eventos em $\le 200$ms | [`ACT-01-disparo-sustentado.spec.md`](./ACT-01-disparo-sustentado.spec.md) | `packages/core/tests/engine.test.ts` | 📝 Especificado |
| **RF-PRF-01** | Armazenamento de perfis em IndexedDB | [`PRF-01-export-import.spec.md`](./PRF-01-export-import.spec.md) | `packages/core/tests/storage.test.ts` | 📝 Especificado |
| **RF-PRF-02** | Exportar/importar perfil `.gestolivre.json` | [`PRF-01-export-import.spec.md`](./PRF-01-export-import.spec.md) | `packages/core/tests/storage.test.ts` | 📝 Especificado |
| **RF-PRF-04** | Exclusão completa de dados com confirmação (LGPD) | [`PRF-01-export-import.spec.md`](./PRF-01-export-import.spec.md) | `packages/core/tests/storage.test.ts` | 📝 Especificado |
| **RF-API-01** | Uso 100% headless apenas via código TypeScript | [`API-01-headless.spec.md`](./API-01-headless.spec.md) | `packages/core/tests/api.test.ts` | 📝 Especificado |
