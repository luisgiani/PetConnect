# PetConnect — Escopo acordado do MVP

Este documento registra as decisões de escopo e é a fonte de verdade para o produto. Consulte o [índice da documentação](../README.md) e a [arquitetura técnica](../Arquitetura/arquitetura-tecnica.md).

## Objetivo

Entregar uma aplicação que permita encontrar animais disponíveis para adoção e facilitar o contato com seus responsáveis, além de permitir que pessoas doadoras e ONGs publiquem e administrem anúncios.

## Público e plataformas

- **Adotante:** pode navegar publicamente; precisa criar conta para iniciar contato pelo WhatsApp.
- **Doador/ONG:** cria conta e perfil para publicar, editar e encerrar anúncios.
- **Plataformas do MVP:** Android e Web (computador).
- **Fora das plataformas do MVP:** publicação ou certificação para iOS.

## Funcionalidades incluídas

| Área | Escopo |
| --- | --- |
| Descoberta | Listar animais disponíveis e abrir detalhes sem conta. |
| Busca | Filtrar por espécie, porte, cidade e estado. |
| Contas | Cadastro, login, confirmação de e-mail obrigatória, sessão persistente e perfil do tipo adotante ou doador/ONG. As contas de demonstração devem estar confirmadas antes da apresentação. |
| Publicação | Doador/ONG autenticado pode cadastrar e editar anúncios e marcá-los como adotados/encerrados. |
| Fotos | Exigir ao menos uma foto e permitir no máximo cinco por anúncio; limite de 5 MB por arquivo antes da compressão; armazenar no Supabase Storage. |
| Contato | Usuário autenticado pode abrir o WhatsApp do responsável a partir do detalhe do animal. |
| Segurança | RLS no banco: somente o responsável pode administrar seus anúncios; dados de contato não devem ser expostos na navegação pública. |

Os filtros são aplicados à lista de animais disponíveis. Cidade e estado passam a fazer parte dos dados do anúncio e devem ser validados e persistidos.

## Ordem sugerida das telas

1. **Início:** apresentar o produto e oferecer ações para buscar animais, entrar ou criar conta.
2. **Lista de animais:** mostrar anúncios disponíveis e filtros por espécie, porte, cidade e estado.
3. **Detalhes do animal:** exibir informações, fotos e ação de contato; pedir login ao tentar contatar sem sessão.
4. **Entrar / criar conta:** autenticar adotantes e doadores/ONGs; o cadastro exige confirmação de e-mail.
5. **Completar perfil:** coletar nome, tipo de perfil e, para doador/ONG, telefone para contato.
6. **Área do doador/ONG:** listar anúncios próprios e oferecer publicação, edição e encerramento.
7. **Cadastrar / editar animal:** coletar dados do anúncio e até cinco fotos; exigir pelo menos uma foto para publicar.
8. **Contato:** abrir o WhatsApp do responsável somente para usuário autenticado, sem disponibilizar telefones na navegação pública.

Em telas pequenas, a navegação pode usar abas ou menu equivalente, mas não deve incluir atalhos de chat interno ou lista de interesses no MVP. Na Web, as mesmas ações devem funcionar em layout responsivo para computador.

## Funcionalidades fora do MVP

- Favoritos, lista de interesses ou registro de intenção de adoção.
- Chat interno e mensagens em tempo real.
- Notificações, recomendações automáticas e processo formal de acompanhamento da adoção.
- Denúncias, moderação e verificação de identidade de usuários.
- Publicação em lojas de aplicativos.

Esses itens só entram em uma etapa posterior se houver decisão explícita de ampliar o escopo.

## Fluxos principais

### Adotante

1. Abre o app e consulta a lista pública de animais.
2. Pesquisa por espécie, porte e localização.
3. Abre os detalhes do animal.
4. Se ainda não estiver autenticado, entra ou cria uma conta do tipo adotante.
5. Usa a ação de contato para abrir o WhatsApp do responsável.

Não há funcionalidade de salvar animais ou consultar uma lista de interesses no MVP.

### Doador/ONG

1. Cria uma conta e completa o perfil como doador/ONG, incluindo telefone.
2. Acessa a área de publicação.
3. Preenche os dados do animal e informa cidade e estado.
4. Adiciona pelo menos uma foto.
5. Publica o anúncio, podendo depois editá-lo ou marcá-lo como adotado/encerrado.

## Critérios de aceite do MVP

O MVP só será considerado concluído quando:

1. Uma pessoa sem conta conseguir listar animais disponíveis, filtrar e abrir detalhes na Web e no Android.
2. Cadastro, login, encerramento de sessão e restauração da sessão funcionarem nas plataformas incluídas.
3. Uma conta adotante autenticada conseguir iniciar o contato por WhatsApp, sem que o telefone fique exposto na lista pública ou nos detalhes para visitantes anônimos.
4. Uma conta do tipo doador/ONG conseguir publicar um anúncio com os campos obrigatórios e pelo menos uma foto.
5. Um anúncio aceitar no máximo cinco imagens, rejeitar arquivos acima de 5 MB antes da compressão e exigir ao menos uma imagem para publicação.
6. O responsável conseguir editar e encerrar seu anúncio; outra conta não conseguir alterá-lo, mesmo tentando acessar diretamente o Supabase.
7. Anúncios encerrados não aparecerem na listagem pública de animais disponíveis.
8. O cadastro exigir confirmação de e-mail, e as contas de demonstração estarem confirmadas antes da apresentação.
9. Erros, carregamento, lista vazia, formulário inválido e falhas de upload apresentarem estados compreensíveis.
10. As migrations e políticas RLS necessárias estiverem versionadas e testadas com sessão anônima e autenticada.

## Decisões ainda necessárias antes de implementar as áreas correspondentes

Estas decisões não mudam o escopo funcional, mas precisam ser registradas durante o refinamento:

- Quais campos do anúncio são obrigatórios além de nome, espécie, idade, porte, saúde, descrição, cidade e estado.
- Formatos de imagem aceitos e qualidade/limite final depois da compressão.
- Como será implementada a consulta controlada do telefone do responsável: deve estar disponível ao usuário autenticado que iniciou contato, mas não em consultas públicas de perfil.
- Quais estados e cidades serão usados nos dados de teste e como será feita a seleção de localização.

## Alinhamento dos materiais existentes

- **Pré-projeto:** [pre-projeto-mvp.docx](pre-projeto-mvp.docx) e [pre-projeto-mvp.md](pre-projeto-mvp.md) refletem as plataformas, autenticação, filtros, fotos, contato e segurança acordados.
- **Protótipo:** [fluxo-mvp.svg](../Design/fluxo-mvp.svg) apresenta o fluxo acordado e substitui chat/interesses por autenticação, localização e gestão de anúncios. O desenho anterior permanece em [Arquivo/](../Arquivo/).
- **Código/README:** a base já apresenta lista, detalhes e cadastro simples, mas ainda não implementa autenticação, filtros por localização, fotos nem gestão de anúncios. A ordem acima descreve o fluxo-alvo, não funcionalidades já concluídas.

## Regra para mudanças de escopo

Qualquer funcionalidade nova deve ter objetivo, plataforma, regra de acesso e critério de aceite registrados antes de começar a implementação. Se uma decisão mudar, atualizar este documento, o pré-projeto, o protótipo e a arquitetura para evitar divergências.
