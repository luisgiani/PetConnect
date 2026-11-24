# PetConnect — Escopo acordado do MVP

Este documento registra as decisões de escopo e é a fonte de verdade para o produto. Consulte o [índice da documentação](../README.md) e a [arquitetura técnica](../Arquitetura/arquitetura-tecnica.md).

## Objetivo

Entregar uma aplicação que permita encontrar animais disponíveis para adoção e facilitar o contato com seus responsáveis, além de permitir que pessoas doadoras e ONGs publiquem e administrem anúncios.

## Público e plataformas

- **Adotante:** pode navegar publicamente; precisa criar conta para ver o contato do responsável.
- **Doador/ONG:** cria conta e perfil para publicar, editar e encerrar anúncios.
- **Plataformas do MVP:** Android e Web (computador).
- **Fora das plataformas do MVP:** publicação ou certificação para iOS.

## Funcionalidades incluídas

| Área | Escopo |
| --- | --- |
| Acesso | Exigir sessão autenticada para entrar na área principal do app e acessar animais, perfil e anúncios. Visitantes podem acessar somente login, cadastro e confirmação de e-mail. |
| Descoberta | Usuários autenticados podem listar animais disponíveis e abrir detalhes. |
| Busca | Usuários autenticados podem filtrar por espécie, porte, cidade e estado. |
| Contas | Cadastro, login, confirmação de e-mail obrigatória, sessão persistente e perfil do tipo adotante ou doador/ONG. As contas de demonstração devem estar confirmadas antes da apresentação. |
| Favoritos | Usuários autenticados podem salvar anúncios em uma lista local de favoritos e removê-los. |
| Publicação | Doador/ONG autenticado pode cadastrar e editar anúncios e marcá-los como adotados/encerrados. |
| Fotos | Exigir ao menos uma foto e permitir no máximo cinco por anúncio; limite de 5 MB por arquivo antes da compressão; armazenar no Supabase Storage. |
| Contato | Usuário autenticado pode ver o nome e telefone do responsável somente nos detalhes de anúncios disponíveis; pode iniciar uma chamada ou conversa pelo WhatsApp. |
| Segurança | Rotas principais exigem sessão. RLS no banco: somente o responsável pode administrar seus anúncios; nome e telefone não são expostos por consultas públicas de perfil. |

Os filtros são aplicados à lista de animais disponíveis. Cidade e estado passam a fazer parte dos dados do anúncio e devem ser validados e persistidos.

## Ordem sugerida das telas

1. **Acesso:** sem sessão, abrir login; permitir criar conta e confirmar e-mail.
2. **Lista de animais:** tela principal após autenticação; mostrar anúncios disponíveis e filtros por espécie, porte, cidade e estado.
3. **Detalhes do animal:** exibir informações e fotos; exibir contato do responsável somente após autenticação.
4. **Entrar / criar conta:** autenticar adotantes e doadores/ONGs; o cadastro exige confirmação de e-mail.
5. **Completar perfil:** coletar nome, tipo de perfil e, para doador/ONG, telefone para contato.
6. **Área do doador/ONG:** listar anúncios próprios e oferecer publicação, edição e encerramento.
7. **Cadastrar / editar animal:** coletar dados do anúncio e até cinco fotos; exigir pelo menos uma foto para publicar.
8. **Contato:** disponibilizar nome e telefone do responsável somente na tela de detalhes, para usuário autenticado e quando o anúncio estiver disponível.

Em telas pequenas, a navegação pode usar abas ou menu equivalente e deve incluir a área de favoritos. Não deve incluir chat interno ou registro formal de interesse no MVP. Na Web, as mesmas ações devem funcionar em layout responsivo para computador.

## Funcionalidades fora do MVP

- Registro de intenção de adoção, interesse formal ou acompanhamento posterior ao contato.
- Chat interno e mensagens em tempo real.
- Notificações, recomendações automáticas e processo formal de acompanhamento da adoção.
- Denúncias, moderação e verificação de identidade de usuários.
- Publicação em lojas de aplicativos.

Esses itens só entram em uma etapa posterior se houver decisão explícita de ampliar o escopo.

## Fluxos principais

### Adotante

1. Abre o app e entra ou cria uma conta; após autenticar, consulta a lista de animais.
2. Pesquisa por espécie, porte e localização.
3. Abre os detalhes do animal.
4. Consulta o nome e o telefone do responsável; pode iniciar uma chamada ou tocar em **Conversar pelo WhatsApp**.
5. Pode salvar ou remover anúncios favoritos e consultar a área **Salvos**.
6. Não tem acesso à publicação ou ao gerenciamento de anúncios.

