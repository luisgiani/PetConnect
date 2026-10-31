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
   EXPO_PUBLIC_SUPABASE_URL=
   EXPO_PUBLIC_SUPABASE_KEY=
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
│   ├── auth/                     # Cadastro, login, confirmação de e-mail
│   └── account.tsx               # Conta e encerramento de sessão
├── components/                   # View: elementos reutilizáveis
├── features/animals/
│   ├── hooks/                    # Controller: conecta telas a casos de uso e cache
│   ├── repositories/             # Infraestrutura: acesso a dados (demo ou Supabase)
│   ├── services/                 # Model/domínio: regras e casos de uso
│   ├── schemas/                  # Validação compartilhada dos dados de entrada
│   └── types.ts                  # Model/domínio: entidades e contratos
├── features/auth/                # Sessão, autenticação e leitura de perfil
└── lib/                          # Configuração de bibliotecas externas
supabase/
└── migrations/                   # Esquema do banco e políticas RLS versionados
```

O fluxo principal é **View (tela) → Controller (hook) → Service (regra de negócio) → Repository (dados)**. A tela não acessa o banco diretamente. Os serviços e repositórios podem ser testados sem depender da interface.

## Conectar ao Supabase

1. Em um projeto Supabase novo, aplique as migrations de `supabase/migrations/` na ordem cronológica. Para um projeto já configurado, confirme que as tabelas e políticas correspondentes existem; **não execute de novo** scripts de migration sobre a produção.
2. Copie as credenciais do projeto para o `.env` local:

   ```text
   EXPO_PUBLIC_DATA_SOURCE=supabase
   EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_SUA_CHAVE_PUBLICA
   ```

   No painel, obtenha a Project URL e a chave Publishable. O modal Connect mostra exemplos para diferentes frameworks; os exemplos `NEXT_PUBLIC_*` e a instalação de `@supabase/ssr` são específicos de Next.js e não devem ser copiados para este app Expo. Use a Project URL em `EXPO_PUBLIC_SUPABASE_URL` e a Publishable Key (`sb_publishable_...`) em `EXPO_PUBLIC_SUPABASE_KEY`. O código também aceita `EXPO_PUBLIC_SUPABASE_ANON_KEY` para compatibilidade com configurações anteriores. Crie `.env` na raiz do projeto, ao lado de `package.json`; não o versione.

3. Em **Authentication → URL Configuration**, configure o Site URL como `http://localhost:8081` e permita `http://localhost:8081/auth/callback` em Redirect URLs para o teste Web. Para Android/Expo Go, adicione o endereço de callback gerado para o ambiente/dispositivo usado.
4. Em **Authentication → Sign In / Providers → Email**, mantenha o provedor habilitado e a confirmação de e-mail ativa. **Authentication → Emails → Confirm sign up** controla o modelo do e-mail; não configura, por si só, a entrega SMTP.
5. Reinicie o Expo depois de salvar `.env`. Use somente a chave Publishable no app; **nunca coloque uma chave `sb_secret_...` ou `service_role` no cliente**.

O adaptador Supabase já lista, consulta, cadastra animais e envia fotos. As telas iniciais de cadastro, confirmação de e-mail, login e perfil foram implementadas. Em um banco novo, aplique as migrations em ordem; em um banco já configurado, aplique somente migrations pendentes. As migrations de localização e fotos adicionam cidade, estado e Storage sem apagar anúncios existentes. Em `demo`, autenticação real fica indisponível e os anúncios criados ficam apenas em memória. A base ainda não implementa o escopo completo do MVP. Consulte o [guia de desenvolvimento](Documentos/Arquitetura/guia-desenvolvedor.md) para o mapa do código, validação e dados de teste.

## Comandos

- `npm start`: inicia o Expo.
- `npm run web`: inicia no navegador.
- `npm run typecheck`: verifica os tipos TypeScript.
- `npm test`: executa os testes unitários.
- `npm run test:rls`: valida policies RLS com duas contas de teste configuradas no ambiente.

## Próximos passos sugeridos

1. Criar testes automatizados dos serviços, filtros, validações, Storage, edição de perfil, contato e políticas RLS; validar os fluxos em Android/Web.
