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

1. `src/app/animals/index.tsx` exibe a tela, mantém os filtros em edição e aplica-os quando a pessoa toca em **Buscar animais**.
2. `src/features/animals/hooks/useAnimals.ts` inclui os filtros na chave de cache do TanStack Query e consulta o serviço.
3. `src/features/animals/services/animal.service.ts` encaminha os filtros ao repositório.
4. `src/features/animals/repository.ts` escolhe demo ou Supabase com base em `EXPO_PUBLIC_DATA_SOURCE`.
5. `DemoAnimalRepository` aplica os filtros localmente; `SupabaseAnimalRepository` filtra os anúncios `available` no banco: espécie e porte por igualdade, cidade por correspondência parcial sem diferenciar maiúsculas/minúsculas, e estado por UF exata normalizada em maiúsculas.
6. A tela apresenta carregamento, erro, estado vazio (com mensagem específica quando filtros não encontram resultados) ou os cartões recebidos.

Quando a sessão possui cidade ou UF no perfil e nenhum filtro manual de localização foi aplicado, `src/app/animals/index.tsx` prioriza visualmente anúncios da mesma cidade e, em seguida, da mesma UF. Os demais anúncios continuam disponíveis; a regra não usa GPS nem solicita nova permissão ao dispositivo.

O detalhe segue o mesmo caminho, usando `useAnimal(id)` e a consulta por identificador. A criação usa o hook de mutation e o repositório selecionado. No Supabase, o repositório obtém o usuário autenticado para preencher `owner_id`; as policies do banco continuam sendo a autoridade final sobre o que cada conta pode alterar.

O contato do responsável aparece somente no detalhe do anúncio, nunca nos cards da lista de busca ou de gerenciamento. A consulta da lista não chama a função de contato e não lê `profiles`. No Supabase, ao abrir um detalhe, o repositório só busca contato quando há sessão e chama `get_animal_contacts`, que retorna apenas nome e telefone associados aos IDs solicitados de anúncios ainda disponíveis. A função é `SECURITY DEFINER`, mas verifica a sessão, limita os resultados aos anúncios `available` e tem execução concedida apenas ao papel `authenticated`. A tabela `profiles` continua legível somente pelo próprio titular. O componente de contato também esconde os dados quando não há sessão, inclusive se houver dados de consulta em cache, oferece links `tel:` e **Conversar pelo WhatsApp**, e informa claramente falhas ao abrir os destinos. Na Web, o botão abre diretamente `web.whatsapp.com/send`; no Android, tenta o esquema do aplicativo e depois o endereço web. Em modo demo, o nome é demonstrativo e não há telefone real.

### Área do doador/ONG

Em **Minha conta**, perfis `doador_ong` acessam **Gerenciar meus anúncios** (`src/app/animals/manage.tsx`). A tela consulta somente os anúncios da sessão atual com `listMine`, oferece edição pelo formulário compartilhado (`/animals/new?animalId=...`) e alterna o status entre `available` e `adopted`. A policy RLS no Supabase continua garantindo que somente o proprietário possa consultar/alterar seus registros; a filtragem por `owner_id` no repositório não substitui essa proteção. Ao editar fotos, arquivos mantidos permanecem no Storage, novos arquivos são enviados antes de salvar e arquivos removidos são excluídos após o banco confirmar a atualização.

### Fluxo de autenticação

`src/app/_layout.tsx` instala `AuthProvider` e `QueryClientProvider` ao redor das telas. `AuthProvider` mantém/restaura a sessão Supabase e carrega o perfil; os repositórios de `src/features/auth/repositories/` isolam as chamadas de Auth e de `profiles`. O cliente é compartilhado e mantém a sessão no armazenamento configurado.

O cadastro cria a conta e envia metadados do perfil. A migration de autenticação cria o registro correspondente em `public.profiles` por trigger. O fluxo de confirmação depende das URLs de callback configuradas em **Authentication → URL Configuration** no painel Supabase. Na Web, o cliente processa a sessão retornada no fragmento da URL; em plataformas nativas, o callback aceita `code` (PKCE) ou `token_hash`.

