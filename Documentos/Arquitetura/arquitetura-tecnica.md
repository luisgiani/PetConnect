# PetConnect: Documento de Arquitetura e Decisões Técnicas

**Versão 2.0** | TCC em Ciência da Computação, CEUNSP

Este documento consolida as diretrizes técnicas e estruturais do PetConnect, um aplicativo para centralizar o processo de adoção de animais. A base Expo pode atender Android, iOS e Web; o MVP definido neste documento será desenvolvido e demonstrado em Android e Web. Todas as tecnologias adotadas possuem plano gratuito suficiente para o desenvolvimento e a apresentação do TCC.

## Escopo acordado do MVP

O escopo funcional acordado para a primeira entrega está definido em [escopo-mvp.md](../Produto/escopo-mvp.md). Este documento detalha as decisões técnicas para implementá-lo.

---

## 1. Stack Tecnológica

| Camada | Tecnologia | Custo |
| --- | --- | --- |
| Linguagem principal | TypeScript | Gratuito (open source) |
| Framework de interface | React Native com Expo (Expo Router) | Gratuito (open source) |
| Backend como serviço | Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions) | Plano Free |
| Banco de dados e segurança | SQL (PostgreSQL) com Row Level Security (RLS) | Incluído no Supabase |
| Estado do servidor | TanStack Query | Gratuito |
| Estado local | Zustand (somente se necessário) | Gratuito |
| Validação de formulários | Zod com React Hook Form | Gratuito |
| Versionamento | Git e GitHub (GitHub Desktop) | Gratuito |
| Integração contínua | GitHub Actions | Gratuito (verificar limites para repositórios privados) |
| Hospedagem da versão web | Vercel, Netlify ou Cloudflare Pages | Plano gratuito |
| IDE | Visual Studio Code | Gratuito |

### 1.1 Justificativa da escolha

- **Uma linguagem principal.** TypeScript é usado no aplicativo, na versão web e nas Edge Functions do Supabase, o que permite compartilhar tipos e reduz a curva de aprendizado da equipe.
- **Múltiplas plataformas com um código.** O Expo gera Android, iOS e Web a partir da mesma base. O requisito de "computador" é atendido pela versão web, acessível em qualquer navegador.
- **Ecossistema maduro.** Câmera, galeria, notificações e deep links (WhatsApp) possuem bibliotecas oficiais mantidas pelo Expo, e o `supabase-js` é o cliente mais completo da plataforma.
- **Relevância de mercado.** TypeScript e React são amplamente utilizados em aplicações web, mobile e backend.

### 1.2 Linguagens utilizadas no projeto

| Linguagem | Uso |
| --- | --- |
| TypeScript | Aplicativo, versão web, Edge Functions |
| SQL | Tabelas, restrições, índices, políticas RLS, migrations |
| YAML | Workflows de CI (GitHub Actions) |

### 1.3 Ressalvas sobre o plano gratuito

- **Pausa por inatividade.** Projetos Supabase no plano Free são pausados após 7 dias sem atividade e precisam ser reativados manualmente. Mitigação: manter atividade regular (testes, commits com deploy) e reativar o projeto antes de apresentações e demonstrações.
- **Limites.** Os limites do plano Free podem mudar; consulte o painel Supabase para os valores atuais. Mitigação: comprimir e redimensionar as fotos dos animais no cliente antes do upload (`expo-image-manipulator`). A equipe optou por trabalhar com um único projeto Supabase por restrição de custo; nesse caso, identificar e limitar dados de teste, evitar operações destrutivas e nunca redefinir o banco de produção.
- **Distribuição.** Para a banca, o aplicativo será demonstrado via Expo Go, APK de desenvolvimento (Android) e versão web. A publicação em lojas (Google Play e Apple Developer Program) é paga e está fora do escopo.
- **Builds na nuvem.** O EAS Build do Expo possui cota gratuita limitada; se necessário, o APK pode ser gerado localmente.

---

## 2. Arquitetura de Software

A aplicação segue o modelo de **Arquitetura em Camadas (Layered Architecture)**, com separação clara de responsabilidades:

