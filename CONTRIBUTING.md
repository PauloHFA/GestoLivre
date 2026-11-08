# Guia de Contribuição — GestoLivre 🪟✋

Obrigado pelo seu interesse em contribuir com o **GestoLivre**! Nosso compromisso é construir uma biblioteca de tecnologia assistiva de alta qualidade, 100% privada, acessível (WCAG 2.2 AA) e orientada por especificações (**Spec-Driven Development**).

---

## 🛠️ Ambiente de Desenvolvimento

### Pré-requisitos
- **Node.js**: v22 ou v24+
- **pnpm**: v12+

### Primeiros Passos
```bash
# Clonar o repositório
git clone https://github.com/PauloHFA/GestoLivre.git
cd GestoLivre

# Instalar dependências
pnpm install

# Iniciar o Studio em modo de desenvolvimento
pnpm dev:studio
```

---

## 🧪 Qualidade e Validação Contínua

Antes de abrir um Pull Request, certifique-se de que todas as etapas de validação passam com sucesso:

```bash
# 1. Auditoria de Rastreabilidade SDD (falha se houver requisito Must sem teste)
pnpm run verify:specs

# 2. Verificação estrita de tipos TypeScript (strict: true)
pnpm run typecheck

# 3. Suíte de testes unitários, integração e acessibilidade (axe-core)
pnpm test

# 4. Build de produção dos pacotes e aplicação
pnpm build
```

---

## 📐 Metodologia Spec-Driven Development (SDD)

Cada novo requisito funcional ou não-funcional deve:
1. Conter um arquivo `.spec.md` no diretório `spec/` descrevendo os cenários no padrão **Dado / Quando / Então** (Given/When/Then).
2. Estar registrado na matriz de rastreabilidade em [`spec/README.md`](./spec/README.md).
3. Conectar-se a um arquivo de teste automatizado correspondente.

---

## 📦 Versionamento e Publicação com Changesets

Utilizamos o **Changesets** para gerenciar versionamento semântico:

```bash
# Criar um novo registro de alteração
pnpm changeset

# Atualizar as versões dos pacotes nos package.json
pnpm version-packages

# Publicar no npm (requer credenciais de publicação)
pnpm release
```

---

## ♿ Acessibilidade (WCAG 2.2 AA)

Todos os componentes visuais devem:
- Possuir alvos de toque $\ge 44\text{ px}$.
- Atender à taxa de contraste mínima de 4.5:1.
- Oferecer navegação completa por teclado e leitor de tela.
- Passar na auditoria automatizada do `axe-core` sem violações críticas ou graves.
