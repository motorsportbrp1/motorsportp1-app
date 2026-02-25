# Guia de Imagens do Site

Este documento reúne todos os locais do front-end onde são utilizadas **imagens** (`<img>` ou `background-image`) e descreve os tamanhos aplicados via classes Tailwind ou estilos embutidos.

>⚠️ Este arquivo faz parte do repositório `document/` que abrigará outros documentos do site.

---

## HomePage

- **Hero (fundo)**
  - `<img class="w-full h-full object-cover opacity-40..." />` dentro de container com `min-h-[320px]`.
- **Circuit layout**
  - `<img class="w-[80%] max-h-[80%] object-contain" />` dentro de `div` `w-full md:w-1/3 h-64`.
- **Modal de piloto**
  - `<img class="w-full h-full object-cover scale-110" />` (altura variável com o modal).

## RaceDetailPage

- Piloto na tabela de resultados: wrapper `w-12 h-12` (48×48 px).
- Logo de equipe: wrapper `w-6 h-6` (24×24 px).
- No card de Speed Trap: foto do piloto `w-11 h-11` (44×44 px), logo de equipe com padding.

## TeamsIndexPage

- **Carousel / Hall of Fame**
  - Logo círculo: `w-10 h-10 rounded-full` (40×40 px).
- **Tabela de equipes**
  - Bandeira: `h-4 w-auto` (~16 px).
  - Logo dentro de `w-10 h-10`.

## TeamProfilePage

- **Hero**
  - Fundo com `bg-cover bg-center` + imagem: `w-full h-full object-contain` dentro de `min-h-[420px]`.
- **Topo**
  - Bandeira: `h-5 w-auto` (20 px).
  - Logo da equipe: `h-24 w-auto` (96 px).
- **Pilotos**
  - Avatar: `w-20 h-20` (80×80 px).
- **Tabelas/Stats**
  - Foto do piloto `w-full h-full` dentro de `w-12 h-12`.
  - Logo de equipe `w-full h-full` dentro de `w-6 h-6`.

## SeasonsIndexPage

- **Cartão de temporada**
  - Área de imagem: `h-48 w-full`.
  - Campeão piloto: círculo `w-14 h-14` (56×56 px).
  - Logo campeã: `size-6` (~24 px) ou `size-10` (~40 px).
- **Widgets laterais**
  - Top drivers: `w-10 h-10` (40×40 px).
  - Top teams: `size-8` (~32 px).

## SeasonDetailPage

- Campeão de pilotos: avatar `w-20 h-20` (80×80 px); bandeira 36×36 px.
- Campeão de construtores: logo `size-14` (~56 px).
- Biggest winner: avatar `size-10` (~40 px).
- Outros elementos usam `size-4` (16 px) ou `size-10`.

## DriversIndexPage

- Carrossel de lendas: foto `size-14` (~56 px).
- Tabela: headshot `size-9` (~36 px); bandeira `h-4 w-auto` (~16 px).

## DriverProfilePage

- Avatar no hero: `w-32 h-32` (128 px) mobile e `md:w-40 h-40` (160 px) desktop.
- Bandeira de nacionalidade: 36×36 px.
- Flags em timeline: `w-5 h-3.5` (~20×14 px).

## Observações gerais

- Classes `size-X` seguem o sistema Tailwind (0.25rem × X).
- A maioria das larguras é `w-full`; as alturas definem a caixa.
- Imagens dinâmicas usam utilitários `getMediaUrl`, `getDriverImageUrl`, etc.
- Fallbacks substituem por letras ou ícones quando não há imagem.

---

*Documento gerado automaticamente em 24‑fev‑2026 por Copilot.*
