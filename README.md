# PetConnect

Base inicial do aplicativo de adoção de animais, construída em TypeScript com React Native e Expo. O MVP tem como alvo Android e Web (incluindo computadores); iOS fica fora da entrega atual.

A documentação foi organizada por assunto. Consulte o [índice de documentos](Documentos/README.md), o [escopo do MVP](Documentos/Produto/escopo-mvp.md), a [arquitetura técnica](Documentos/Arquitetura/arquitetura-tecnica.md), a [especificação das telas](Documentos/Design/especificacao-de-telas.md) e o [protótipo de fluxo](Documentos/Design/fluxo-mvp.svg).

## Começar

1. Instale uma versão LTS do Node.js.
2. Na pasta do projeto, instale as dependências:

   ```bash
   npm install
   ```

3. Crie o arquivo local de configuração copiando `.env.example` para `.env`:

   ```text
   EXPO_PUBLIC_DATA_SOURCE=demo
   ```

   O modo `demo` usa dados em memória e não requer credenciais. Os dados são perdidos ao reiniciar o app.
4. Inicie o projeto:

   ```bash
   npx expo start
   ```

   Use `w` para abrir a versão web ou leia o QR code com o Expo Go no celular.

## Estrutura e responsabilidades (MVC adaptado)

```text
src/
├── app/                          # View: telas e rotas do Expo Router
├── components/                   # View: elementos reutilizáveis
├── features/animals/
│   ├── hooks/                    # Controller: conecta telas a casos de uso e cache
│   ├── repositories/             # Infraestrutura: acesso a dados (demo ou Supabase)
│   ├── services/                 # Model/domínio: regras e casos de uso
│   ├── schemas/                  # Validação compartilhada dos dados de entrada
│   └── types.ts                  # Model/domínio: entidades e contratos
└── lib/                          # Configuração de bibliotecas externas
supabase/
└── migrations/                   # Esquema do banco e políticas RLS versionados
```

O fluxo principal é **View (tela) → Controller (hook) → Service (regra de negócio) → Repository (dados)**. A tela não acessa o banco diretamente. Os serviços e repositórios podem ser testados sem depender da interface.

## Conectar ao Supabase

1. Crie um projeto Supabase e execute os arquivos SQL em `supabase/migrations/` pelo SQL Editor (ou configure a CLI do Supabase).
2. Copie as credenciais do projeto para o `.env` local:

   ```text
   EXPO_PUBLIC_DATA_SOURCE=supabase
   EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
   ```

3. Reinicie o Expo. A chave `anon`/publishable pode ser usada no cliente porque a proteção dos dados é feita por RLS. **Nunca coloque a chave `service_role` no aplicativo.**

O adaptador Supabase já lista, consulta e cadastra animais. O cadastro na fonte Supabase exige uma sessão autenticada; autenticação e perfis são próximos passos do desenvolvimento e ainda não fazem parte desta base. Em `demo`, o fluxo de cadastro pode ser exercitado sem conta. A base atual ainda não implementa o escopo completo do MVP.

## Comandos

- `npm start`: inicia o Expo.
- `npm run web`: inicia no navegador.
- `npm run typecheck`: verifica os tipos TypeScript.

## Próximos passos sugeridos

1. Implementar Supabase Auth com confirmação de e-mail, perfis e proteção de rotas.
2. Evoluir as migrations com cidade/estado e permissões de perfil necessárias ao MVP.
3. Adicionar upload de até cinco fotos por animal, limite de 5 MB por arquivo antes da compressão e validação para exigir foto na publicação.
4. Adicionar filtros por espécie, porte, cidade e estado, gestão dos anúncios do responsável e contato autenticado por WhatsApp.
5. Criar testes dos serviços, validações, Storage e políticas RLS; avaliar chat/favoritos somente após o MVP.