- **Apresentação (UI):** telas (rotas do Expo Router) e componentes React Native. Tratam a entrada do usuário e exibem dados. Funcionam em mobile e web.
- **Aplicação (Hooks):** hooks customizados (`useAnimals`, `useCreateAnimal`) que conectam as telas aos serviços e gerenciam cache e estados de carregamento via TanStack Query.
- **Domínio (Services):** regras de negócio da plataforma, como validação de cadastro de animais, filtros de busca e permissões por tipo de usuário.
- **Infraestrutura (Repositories):** comunicação com o Supabase (PostgreSQL, Storage, Auth).

**Fluxo de dependência:** Tela → Hook → Service → Repository → Supabase. Nenhuma camada acessa diretamente a que está dois níveis abaixo.

### 2.1 Estrutura de pastas

```
src/
├── app/                      # Apresentação: rotas (Expo Router)
│   ├── animals/              # Lista, detalhe e cadastro de animal
│   ├── auth/                 # Login, cadastro, confirmação e callback
│   └── account.tsx           # Conta e encerramento de sessão
├── components/               # Componentes reutilizáveis (AnimalCard, Input, etc.)
├── features/
│   ├── animals/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── types.ts
│   └── auth/
│       ├── repositories/     # AuthRepository e ProfileRepository
│       ├── schemas/
│       ├── types.ts
│       └── AuthProvider.tsx  # Sessão persistente e perfil corrente
└── lib/
    └── supabase/             # Cliente e tipos do banco
supabase/
├── migrations/               # SQL versionado junto ao código
└── functions/                # Edge Functions (TypeScript)
```

Pastas `interests/` e `profile/` como features independentes não fazem parte da estrutura atual do MVP; não criá-las até que uma evolução seja aprovada.

### 2.2 Autenticação e criação do perfil

O cliente Supabase é compartilhado para que consultas, sessão e renovação usem a mesma instância. No cadastro, a aplicação envia nome, tipo (`adotante` ou `doador_ong`) e telefone do doador/ONG como metadados do usuário. Uma migration cria o perfil associado ao `auth.users.id` por trigger.

`profiles` permite leitura somente pelo próprio usuário. O tipo do perfil não pode ser alterado via Data API após a criação; nome e telefone podem ser atualizados pelo titular. As policies de `animals` exigem perfil `doador_ong` para inserir, editar ou remover anúncios. O projeto Supabase deve ter confirmação por e-mail habilitada e a URL `petconnect://auth/callback` (mais a URL de desenvolvimento do Expo quando aplicável) permitida em Authentication Redirect URLs.

---

## 3. Padrões de Projeto

O **Repository Pattern** é o pilar da comunicação com o banco de dados. Ele isola o código que manipula o Supabase (consultas, inserts, uploads) do restante do aplicativo, mantendo as telas limpas e facilitando testes com repositórios simulados (mocks).

Exemplo de contrato:

```ts
export interface AnimalRepository {
  list(filters: AnimalFilters): Promise<Animal[]>;
  getById(id: string): Promise<Animal | null>;
  create(data: NewAnimal, ownerId: string): Promise<Animal>;
}
```

A implementação concreta (`SupabaseAnimalRepository`) fica na camada de infraestrutura e pode ser substituída sem alterar as demais camadas.

---

## 4. Gerenciamento de Estado

- **Estado do servidor** (listas de animais, detalhes e perfil): **TanStack Query**, que fornece cache, revalidação, estados de carregamento e erro sem código repetitivo.
- **Estado local de interface** (filtros abertos, formulários): `useState` e `useReducer` dentro das telas.
- **Estado global** (sessão do usuário): Context do React ou Zustand, limitado ao necessário.

Essa abordagem evita a complexidade de soluções de estado pesadas e mantém a prototipação rápida.

---

## 5. Segurança e Autenticação

A autenticação utiliza o **Supabase Auth**, que emite tokens **JWT** nativos e os renova automaticamente.