Em **Minha conta**, a seção **Editar perfil** permite alterar nome, telefone, cidade, UF e biografia opcional. A tela começa em modo de visualização e só mostra o formulário após **Editar perfil**; **Cancelar** descarta alterações locais. Nome e cidade aceitam apenas letras, espaços e hífen/apóstrofo, a UF aceita duas letras e o telefone usa máscara brasileira `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX`, sendo salvo no banco somente como dígitos. O botão salva somente o registro do usuário autenticado. A biografia e a localização do doador/ONG aparecem no detalhe do anúncio junto ao contato, nunca na lista pública; o telefone continua protegido pela função controlada de contatos.

## 4. Banco de dados e migrations

As migrations são aplicadas em ordem cronológica:

- `20261001000000_create_animals.sql`: tabela `public.animals`, restrições, índice e policies RLS.
- `20261007000000_create_profiles_and_auth.sql`: tabela `public.profiles`, trigger de perfil e policies que restringem escrita de anúncios a doadores/ONGs autenticados.
- `20261021000000_add_animal_location.sql`: adiciona `city` e `state` e valida os valores quando informados.
- `20261021000001_add_animal_photos_storage.sql`: adiciona os caminhos de fotos, valida até cinco fotos e configura o bucket público `animal-photos` com leitura pública e upload/exclusão apenas por doadores autenticados.
- `20261025000000_add_controlled_animal_contacts.sql`: disponibiliza nome e telefone do responsável por anúncios disponíveis somente a usuários autenticados, sem ampliar o acesso RLS à tabela `profiles`.
- `20261027000000_add_profile_details.sql`: adiciona cidade, UF e biografia opcional ao perfil, mantendo a edição restrita ao próprio usuário.

Para atualizar um banco já existente, aplique as migrations pendentes em ordem, uma vez cada. Se a migration de localização ainda não foi aplicada, execute-a antes da migration de fotos. Não execute novamente migrations já aplicadas nem use reset. As colunas `city`/`state` e `photo_paths` preservam os anúncios existentes: registros antigos ficam sem localização e com lista de fotos vazia; os novos anúncios enviados pelo app exigem cidade, UF e ao menos uma foto.

Para habilitar os dados de contato, aplique também a migration de contatos uma única vez depois das migrations de animais e perfis. Sem ela, os dados de contato não serão carregados e a tela informará a falha; não altere as permissões de `profiles` para contornar o erro.

Colunas atuais de `public.animals`:

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | `uuid` | Chave primária; padrão `gen_random_uuid()`. |
| `owner_id` | `uuid` | Obrigatório; referencia `auth.users(id)`. |
| `name` | `text` | Obrigatório; 2–80 caracteres. |
| `species` | `text` | `cachorro`, `gato` ou `outro`. |
| `breed` | `text` | Opcional; até 60 caracteres. |
| `city` | `text` | Nulo para anúncios anteriores; novos anúncios exigem 2–80 caracteres. |
| `state` | `text` | Nulo para anúncios anteriores; novos anúncios exigem uma UF brasileira válida em maiúsculas. |
| `photo_paths` | `text[]` | Caminhos no bucket público `animal-photos`; novos anúncios exigem 1–5 arquivos. Anúncios anteriores podem permanecer vazios. |
| `age_months` | `integer` | Obrigatório; 0–600. |
| `size` | `text` | `pequeno`, `medio` ou `grande`. |
| `health_status` | `text` | `saudavel`, `em_tratamento` ou `nao_informado`. |
| `description` | `text` | Obrigatório; 10–1000 caracteres. |
| `status` | `text` | `available` ou `adopted`; padrão `available`. |
| `created_at` | `timestamptz` | Padrão `now()`. |

As colunas `id`, `status` e `created_at` têm padrões no banco e podem ser omitidas em um insert. `owner_id` não pode ser um UUID inventado: deve corresponder a um usuário Supabase existente. Para inserir pelo aplicativo, a conta também precisa estar autenticada e ser do tipo `doador_ong`.

## 5. Inserir um anúncio de teste

Para validar o fluxo completo após aplicar as migrations pendentes, use o formulário do app com uma conta de teste autenticada do tipo doador/ONG. Selecione de uma a cinco fotos e preencha os outros campos obrigatórios; o app rejeita arquivos acima de 5 MB antes da compressão, reduz as imagens para JPEG (máximo 5 MB por arquivo após compressão) e envia ao Storage antes de gravar o anúncio. Se o insert falhar depois do upload, o app tenta remover os arquivos recém-enviados e apresenta eventual falha de limpeza.

