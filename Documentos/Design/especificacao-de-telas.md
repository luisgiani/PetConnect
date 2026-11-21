# Especificação de telas do MVP

Este documento detalha o conteúdo e os estados das telas representadas no [fluxo visual do MVP](fluxo-mvp.svg). O escopo funcional e os critérios de aceite completos estão em [escopo-mvp.md](../Produto/escopo-mvp.md).

## Regras de apresentação

- O mesmo fluxo funcional deve atender Android e Web responsiva.
- Usar navegação adequada a cada formato sem acrescentar funcionalidades exclusivas fora do escopo.
- Não incluir Chat, Meus Chats, Meus Interesses ou ações de favoritar/salvar.
- Login é obrigatório para acessar a área principal, a lista e os detalhes dos animais. Sem sessão, encaminhar para entrar ou criar conta.
- Login, cadastro e confirmação de e-mail permanecem acessíveis sem sessão.
- Após autenticar, abrir a tela principal correspondente ao perfil; não exibir controles de voltar ou Início nela.
- Exibir estados claros de carregamento, vazio, erro, validação e sucesso.

## Telas

### Acesso principal por perfil

- **Adotante:** após autenticar, abre a lista de animais. Não mostrar ações ou rotas de cadastro e gerenciamento de anúncios.
- **Doador/ONG:** após autenticar, abre **Meus anúncios**; mostrar somente anúncios próprios. Sem anúncios, apresentar a ação para cadastrar o primeiro. Não abrir a lista geral de adoção.
- Ambos os perfis podem acessar **Minha conta** pelo cabeçalho.

### 1. Entrada no app

- Apresentar a marca e o propósito do PetConnect.
- Sem sessão, encaminhar para login ou cadastro.
- Após autenticar, direcionar para a tela principal correspondente ao perfil.

### 2. Lista de animais

- Mostrar somente anúncios disponíveis.
- Filtrar por espécie, porte, cidade e estado.
- Quando a pessoa estiver autenticada e tiver cidade/UF no perfil, ordenar primeiro anúncios da mesma cidade, depois anúncios da mesma UF; sem localização, manter a lista completa na ordem padrão.
- Apresentar os anúncios em feed vertical, priorizando uma foto grande. Abaixo da foto, mostrar espécie, nome, idade, porte, localização e uma prévia da descrição, com acesso aos detalhes.
- Se houver mais fotos, indicar a quantidade no card; a galeria completa permanece nos detalhes do anúncio.
- Cada card mostra somente as informações do animal. O contato do responsável não aparece nesta tela.
- Incluir estados de carregamento, lista vazia e erro com ação de tentar novamente.

### 3. Detalhes do animal

- Apresentar a galeria em destaque no topo, com uma foto por vez, setas anterior/próxima e indicador da posição. Abaixo, mostrar nome e localização, informações principais em cartões e depois a descrição.
- Mostrar nome e telefone do responsável somente com sessão autenticada; o telefone abre o aplicativo de chamadas quando selecionado.
- Sem sessão, orientar a pessoa a entrar para visualizar os dados de contato.
- Nunca incluir telefone na consulta pública de animais nem permitir leitura pública de perfis.

### 4. Entrar e criar conta

- Oferecer autenticação por e-mail e senha.
- No cadastro, permitir selecionar **Adotante** ou **Doador/ONG**.
- Exigir confirmação de e-mail e explicar como prosseguir.
- Exibir erros, carregamento e estado de confirmação pendente.

### 5. Completar perfil

- Solicitar nome e os dados necessários ao perfil.
- Permitir editar nome, telefone, cidade, UF e biografia opcional.
- Para Doador/ONG, coletar telefone para contato.
- Exibir cidade, UF e biografia do responsável no detalhe dos anúncios dele.
- Oferecer edição dos dados e encerramento da sessão.

### 6. Área do doador/ONG

- Listar somente anúncios pertencentes à conta autenticada.
- Mostrar o estado de cada anúncio.
- Permitir cadastrar, editar e encerrar/marcar como adotado os próprios anúncios.
- Permitir reabrir um anúncio marcado como adotado.
- Não oferecer administração de registros de outras contas.

### 7. Cadastro e edição de animal

- Campos: nome, espécie, raça, idade, porte, estado de saúde, descrição, cidade e estado.
- Permitir de uma a cinco fotos; exigir ao menos uma para publicar.
- Rejeitar arquivos acima de 5 MB antes da compressão e comunicar erro de formato ou tamanho.
- Após a publicação, confirmar o sucesso e fornecer acesso ao detalhe ou à área do responsável.

### 8. Contato do responsável

- Disponibilizar nome e telefone somente na tela de detalhes do anúncio e para usuário autenticado.
- Obter os dados por função controlada no banco, limitada aos anúncios disponíveis; não abrir a leitura pública de `profiles`.
- Exibir um link de telefone para iniciar uma chamada no dispositivo.
- Exibir o botão **Conversar pelo WhatsApp**, com mensagem inicial preenchida; usar o WhatsApp no Android e o WhatsApp Web/navegador na Web.
- Informar claramente quando nenhum dos destinos puder ser aberto.

## Fluxos

**Adotante:** Abrir app → Entrar/criar conta → Lista e filtros → Detalhes → telefone/WhatsApp do responsável.

**Doador/ONG:** Criar conta → Confirmar e-mail → Completar perfil → Área do doador/ONG → Cadastrar com ao menos uma foto → Publicar → Editar ou encerrar.