Como o aplicativo acessa o banco diretamente por meio do Supabase, a proteção real dos dados está no banco. Por isso a segurança **não** é adiada para uma fase posterior:

- **MVP:** Supabase Auth (cadastro e login) e **Row Level Security** ativos desde o início, com leitura pública de animais disponíveis e escrita limitada ao responsável. As permissões também distinguem adotante e doador/ONG.
- **Evolução:** denúncias e Edge Functions para regras sensíveis, se necessárias.

Exemplos de políticas RLS:

- `animals`: qualquer pessoa pode ler animais com status "available"; inserção, edição e remoção exigem sessão autenticada, `owner_id = auth.uid()` e perfil do tipo `doador_ong`.
- `profiles`: a leitura direta continua restrita ao próprio usuário. Nome e telefone do responsável por anúncios disponíveis podem ser consultados por usuários autenticados somente via função controlada `get_animal_contacts`; nunca abrir leitura pública de perfis.

Validações críticas existem **também no banco** (constraints, tipos enumerados e RLS), nunca apenas no cliente.

---

## 6. Modelo de Dados Alvo (PostgreSQL)

| Tabela | Campos principais |
| --- | --- |
| `profiles` | id (= auth.users.id), nome, tipo (`adotante` \| `doador_ong`), telefone, criado_em |
| `animals` | id, owner_id, nome, especie (`cachorro` \| `gato` \| `outro`), raca, idade, porte, saude, descricao, cidade, estado, photo_paths (1–5 caminhos de fotos), status, criado_em. As migrations de localização/fotos preservam anúncios anteriores com colunas nulas ou lista de fotos vazia; novos anúncios exigem cidade, estado e ao menos uma foto. |
| `animal_photos` | id, animal_id, caminho do arquivo no Supabase Storage, ordem (de uma a cinco fotos por anúncio publicado) |
| `interests` | Fora do MVP; avaliar somente se favoritos/intenção de adoção forem aprovados em uma evolução |
| `conversations`, `messages` | Fora do MVP; criar somente se o chat interno for aprovado em uma evolução |

O campo `especie` foi acrescentado em relação ao protótipo, pois é necessário para os filtros de busca.

A lista atual aplica filtros por espécie e porte exatos, cidade por correspondência parcial sem diferenciar maiúsculas/minúsculas e estado pela UF exata. A mesma interface é usada nos repositórios demo e Supabase.

---

## 7. Escopo e Comunicação entre as Partes

1. **MVP atual:** somente a tela de detalhes mostra nome e telefone do responsável, para usuários autenticados e apenas em anúncios disponíveis; os links `tel:` e **Conversar pelo WhatsApp** iniciam o contato. A lista de busca não consulta nem recebe dados de contato.
2. **Fora do MVP atual:** favoritos/interesses e chat interno com Supabase Realtime exigem nova decisão de escopo e, quando aplicável, tabelas e políticas RLS.

O MVP tem como plataformas-alvo Android e Web. Consulte o [índice da documentação](../README.md) para a ordem de autoridade e os demais documentos ativos.

---

## 8. Qualidade, Testes e Integração Contínua

- **Direção planejada:** testes unitários para Services e validadores Zod; testes de fluxo de tela (por exemplo, Maestro); lint e formatação; CI que execute essas verificações e `tsc --noEmit`.
- **Estado atual:** essas ferramentas de teste/lint e workflow de CI ainda não estão configuradas no projeto. O comando disponível é `npm run typecheck`; veja o [guia de desenvolvimento](guia-desenvolvedor.md) para as validações manuais existentes.

---

## 9. Riscos e Mitigações

| Risco | Mitigação |
| --- | --- |
| Projeto Supabase pausado por inatividade | Atividade regular e reativação antes das apresentações |
| Limite de 1 GB de fotos | Compressão no cliente e limite de fotos por animal |
| Aprendizado de React Native pela equipe | Teste de viabilidade na primeira semana (login, lista, upload de foto, execução no celular) |
| Divergência entre documentos | Revisão conjunta do pré-projeto, arquitetura e protótipo a cada mudança de escopo |