# GestoLivre 🪟✋

> Biblioteca *open source* e app de treino para ensinar a webcam a reconhecer os seus movimentos e disparar ações, com foco absoluto em acessibilidade, privacidade e desempenho.

Execução **100% local no navegador** utilizando **MediaPipe Tasks Vision** e classificadores de aprendizado de máquina leves sobre coordenadas de *landmarks* numéricos (sem jamais armazenar ou transmitir imagens de vídeo).

---

## 📦 Estrutura do Monorepo

```
gestolivre/
├── packages/
│   ├── core/       # @gestolivre/core: Câmera, MediaPipe, Normalização, k-NN, Eventos
│   ├── actions/    # @gestolivre/actions: Executores (teclado, clique, fala TTS, webhook)
│   └── ui/         # @gestolivre/ui: Componentes de gravação, teste e mapeamento (React)
├── apps/
│   └── studio/     # GestoLivre Studio: Aplicação web PWA para gravação, treino e uso
├── examples/       # Exemplos práticos (passador de slides, comunicador por piscada)
└── spec/           # Especificações executáveis (Spec-Driven Development)
```

---

## 🚀 Como Começar

```bash
# Instalar dependências
pnpm install

# Iniciar o Studio em modo de desenvolvimento
pnpm dev

# Executar testes unitários e de integração
pnpm test
```

---

## 🔒 Privacidade e Ética (LGPD)

- Nenhum quadro de vídeo ou fotografia é salvo, persistido ou transmitido pela rede.
- O treinamento é feito estritamente sobre vetores geométricos (*landmarks* e *blendshapes*).
- Perfis exportados (`.gestolivre.json`) pertencem exclusivamente ao usuário.

---

## 📄 Licença

Distribuído sob os termos da licença [Apache 2.0](./LICENSE).
