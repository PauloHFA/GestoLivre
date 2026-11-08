# Especificação: PRF-01 — Perfis, Exportação/Importação e Privacidade

## Requisitos Cobertos
- **RF-PRF-01**: Salvar perfis (gestos, exemplos, modelo, mapeamentos) em IndexedDB.
- **RF-PRF-02**: Exportar/importar perfil como arquivo único (`.gestolivre.json`).
- **RF-PRF-03**: Múltiplos perfis por dispositivo.
- **RF-PRF-04**: Excluir todos os dados com um clique, com confirmação.
- **RF-PRF-05**: Versionar o esquema do perfil e migrar perfis antigos.

---

## Critério de Aceite: CA-PRF-01 — Exportar e Importar Perfil

```gherkin
Funcionalidade: Portabilidade Segura de Perfis
  Como um usuário ou terapeuta
  Quero salvar e transferir perfis de treino entre diferentes computadores
  Para reutilizar calibrações sem precisar regravar todos os gestos.

  Cenário: Exportação e importação em outro dispositivo
    Dado um perfil calibrado e treinado com gestos e mapeamentos de ações
    Quando o usuário exporta o arquivo ".gestolivre.json"
    E importa o arquivo em um novo navegador/dispositivo
    Então todos os gestos, amostras de landmarks e ações mapeadas são restaurados
    E o modelo classificador é reconstituído com resultados equivalentes.
```

---

## Critério de Aceite: CA-PRF-02 — Exclusão Total de Dados Locais (LGPD)

```gherkin
Funcionalidade: Direito ao Esquecimento e Limpeza de Biometria Numérica
  Cenário: Apagar todos os dados com confirmação
    Dado um sistema com múltiplos perfis e centenas de landmarks salvos no IndexedDB
    Quando o usuário clica em "Apagar tudo" e confirma no diálogo de segurança
    Então o banco IndexedDB, caches e dados locais são completamente esvaziados
    E nenhuma informação residual permanece no cliente.
```
