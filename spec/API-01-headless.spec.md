# Especificação: API-01 — Uso Headless e Extensibilidade da API

## Requisitos Cobertos
- **RF-API-01**: Publicar `@gestolivre/core` no npm com tipos TypeScript, ESM e CJS.
- **RF-API-02**: API declarativa e orientada a eventos.
- **RF-API-03**: Funcionar sem a UI: ser possível treinar e inferir só por código.
- **RF-API-04**: Interface `Classifier` e `FeatureExtractor` extensíveis por plugins.
- **RF-API-05**: Documentação com guia rápido e exemplos executáveis.

---

## Critério de Aceite: CA-API-01 — Uso só com Código

```gherkin
Funcionalidade: Consumo Headless da Biblioteca
  Como um desenvolvedor web ou maker
  Quero integrar o @gestolivre/core no meu próprio projeto via código puro
  Para disparar ações na minha aplicação sem depender da UI do Studio.

  Cenário: Inicialização e escuta de eventos via código
    Dado um projeto com "@gestolivre/core" instalado
    Quando o desenvolvedor escreve menos de 20 linhas de código para instanciar GestoLivre
    E define amostras ou carrega um perfil
    Então recebe os eventos "gesturestart" e "gesturehold" diretamente em callbacks tipados
    Sem necessidade de carregar qualquer elemento gráfico ou framework da UI.
```
