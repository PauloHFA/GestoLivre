# Especificação: ACC-01 — Biblioteca de Presets Clínicos e de Acessibilidade

## Requisitos Cobertos
- **RF-PRF-05**: Catálogo de perfis e modelos pré-configurados baseados em evidências clínicas para ELA, Paralisia Cerebral, Tetraplegia e Produtividade.
- **RF-PRF-03**: Carregamento instantâneo de perfis com gestos, ações e parâmetros recomendados (deadzone, sensibilidade, dwell).

---

## Critério de Aceite: CA-ACC-01 — Seleção e Ativação de Preset Clínico

```gherkin
Funcionalidade: Carregamento de Presets Clínicos Pré-Configurados
  Como um terapeuta ocupacional, cuidador ou usuário com necessidade específica
  Quero escolher um modelo pré-configurado para minha condição motora
  Para iniciar o uso com parâmetros ideais sem precisar cadastrar gestos e ações manualmente.

  Cenário: Carregamento do perfil de ELA (Comunicação por Expressões Faciais)
    Dado que o usuário abre a biblioteca de modelos prontos
    Quando seleciona o preset "ELA — Comunicação Rápida por Gestos Faciais"
    Então o sistema carrega o perfil contendo ações de fala sintetizada ("Sim", "Não", "Obrigado")
    E configura o tempo recomendado de sustentação e dwell time.

  Cenário: Carregamento do perfil de Paralisia Cerebral (Comutador Anti-Espasmo)
    Dado que o usuário seleciona o preset de Paralisia Cerebral
    Quando o modelo é aplicado
    Então o sistema define o gesto de comutador com cooldown estendido para evitar disparos duplos
    E vincula o acionamento ao motor de varredura (teclado virtual).
```
