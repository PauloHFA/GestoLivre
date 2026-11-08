# Especificação: ACT-07 — Modo Varredura e Cursor por Cabeça com Dwell Click

## Requisitos Cobertos
- **RF-ACT-07**: Controle de cursor por movimento de cabeça com sensibilidade ajustável e dwell click.
- **RF-ACT-08**: Modo varredura (scanning) com teclado virtual acionado por um único gesto como comutador.

---

## Critério de Aceite: CA-ACT-07 — Controle de Cursor com Dwell Click

```gherkin
Funcionalidade: Controle de Cursor por Cabeça e Clique por Fixação (Dwell)
  Como uma pessoa com tetraplegia ou mobilidade nula nos membros superiores
  Quero mover o ponteiro do mouse movendo a cabeça e clicar mantendo o cursor parado
  Para navegar em interfaces e interagir sem precisar de mouse físico.

  Cenário: Movimentação suave e rejeição de tremores na zona morta
    Dado que o modo de cursor de cabeça está ativo e calibrado no centro (0.5, 0.5)
    Quando o usuário tem pequenos espasmos de cabeça dentro do raio de deadzone (< 0.02)
    Então o cursor permanece estável sem oscilações bruscas.

  Cenário: Disparo automático de dwell click
    Dado que o cursor está posicionado sobre um botão ou elemento clicável
    Quando o usuário mantém a cabeça parada dentro do raio de tolerância por >= dwellTimeMs (ex: 900 ms)
    Então o anel visual de progresso atinge 100%
    E o evento de clique é disparado no elemento selecionado.
```

---

## Critério de Aceite: CA-ACT-08 — Digitação por Varredura com Comutador Único

```gherkin
Funcionalidade: Teclado Virtual por Varredura Bidimensional (Linha-Coluna)
  Como uma pessoa com limitação motora severa capaz de realizar apenas 1 movimento confiável
  Quero que o teclado varra automaticamente linhas e teclas
  Para selecionar letras e produzir fala sintetizada usando apenas um gesto como botão.

  Cenário: Seleção em dois passos de comutador
    Dado o teclado de varredura ativo alternando linhas a cada intervalo configurado
    Quando o usuário realiza o gesto calibrado (ex: piscar de olhos)
    Então a linha ativa é fixada e o scanner passa a varrer as teclas daquela linha
    E quando o usuário realiza o gesto novamente sobre a letra desejada
    Então a letra é inserida no texto e o scanner retorna à varredura de linhas.
```
