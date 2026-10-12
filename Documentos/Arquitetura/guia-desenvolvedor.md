# Guia de desenvolvimento do PetConnect

Este guia orienta a preparação do ambiente, a execução, a leitura do código e a validação das funcionalidades existentes. Para decidir o que o produto deve fazer, consulte primeiro o [escopo do MVP](../Produto/escopo-mvp.md); para decisões estruturais, consulte a [arquitetura técnica](arquitetura-tecnica.md).

## 1. Preparar o projeto em uma máquina nova

Pré-requisitos: Git, Node.js LTS e npm. Para executar no celular, instale Expo Go em um dispositivo Android na mesma rede do computador.

1. Clone o repositório e abra a pasta que contém `package.json`.
2. Instale as dependências:

   ```powershell
   npm.cmd install
   ```

3. Crie o arquivo de configuração local a partir do modelo:

   ```powershell
   Copy-Item .env.example .env
   ```

   Para executar com dados de demonstração, mantenha `EXPO_PUBLIC_DATA_SOURCE=demo`. Para conectar ao Supabase, use `EXPO_PUBLIC_DATA_SOURCE=supabase` e preencha a URL e a chave Publishable do projeto:

   ```text
   EXPO_PUBLIC_DATA_SOURCE=supabase
   EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_SUA_CHAVE
   ```

   O cliente também aceita `EXPO_PUBLIC_SUPABASE_ANON_KEY` como nome alternativo da chave. O arquivo `.env` é local e não deve ser commitado. Nunca use chave `sb_secret_...` ou `service_role` no aplicativo.

4. Inicie a Web:

   ```powershell
   npm.cmd run web
   ```

   Se variáveis de ambiente ou configurações foram alteradas enquanto o servidor estava rodando, pare-o com `Ctrl+C` e limpe o cache ao reiniciar:

   ```powershell
   npx.cmd expo start -c --web
   ```

   No PowerShell, use `npm.cmd`/`npx.cmd` se a política de execução bloquear os scripts `.ps1`.

5. Para Android, execute `npm.cmd start` e abra o QR code com Expo Go. O computador e o dispositivo precisam conseguir se comunicar pela rede. Se houver problemas de conexão, tente o modo tunnel do Expo.

## 2. Variantes de dados

`EXPO_PUBLIC_DATA_SOURCE` seleciona a origem dos anúncios quando o app inicia:

- `demo`: usa registros mantidos em memória por `DemoAnimalRepository`. Não precisa de credenciais; alterações feitas durante a execução desaparecem ao reiniciar.
- `supabase`: usa o cliente configurado em `src/lib/supabase/client.ts` e as tabelas do projeto apontado pelas variáveis locais. A lista pública consulta anúncios com `status = 'available'`.

O Supabase configurado no `.env` é o ambiente real para esse clone. Não execute `db reset`, não remova tabelas e não rode migrations novamente sem confirmar o estado remoto. Para validar leitura, use uma linha de teste identificável e remova apenas essa linha depois, se desejado.

## 3. Estrutura do código e fluxo

```text
src/
├── app/                         # Rotas e telas do Expo Router
│   ├── animals/                 # Lista, detalhes e formulário de cadastro
│   ├── auth/                    # Cadastro, login, confirmação e callback
│   └── account.tsx              # Perfil e sessão
├── components/                  # Componentes visuais reutilizados
├── features/
│   ├── animals/
│   │   ├── hooks/               # Queries e mutations do TanStack Query
│   │   ├── repositories/        # Adaptadores de dados demo e Supabase
│   │   ├── schemas/             # Regras de validação de entradas
│   │   ├── services/            # Regras/casos de uso de animais
│   │   ├── repository.ts        # Seleção do repositório pela variável de ambiente
│   │   └── types.ts             # Tipos de domínio de animais
│   └── auth/                    # Contexto, tipos, schemas e repositórios de autenticação
└── lib/supabase/                # Cliente Supabase e tipos do banco

supabase/migrations/             # SQL versionado para tabelas, índices e RLS
Documentos/                      # Requisitos, arquitetura e design
```

### Fluxo de leitura da lista

1. `src/app/animals/index.tsx` exibe a tela e chama `useAnimals`.
2. `src/features/animals/hooks/useAnimals.ts` consulta o serviço usando TanStack Query.
3. `src/features/animals/services/animal.service.ts` encaminha a operação de domínio.
4. `src/features/animals/repository.ts` escolhe demo ou Supabase com base em `EXPO_PUBLIC_DATA_SOURCE`.
5. `DemoAnimalRepository` lê os dados locais; `SupabaseAnimalRepository` consulta `public.animals`, filtra `available` e converte o formato SQL para o tipo `Animal`.
6. A tela apresenta carregamento, erro, estado vazio ou os cartões recebidos.

O detalhe segue o mesmo caminho, usando `useAnimal(id)` e a consulta por identificador. A criação usa o hook de mutation e o repositório selecionado. No Supabase, o repositório obtém o usuário autenticado para preencher `owner_id`; as policies do banco continuam sendo a autoridade final sobre o que cada conta pode alterar.

### Fluxo de autenticação

`src/app/_layout.tsx` instala `AuthProvider` e `QueryClientProvider` ao redor das telas. `AuthProvider` mantém/restaura a sessão Supabase e carrega o perfil; os repositórios de `src/features/auth/repositories/` isolam as chamadas de Auth e de `profiles`. O cliente é compartilhado e mantém a sessão no armazenamento configurado.

