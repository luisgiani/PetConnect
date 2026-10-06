# Documentação do PetConnect

## Ordem de autoridade

Use estes materiais nesta ordem ao implementar ou validar uma funcionalidade:

1. **[Escopo do MVP](Produto/escopo-mvp.md)** — fonte de verdade para funcionalidades, plataformas, regras de produto e critérios de aceite.
2. **[Arquitetura técnica](Arquitetura/arquitetura-tecnica.md)** — fonte de verdade para stack, camadas, integrações, modelo de dados e segurança técnica.
3. **[Pré-projeto do TCC — versão alinhada ao MVP](Produto/pre-projeto-mvp.md)** — descrição acadêmica do problema, objetivo e metodologia. A cópia oficial em Word está ao lado.
4. **[Especificação das telas](Design/especificacao-de-telas.md)** — conteúdo e estados de cada tela para implementação.
5. **[Protótipo de fluxo do MVP](Design/fluxo-mvp.svg)** — referência visual dos fluxos.
6. **[README do repositório](../README.md)** — instruções de instalação e execução do código existente.

Se houver divergência, o escopo define **o que entregar**; a arquitetura define **como implementar**. O código não deve ser tratado como prova de que um requisito está concluído: compare-o com os critérios de aceite e valide-o com testes.

## Documentos ativos

O Markdown do pré-projeto é a fonte editável preferida para mudanças de conteúdo; mantenha a cópia DOCX sincronizada antes de uma submissão acadêmica.

| Documento | Finalidade |
| --- | --- |
| [Produto/escopo-mvp.md](Produto/escopo-mvp.md) | Requisitos acordados e critérios de aceite. |
| [Produto/pre-projeto-mvp.md](Produto/pre-projeto-mvp.md) | Texto-fonte em Markdown para o pré-projeto acadêmico. |
| [Produto/pre-projeto-mvp.docx](Produto/pre-projeto-mvp.docx) | Cópia editável do pré-projeto alinhada ao escopo. |
| [Arquitetura/arquitetura-tecnica.md](Arquitetura/arquitetura-tecnica.md) | Decisões técnicas e arquitetura. |
| [Design/especificacao-de-telas.md](Design/especificacao-de-telas.md) | Requisitos de apresentação, telas, estados e fluxos. |
| [Design/fluxo-mvp.svg](Design/fluxo-mvp.svg) | Diagrama visual dos fluxos do MVP. |

## Histórico

Materiais anteriores estão em [Arquivo/](Arquivo/). São preservados como referência e não devem orientar novas implementações quando divergirem dos documentos ativos.

## Organização

```text
Documentos/
├── README.md                 # Índice, autoridade e instruções de consulta
├── Produto/                  # Escopo e documentação acadêmica
├── Arquitetura/              # Decisões e especificações técnicas
├── Design/                   # Diagramas e protótipos vigentes
└── Arquivo/                  # Versões históricas/superadas, apenas referência
```