Após publicar, o anúncio deve aparecer na lista, a foto principal no cartão e todas as fotos no detalhe. No painel, confira a linha em `public.animals` e os arquivos em **Storage → animal-photos**. O bucket é público para que visitantes vejam imagens dos anúncios; nunca envie imagens privadas ou dados pessoais. Upload e exclusão de objetos são limitados por policy ao diretório do usuário e ao perfil doador/ONG.

## 6. Como validar mudanças

### Verificação estática

```powershell
npm.cmd run typecheck
```

O script `npm test` executa os testes unitários em `tests/` com Vitest. Eles cobrem formatadores e validações de perfil/cadastro, filtros do repositório demo e regras de quantidade/tamanho de fotos. Não reporte `typecheck` como teste funcional: ele verifica os tipos TypeScript, não autenticação, RLS ou comportamento em tempo de execução. Os testes unitários também não substituem a validação das policies RLS no Supabase.

Para validar as policies RLS no projeto Supabase, use `npm.cmd run test:rls` com duas contas de teste confirmadas e um anúncio disponível. Configure no ambiente, sem gravar no repositório:

```powershell
$env:SUPABASE_RLS_URL = "https://SEU-PROJETO.supabase.co"
$env:SUPABASE_RLS_KEY = "sb_publishable_SUA_CHAVE"
$env:SUPABASE_RLS_OWNER_EMAIL = "doador-teste@example.com"
$env:SUPABASE_RLS_OWNER_PASSWORD = "SENHA_DA_CONTA"
$env:SUPABASE_RLS_OTHER_EMAIL = "adotante-teste@example.com"
$env:SUPABASE_RLS_OTHER_PASSWORD = "SENHA_DA_CONTA"
$env:SUPABASE_RLS_ANIMAL_ID = "UUID_DE_UM_ANUNCIO_AVAILABLE"
npm.cmd run test:rls
```

O teste verifica leitura do próprio perfil, bloqueio de leitura direta de outro perfil, acesso ao contato somente pela função controlada e bloqueio de inserção de anúncio por uma conta adotante. Ele não usa `service_role`, não cria contas e não executa `db reset`.

### Verificação manual sugerida

1. Com `EXPO_PUBLIC_DATA_SOURCE=demo`, abra a página inicial, liste os três animais de demonstração e acesse um detalhe.
2. Com Supabase configurado, confirme que a lista reflete linhas com status `available` no projeto indicado pelo `.env`.
3. Teste cadastro, confirmação de e-mail, login, restauração da sessão e logout com contas de teste.
4. Teste o cadastro de animal por uma conta do tipo doador/ONG: sem fotos, com seis fotos e com uma foto acima de 5 MB o formulário deve impedir a publicação; com uma a cinco fotos válidas deve comprimir, enviar e publicar. Confirme que adotante e usuário anônimo não conseguem gravar anúncios nem enviar fotos.
5. Teste filtros individualmente e combinados para espécie, porte, cidade parcial (por exemplo, `Camp` encontra `Campinas`) e UF; confira também limpar filtros, lista sem resultados, anúncios antigos sem localização e diferenças de maiúsculas/minúsculas no nome da cidade.
6. Na área de gerenciamento, confirme que o doador vê apenas seus anúncios, consegue alterar campos e fotos, marcar um anúncio como adotado (ele sai da lista pública) e reabri-lo. Confira também que outra conta não consegue editar nem trocar status desse anúncio.
7. Verifique erro de rede, lista vazia e validação de formulário. Confira Web e Android para qualquer mudança de interface.
8. Antes de alterar policies ou esquema, leia as migrations e planeje uma migration nova. Nunca edite/aplique novamente uma migration já executada na produção sem uma estratégia explícita.

Ao fazer uma mudança, siga o fluxo completo: atualizar requisito se o comportamento mudou, ajustar tipo/schema, implementar o caso de uso e o repositório, ligar à tela, validar com `typecheck` e executar os passos manuais afetados.

## 7. Limites conhecidos da implementação

O código atual já tem lista com filtros, detalhe, cadastro/edição de anúncios com cidade/UF e fotos, área de gestão de anúncios, autenticação, perfil, integração com Supabase e exibição controlada do contato telefônico e WhatsApp para usuários autenticados. A área do doador permite listar os próprios anúncios, editar dados/fotos, marcar como adotado e reabrir. Ainda é necessário testar a proteção dos dados com sessões anônimas e autenticadas e validar os fluxos Web/Android.
