# Cartela de Cores ACM · DayBrasil

Catálogo interativo das cores de ACM (painel de alumínio composto) da DayBrasil S/A. A ideia é substituir o PDF que os vendedores mandam para os clientes por um site: o cliente vê cada placa com a textura real, compara as cores num fundo neutro e simula a combinação numa fachada. ATENÇÃO: Este projeto foi desenvolvido em um modelo de co-criação humano-IA. Atuei como desenvolvedor principal e arquiteto da solução, contando com o suporte avançado do Claude (Anthropic) para a otimização de código, refatoração e insights de engenharia.

> **Status:** em desenvolvimento (v0.2, 44 cores). Ainda não está aprovado para envio a clientes. Veja [Antes de publicar](#antes-de-publicar).

## O que o site faz

- **Leque giratório (abertura):** as 44 cores formam um disco que o cliente gira arrastando (mouse ou dedo), com inércia; ao soltar, uma lâmina para no topo e mostra o nome. A luz segue o cursor e cada acabamento reflete de um jeito (brilho, metálico, cintilante, acetinado, fosco, textura).
- **Cartela:** todas as placas sobre cinza neutro, com busca por nome (sem acento: "avela" acha "Avelã") e filtro por família. Clicar abre o detalhe da cor, com navegação entre cores.
- **Rolagem suave** e títulos que "laminam" ao entrar na tela; as placas da cartela são "instaladas" conforme aparecem.
- **Simulador de fachada:** o cliente escolhe a cor principal e a do pórtico/letreiro; as placas trocam uma a uma.
- **Responsivo** do celular (360 px) ao monitor grande, e utilizável só com teclado.
- **Respeita "reduzir movimento"** do sistema: as animações são trocadas por mudanças instantâneas.

## Stack

| Ferramenta                                                                    | Para quê                                                       |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [Vite 8](https://vite.dev)                                                    | Servidor de desenvolvimento e build                            |
| [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/) | Interface, com tipagem estrita                                 |
| CSS Modules                                                                   | Estilo isolado por componente + tokens globais                 |
| [GSAP 3](https://gsap.com) + `@gsap/react`                                    | Animações, arrasto com inércia (Draggable + Inertia) e Flip    |
| [Lenis](https://lenis.darkroom.engineering)                                   | Rolagem suave, sincronizada com o GSAP                         |
| [sharp](https://sharp.pixelplumbing.com) (só no script)                       | Gera as texturas das cores a partir das fotos do modelo        |
| [Archivo](https://fonts.google.com/specimen/Archivo) (variável, Fontsource)   | Tipografia; o eixo de largura é animado no título              |
| [Vitest](https://vitest.dev) + Testing Library                                | Testes unitários e de comportamento                            |
| [oxlint](https://oxc.rs) + [Prettier](https://prettier.io)                    | Lint (inclui regras de React Hooks e acessibilidade) e formato |

### Por que essas escolhas

- **Vite + oxlint:** é o template oficial atual do Vite para React + TS. Não inventamos configuração.
- **CSS Modules em vez de Tailwind:** o visual depende de muitos gradientes, sombras em camadas e transformações 3D. Em Tailwind isso viraria classes enormes e difíceis de revisar. Com CSS Modules o CSS continua CSS, cada componente tem o seu arquivo e as cores vêm de um lugar só (`src/styles/tokens.css`).
- **GSAP:** as animações deste site (timelines coreografadas, animação ligada à rolagem, rearranjo do filtro) dariam muito código na mão. O `useGSAP` limpa tudo quando o componente desmonta, o que evita bugs no React. O GSAP e seus plugins são gratuitos, inclusive para uso comercial ([licença](https://gsap.com/standard-license)).
- **Fonte instalada pelo npm (Fontsource):** o site não faz requisição ao Google Fonts. Carrega mais rápido e não envia dados do visitante a terceiros.

## Como rodar

Requisitos: **Node 22.12 ou mais novo** (tem um `.nvmrc`; com nvm, rode `nvm use`) e npm.

```bash
npm install
npm run dev          # http://localhost:5173
```

Para ver o build de produção:

```bash
npm run build
npm run preview      # http://localhost:4173
```

### Scripts

| Comando              | O que faz                                                          |
| -------------------- | ------------------------------------------------------------------ |
| `npm run dev`        | Servidor de desenvolvimento com recarga automática                 |
| `npm run build`      | Checa os tipos e gera o site em `dist/`                            |
| `npm run preview`    | Serve o `dist/` localmente                                         |
| `npm run check`      | **Rode antes de todo PR:** tipos + lint + formatação + testes      |
| `npm test`           | Roda os testes uma vez                                             |
| `npm run test:watch` | Testes em modo observação                                          |
| `npm run lint`       | Lint com oxlint (`lint:fix` corrige o que der automaticamente)     |
| `npm run format`     | Formata tudo com Prettier (`format:check` só confere)              |
| `npm run typecheck`  | Só a checagem do TypeScript                                        |
| `npm run textura`    | Gera a textura de uma cor a partir da foto do modelo (veja abaixo) |

## Estrutura de pastas

```
src/
├── app/                    # Composição da página e estado compartilhado
│   ├── App.tsx             #   filtro, cor aberta no detalhe e seleção da fachada
│   └── useStageLighting.ts #   fundo escuro → cinza ao rolar ("acender a luz")
├── assets/
│   ├── brand/              # Logo DayBrasil em vetor: original e negativo (fundo escuro)
│   └── textures/           # Uma textura (WebP) por cor: <id-da-cor>.webp
├── components/             # Peças visuais reaproveitadas em várias seções
│   ├── BrandLogo/          #   logo (variante colorida ou negativa)
│   ├── Plaque/             #   logo numa plaquinha de alumínio
│   ├── PlateButton/        #   botão/link "chapa de alumínio"
│   ├── SectionHeader/      #   título + texto de seção
│   └── Swatch/             #   a placa de ACM (textura, borda, brilho)
├── config/site.ts          # Textos institucionais, ids das seções, fachada padrão
├── data/
│   ├── colors.ts           # ★ A cartela: todas as cores, na ordem de exibição
│   └── families.ts         # Famílias e botões de filtro
├── features/               # Uma pasta por seção/funcionalidade
│   ├── hero/               #   abertura: título animado e leque giratório (fanGeometry.ts = matemática do disco)
│   ├── catalog/            #   cartela com busca e filtro
│   ├── color-detail/       #   detalhe da cor (diálogo)
│   ├── facade/             #   simulador de fachada
│   └── footer/             #   chamada para amostra e aviso legal
├── hooks/                  # useMediaQuery, usePointerTilt
├── lib/                    # Cor, modelo de luz, aleatório, GSAP e rolagem suave (smoothScroll.ts)
├── styles/                 # tokens.css (cores, fontes, espaços) e global.css
├── test/setup.ts           # Configuração dos testes
├── types/                  # Tipos compartilhados (AcmColor, filtros, fachada)
└── main.tsx                # Ponto de entrada

scripts/prepare-textures.mjs  # Gera texturas WebP a partir das fotos do modelo (npm run textura)
```

Cada arquivo de teste fica ao lado do que ele testa (`*.test.ts` / `*.test.tsx`). O alias `@/` aponta para `src/` (`import { ACM_COLORS } from '@/data/colors'`).

## Como o código está organizado

**Dados → estado → seções.** `src/data/colors.ts` é a fonte única das cores. O `App` guarda só o estado que mais de uma seção usa: o filtro e a busca da cartela (o detalhe navega dentro deles), a cor aberta e a combinação da fachada (o botão "Ver na fachada" do detalhe muda a fachada). O resto é estado local de cada componente.

**Lógica separada da tela.** O que tem regra (filtro, ordem do leque, troca das faces das placas, cálculo de luz, sorteio de combinação) é função pura em arquivos `.ts`, com teste unitário. Os componentes só desenham e reagem.

**Animações.**

- Toda animação usa `useGSAP`, importado de `@/lib/gsap` (onde os plugins são registrados uma vez).
- O GSAP encontra os elementos por `data-anim="..."`, nunca pela classe do CSS Module (que muda no build).
- Movimentos que acontecem a cada frame (giro do leque, luz seguindo o mouse, inclinação das placas) escrevem estilo direto no elemento, sem `setState`, para não re-renderizar o React 60 vezes por segundo.
- O leque giratório: um elemento invisível ("proxy") é arrastado com o `Draggable`; a posição dele vira a rotação do disco. A matemática (ângulo de cada lâmina, qual está no topo, encaixe) fica em `fanGeometry.ts`, com testes.
- Rolagem suave: um único Lenis, dirigido pelo relógio do GSAP (`src/lib/smoothScroll.ts`). Use `scrollToElement()` para rolar por código, nunca `scrollIntoView` direto.
- Sem animação, a página precisa estar completa e correta: o CSS sempre descreve o estado final; o GSAP só anima até ele.

**Estilo.** `tokens.css` define cores, fontes e espaçamentos. Os componentes usam essas variáveis. A classe global `.is-scrub` no `<html>` indica que o fundo animado pela rolagem está ligado; as seções ficam transparentes para mostrar esse fundo.

### Fidelidade de cor

- **Perfil de cor:** 8 das 44 fotos originais vêm em **Adobe RGB** (as outras em sRGB). O navegador trabalha em sRGB; sem converter, cores como o Verde Folha e o Vermelho Intenso Brilho saem bem diferentes. O script converte pelo perfil de cada arquivo.
- **Compressão:** placas lisas são salvas **sem perda** (pixels idênticos à foto, poucos KB). Texturas (madeiras, metálicos, concreto) usam WebP qualidade 90: sem perda ficariam com 300 a 800 KB cada.
- **Conferência feita na v0.2:** cada textura comparada pixel a pixel com a foto original. 21 das 44 são idênticas; a maior diferença na cor média é ΔE 0,42 (abaixo de 1, o olho não percebe). Nenhuma textura trocada de nome: cada uma bate com a própria foto com folga grande sobre a segunda mais parecida (madeiras incluídas).
- **Correção de tom:** quando a imagem da pasta oficial não bate com a chapa física, o id da cor entra na tabela `TONE_FIXES` do script com o tom certo. O script desloca a cor de todos os pixels (em Lab) até a média virar esse tom, sem mexer no desenho (reflexo, veio, granulado). Só entra o que foi conferido na chapa física. Hoje, as duas com o tom da versão convencional (decisão de 25/10/2026): Azul Marinho Brilho (a imagem da pasta é roxa; chapa conferida) e Vermelho Intenso Brilho (a imagem é saturada demais; aprovado pelo mesmo padrão e pelo PDF de 2025, chapa não conferida). Os outros pares Brilho × convencional diferem pouco e ficam como a pasta.
- **Reflexo sem cobrir a cor:** o brilho que segue o cursor é branco por cima da placa, e a mesma intensidade muda muito mais uma cor escura que uma clara. `colorLight()` (`src/lib/light.ts`) limita, cor a cor, quanto o reflexo pode mudar a cor no ponto mais forte (`maxDeltaE` do acabamento: Brilho 12, Metálico e Cintilante 10, demais 8, em ΔE2000). Vale na cartela, no detalhe, no leque e na fachada; há um teste por cor.
- Total das 44 texturas: ~2,2 MB. Enquanto uma imagem carrega, a placa mostra o `hex` da cor. O `hex` não aparece escrito no site: sem os códigos oficiais de cor, ele dava a impressão de ser uma referência.

## Acessibilidade

- Leque: um único ponto de parada no Tab; setas, Home e End giram o leque e movem o foco (padrão _toolbar_ do ARIA); Enter abre a cor. No celular, deslizar na vertical continua rolando a página.
- Detalhe da cor: `<dialog>` nativo (foco preso, Esc fecha, foco volta para quem abriu); setas trocam de cor.
- Fachada: rádios nativos (setas trocam a cor); a simulação tem uma legenda para leitores de tela.
- Foco sempre visível; texto sobre cada cor escolhe claro/escuro pela luminância.
- "Reduzir movimento" desliga as animações sem perder nenhuma função.

## Deploy

O build (`npm run build`) gera arquivos estáticos em `dist/`. Funciona em qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3). No GitHub Pages em subpasta, configure `base` no `vite.config.ts`.

O workflow `.github/workflows/ci.yml` roda `npm run check` e o build em todo PR e em push para `main` e `develop`.

## Antes de publicar

Pontos em aberto antes de mandar para clientes:

- [ ] **Aprovação** do comercial/marketing: o site usa a marca DayBrasil.
- [ ] **Logo negativo.** O logo é o vetor original (extraído do PSD do modelo). Na navbar, sobre fundo escuro, o azul foi trocado por branco (versão negativa). Confirmar com o marketing se é a versão oficial para fundo escuro.
- [ ] **Conferir as cores com a amostra física.** Azul Marinho Brilho: conferido e corrigido (25/10/2026). Vermelho Intenso Brilho: corrigido pelo mesmo padrão; falta conferir a chapa.
- [ ] **Confirmar os acabamentos.** Brilho/Metálico/Acetinado/Cintilante/Fosco vieram do nome; "Textura" (Concreto, Aço Corten) foi classificação visual.
- [ ] **Cores fora da pasta principal** (não estão no site até alguém confirmar que estão no portfólio atual): Cinza Claro, Cinza Escuro Leomare, Terra Cota Vulcano e Vermelho Rubi (têm foto no modelo, em `OUTRAS FOTOS`); Bronze Indiano, Imbuia, Espelhado, Cinza Escovado e Vinho Metálico (só fotos avulsas); Madeira Ébano Imperial, Cerejeira Clássica e Nogueira ("sob encomenda") e Azul Claro Brilho (só no kit de plaquinhas).
- [ ] **Domínio** e imagem de prévia para links (`og:image`, com URL absoluta) para o WhatsApp mostrar uma miniatura.
- [ ] Se entrar analytics ou formulário: revisar LGPD (aviso de cookies e política de privacidade).

## Licenças e créditos

- Fotos das placas, nomes das cores e logo: propriedade da DayBrasil S/A.
- Fonte Archivo: SIL Open Font License 1.1.
- GSAP: [licença padrão gratuita](https://gsap.com/standard-license) (permite uso comercial).
- Demais dependências: veja `package.json`.