Não há registro formal de intenção de adoção. Os favoritos são somente uma lista local para facilitar o acompanhamento visual dos anúncios.

### Doador/ONG

1. Cria uma conta e completa o perfil como doador/ONG, incluindo telefone.
2. Após autenticar, acessa somente sua área de anúncios; não navega pela lista geral de adoção.
3. Se ainda não tiver anúncios, a área apresenta a ação para cadastrar o primeiro animal.
4. Preenche os dados do animal, informa cidade e estado, e adiciona pelo menos uma foto.
5. Publica o anúncio, podendo depois editá-lo ou marcá-lo como adotado/encerrado.

## Critérios de aceite do MVP

O MVP só será considerado concluído quando:

1. Uma pessoa sem sessão ser encaminhada ao login e uma pessoa autenticada conseguir listar animais, filtrar e abrir detalhes na Web e no Android.
2. Cadastro, login, encerramento de sessão, restauração da sessão e proteção de rotas funcionarem nas plataformas incluídas.
3. Uma conta autenticada conseguir ver nome e telefone nos anúncios disponíveis e iniciar uma chamada ou conversa pelo WhatsApp, sem leitura direta de perfis de outras pessoas.
4. Uma conta do tipo doador/ONG conseguir publicar um anúncio com os campos obrigatórios e pelo menos uma foto.
5. Um anúncio aceitar no máximo cinco imagens, rejeitar arquivos acima de 5 MB antes da compressão e exigir ao menos uma imagem para publicação.
6. O responsável conseguir editar e encerrar seu anúncio; outra conta não conseguir alterá-lo, mesmo tentando acessar diretamente o Supabase.
7. Anúncios encerrados não aparecerem na listagem de animais disponíveis.
8. O cadastro exigir confirmação de e-mail, e as contas de demonstração estarem confirmadas antes da apresentação.
9. Erros, carregamento, lista vazia, formulário inválido e falhas de upload apresentarem estados compreensíveis.
10. As migrations e políticas RLS necessárias estiverem versionadas e testadas com sessão anônima e autenticada.
11. Uma conta autenticada conseguir salvar e remover favoritos e consultar somente seus anúncios ainda disponíveis na área **Salvos**.

## Decisões ainda necessárias antes de implementar as áreas correspondentes

Estas decisões não mudam o escopo funcional, mas precisam ser registradas durante o refinamento:

- Quais campos do anúncio são obrigatórios além de nome, espécie, idade, porte, saúde, descrição, cidade e estado.
- Formatos de imagem aceitos e qualidade/limite final depois da compressão.
- O acesso aos dados de contato é restrito a usuários autenticados e anúncios disponíveis; a migration `20261025000000_add_controlled_animal_contacts.sql` implementa esse acesso por função controlada.
- Quais estados e cidades serão usados nos dados de teste e como será feita a seleção de localização.

## Alinhamento dos materiais existentes

- **Pré-projeto:** [pre-projeto-mvp.docx](pre-projeto-mvp.docx) e [pre-projeto-mvp.md](pre-projeto-mvp.md) refletem as plataformas, autenticação, filtros, favoritos, fotos, contato e segurança acordados.
- **Protótipo:** [fluxo-mvp.svg](../Design/fluxo-mvp.svg) apresenta o fluxo acordado com autenticação, localização, favoritos locais e gestão de anúncios. Chat e registro formal de interesse não fazem parte deste desenho. O desenho anterior permanece em [Arquivo/](../Arquivo/).
- **Código/README:** a base já contém lista com filtros por espécie, porte, cidade e estado, busca textual, detalhes, favoritos locais, cadastro/edição e gerenciamento de estado dos próprios anúncios, fotos, autenticação/perfil, contato protegido e integração com Supabase. A migration controlada de contato deve permanecer aplicada no banco utilizado. A ordem acima descreve o fluxo-alvo, não funcionalidades já concluídas. Para estado técnico e instruções de validação, consulte o [guia de desenvolvimento](../Arquitetura/guia-desenvolvedor.md).

## Regra para mudanças de escopo

Qualquer funcionalidade nova deve ter objetivo, plataforma, regra de acesso e critério de aceite registrados antes de começar a implementação. Se uma decisão mudar, atualizar este documento, o pré-projeto, o protótipo e a arquitetura para evitar divergências.