O cadastro cria a conta e envia metadados do perfil. A migration de autenticação cria o registro correspondente em `public.profiles` por trigger. O fluxo de confirmação depende das URLs de callback configuradas em **Authentication → URL Configuration** no painel Supabase. Na Web, o cliente processa a sessão retornada no fragmento da URL; em plataformas nativas, o callback aceita `code` (PKCE) ou `token_hash`.

## 4. Banco de dados e migrations

As migrations são aplicadas em ordem cronológica:

- `20261001000000_create_animals.sql`: tabela `public.animals`, restrições, índice e policies RLS.
- `20261007000000_create_profiles_and_auth.sql`: tabela `public.profiles`, trigger de perfil e policies que restringem escrita de anúncios a doadores/ONGs autenticados.

Colunas atuais de `public.animals`:

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | `uuid` | Chave primária; padrão `gen_random_uuid()`. |
| `owner_id` | `uuid` | Obrigatório; referencia `auth.users(id)`. |
| `name` | `text` | Obrigatório; 2–80 caracteres. |
| `species` | `text` | `cachorro`, `gato` ou `outro`. |
| `breed` | `text` | Opcional; até 60 caracteres. |
| `age_months` | `integer` | Obrigatório; 0–600. |
| `size` | `text` | `pequeno`, `medio` ou `grande`. |
| `health_status` | `text` | `saudavel`, `em_tratamento` ou `nao_informado`. |
| `description` | `text` | Obrigatório; 10–1000 caracteres. |
| `status` | `text` | `available` ou `adopted`; padrão `available`. |
| `created_at` | `timestamptz` | Padrão `now()`. |

As colunas `id`, `status` e `created_at` têm padrões no banco e podem ser omitidas em um insert. `owner_id` não pode ser um UUID inventado: deve corresponder a um usuário Supabase existente. Para inserir pelo aplicativo, a conta também precisa estar autenticada e ser do tipo `doador_ong`.

## 5. Inserir um anúncio de teste

Para validar se a listagem conectada ao Supabase lê a tabela, crie primeiro uma conta de teste do tipo doador/ONG e confirme o e-mail. No Table Editor, copie o `id` dessa conta na tabela `profiles`. No SQL Editor do projeto, execute este insert substituindo somente `UUID_DO_PERFIL_Doador` pelo UUID real:

```sql
insert into public.animals (
  id,
  owner_id,
  name,
  species,
  breed,
  age_months,
  size,
  health_status,
  description,
  status,
  created_at
)
values (
  gen_random_uuid(),
  'UUID_DO_PERFIL_Doador',
  'Bidu',
  'cachorro',
  'SRD',
  24,
  'medio',
  'saudavel',
  'Bidu é carinhoso, sociável e procura uma família responsável.',
  'available',
  now()
)
returning *;
```

Depois, atualize a tela **Adotar um animal**. O registro deve aparecer como Bidu. Se ele aparecer no Table Editor mas não no app, confira que `status` está como `available`, que o `.env` aponta para o mesmo projeto aberto no painel, e veja se a tela apresentou uma mensagem de erro em vez do estado vazio.

O SQL Editor usa privilégios administrativos; esse insert valida a leitura pública, mas **não** valida as permissões de escrita do app nem as policies RLS. Não use um UUID arbitrário para `owner_id`. O insert cria um registro persistente no projeto de produção; depois do teste, localize apenas o Bidu de teste pelo `id` retornado e exclua somente essa linha, se desejar.

## 6. Como validar mudanças

### Verificação estática

```powershell
npm.cmd run typecheck
```

O `package.json` não define atualmente um script de testes automatizados. Não reporte `typecheck` como teste funcional: ele verifica os tipos TypeScript, não autenticação, RLS ou comportamento em tempo de execução.

### Verificação manual sugerida

1. Com `EXPO_PUBLIC_DATA_SOURCE=demo`, abra a página inicial, liste os três animais de demonstração e acesse um detalhe.
2. Com Supabase configurado, confirme que a lista reflete linhas com status `available` no projeto indicado pelo `.env`.
3. Teste cadastro, confirmação de e-mail, login, restauração da sessão e logout com contas de teste.
4. Teste o cadastro de animal por uma conta do tipo doador/ONG; confirme que adotante e usuário anônimo não conseguem gravar anúncios.
5. Verifique erro de rede, lista vazia e validação de formulário. Confira Web e Android para qualquer mudança de interface.
6. Antes de alterar policies ou esquema, leia as migrations e planeje uma migration nova. Nunca edite/aplique novamente uma migration já executada na produção sem uma estratégia explícita.

Ao fazer uma mudança, siga o fluxo completo: atualizar requisito se o comportamento mudou, ajustar tipo/schema, implementar o caso de uso e o repositório, ligar à tela, validar com `typecheck` e executar os passos manuais afetados.

## 7. Limites conhecidos da implementação

O código atual já tem lista, detalhe, cadastro básico, autenticação, perfil e conexão inicial com Supabase. Isso não significa que o MVP esteja completo. Ainda precisam ser implementados, conforme o [escopo do MVP](../Produto/escopo-mvp.md), filtros e campos de localização, fotos no Storage, gestão dos próprios anúncios, contato via WhatsApp com proteção de telefone, e validação abrangente de RLS e dos fluxos Web/Android.
