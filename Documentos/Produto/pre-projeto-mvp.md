# Pré-projeto do TCC — PetConnect

Este texto é a fonte em Markdown da cópia editável [pre-projeto-mvp.docx](pre-projeto-mvp.docx). O escopo funcional e os critérios de aceite completos estão em [escopo-mvp.md](escopo-mvp.md).

## Tema

Desenvolvimento de um aplicativo para Android e Web que facilita a adoção de animais ao conectar pessoas adotantes com doadores e organizações não governamentais (ONGs).

## Problema

A adoção de animais muitas vezes depende de redes sociais ou abrigos, e os animais podem permanecer muito tempo sem um lar. Como tornar o processo de adoção mais rápido e acessível?

## Objetivo geral

Desenvolver o PetConnect para Android e Web, centralizando a divulgação de animais disponíveis para adoção e facilitando o contato entre adotantes e pessoas doadoras ou ONGs.

## Objetivos específicos

- Implementar cadastro e autenticação de usuários, com confirmação de e-mail e perfis de adotante e doador/ONG.
- Permitir que doadores/ONGs publiquem, editem e encerrem anúncios com espécie, idade, raça, porte, saúde, descrição, cidade e estado.
- Disponibilizar uma lista pública de animais com filtros por espécie, porte, cidade e estado.
- Permitir uma a cinco fotos por anúncio, com limite de 5 MB por arquivo antes da compressão, exigindo ao menos uma foto para publicar.
- Permitir que usuários autenticados iniciem contato com o responsável pelo anúncio pelo WhatsApp, sem expor telefone na navegação pública.
- Desenvolver uma interface responsiva e acessível para Android e Web, com validações, estados de erro claros e controle de acesso por RLS.

## Justificativa

Muitas pessoas querem adotar ou doar animais, mas encontram dificuldades para localizar informações e entrar em contato. A centralização dos anúncios pode facilitar esse processo e aumentar as oportunidades de adoção.

## Metodologia

O PetConnect será desenvolvido para Android e Web, utilizando tecnologias gratuitas ou com plano gratuito adequado ao desenvolvimento e à demonstração acadêmica.

Inicialmente, será realizada pesquisa bibliográfica e análise de aplicações existentes voltadas à adoção de animais. Em seguida, serão definidos os requisitos e critérios de aceite do MVP: navegação pública, busca por animais, contas de adotante e doador/ONG, confirmação de e-mail, anúncios com fotos, localização e contato autenticado por WhatsApp.

Na etapa de modelagem, serão definidos os fluxos de usuário, as telas, o modelo de dados e as regras de acesso. O protótipo contemplará Android e Web responsiva. Chat interno e lista de interesses ficam fora desta entrega.

A implementação será feita em TypeScript com React Native e Expo. O Supabase será utilizado para autenticação com confirmação de e-mail, banco de dados PostgreSQL e armazenamento de imagens. O esquema será versionado por migrations e protegido por Row Level Security (RLS). O código seguirá arquitetura em camadas e o padrão Repository, com versionamento Git/GitHub e revisão de alterações.

Por fim, serão realizados testes automatizados de regras e validações, testes das políticas RLS e testes funcionais em Android e Web. Serão corrigidos os problemas encontrados e preparadas contas confirmadas por e-mail e dados para a demonstração.

## Plataformas e funcionalidades fora do MVP

O MVP será implementado e demonstrado em Android e Web. iOS, chat interno, favoritos/interesses e publicação em lojas ficam fora desta entrega e só poderão ser considerados como evolução posterior.

## Integrantes

Consultar a versão institucional aprovada do pré-projeto para nomes e identificadores oficiais dos integrantes.
