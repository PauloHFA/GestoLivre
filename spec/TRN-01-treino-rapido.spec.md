# Especificação: TRN-01 — Treino Rápido e Qualidade Mínima

## Requisitos Cobertos
- **RF-TRN-01**: Criar, renomear, remover gestos e definir quais fontes usam (mão, rosto, corpo).
- **RF-TRN-02**: Gravar exemplos com contagem regressiva, meta de quantidade e barra de progresso.
- **RF-TRN-04**: Treinar o modelo localmente com um clique, mostrando progresso e acurácia.
- **RF-TRN-06**: Gravar automaticamente a classe neutro com assistente guiado.
- **RF-TRN-07**: Avisar quando dois gestos forem muito parecidos e sugerir regravar.

---

## Critério de Aceite: CA-TRN-01 — Treino em Menos de Dois Minutos

```gherkin
Funcionalidade: Treino Local Rápido de Gestos
  Como um usuário com limitação motora ou cuidador
  Quero treinar um gesto personalizado rapidamente no navegador
  Para começar a controlar o computador sem esforço prolongado.

  Cenário: Treino completo de gesto inicial
    Dado um usuário novo sem perfil configurado
    Quando ele cria o gesto "joinha"
    E grava 40 exemplos desse gesto
    E grava a classe "neutro" com 40 a 60 exemplos
    E clica em "Treinar"
    Então o modelo é treinado localmente em tempo <= 5 segundos
    E o teste ao vivo reconhece o gesto "joinha" ao refazer o movimento
    E todo o fluxo de ponta a ponta é concluído em <= 2 minutos.
```

---

## Critério de Aceite: CA-TRN-02 — Qualidade Mínima de Classificação

```gherkin
Funcionalidade: Avaliação e Matriz de Confusão
  Cenário: Validação cruzada por blocos temporais
    Dado um perfil com 3 gestos distintos e a classe neutro treinados com 40 exemplos cada
    Quando é executada a validação em blocos temporais (20% para teste, preservando continuidade temporal)
    Então a acurácia global é >= 90%
    E nenhum gesto apresenta revocação (recall) inferior a 80%.
```

---

## Critério de Aceite: CA-TRN-03 — Gestos Parecidos e Distância ao Neutro

```gherkin
Funcionalidade: Alerta de Ambiguidade de Gestos
  Cenário: Detecção de colisão entre centróides
    Dado dois gestos cujos vetores de landmarks normalizados possuem distância cosseno/euclidiana abaixo do limiar de segurança
    Quando o usuário clica em "Treinar"
    Então o sistema emite um alerta identificando o par ambíguo
    E sugere regravar ou unificar os gestos para evitar disparos acidentais.
```
