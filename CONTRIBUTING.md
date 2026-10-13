# Como contribuir

Guia curto para o time trabalhar no mesmo ritmo. Na dúvida, pergunte no PR.

## Fluxo de branches (Git Flow)

| Branch      | Para quê                                         | Sai de    | Volta para           |
| ----------- | ------------------------------------------------ | --------- | -------------------- |
| `main`      | O que está publicado para os clientes            | —         | —                    |
| `develop`   | Integração do que vai para a próxima versão      | `main`    | `main` (via release) |
| `feature/*` | Uma funcionalidade (ex.: `feature/link-por-cor`) | `develop` | `develop`            |
| `fix/*`     | Correção que pode esperar a próxima versão       | `develop` | `develop`            |
| `release/*` | Preparar uma versão (ex.: `release/0.2.0`)       | `develop` | `main` e `develop`   |
| `hotfix/*`  | Correção urgente em produção                     | `main`    | `main` e `develop`   |

Regras:

- Ninguém faz commit direto em `main` ou `develop`: tudo entra por Pull Request.
- PR pequeno é revisado rápido. Prefira vários PRs focados a um gigante.
- O CI precisa estar verde para fazer merge.

## Mensagens de commit (Conventional Commits)

Formato: `tipo(escopo opcional): descrição no imperativo`

```
feat(cartela): adiciona filtro por acabamento
fix(fachada): corrige cor do letreiro sobre amarelo
docs: explica como adicionar uma cor
style: formata arquivos com prettier
refactor(leque): extrai cálculo de luz para lib/light
test(cladding): cobre troca rápida de cor
chore: atualiza dependências
```

Tipos mais usados: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`.

## Antes de abrir o PR

```bash
npm run check   # tipos + lint + formatação + testes
npm run build   # garante que o build de produção sai
```

Preencha o template do PR, principalmente **Como testar** e os prints.

## Convenções de código

- **TypeScript estrito.** Nada de `any`; se precisar, explique no PR.
- **Exports nomeados** (`export function Hero`), sem `export default`. Facilita busca e refatoração.
- **Uma pasta por funcionalidade** em `src/features/`. Componente usado em mais de uma funcionalidade vai para `src/components/`.
- **Arquivos:** componentes em `PascalCase.tsx`, estilos ao lado em `PascalCase.module.css`, funções e hooks em `camelCase.ts`, testes ao lado do arquivo testado (`*.test.ts(x)`).
- **Estilo:** CSS Modules. Cores, fontes e espaçamentos vêm de `src/styles/tokens.css`; não escreva cor solta no componente se ela já existe como token.
- **Animação:** sempre com `useGSAP` (importado de `@/lib/gsap`), que limpa tudo ao desmontar. Selecione elementos por `data-anim="..."`, não pela classe do CSS Module. Toda animação precisa de um caminho sem animação para quem usa "reduzir movimento".
- **Textos** visíveis em português, com acentuação correta. Comentários explicam o _porquê_, não o óbvio.
- **Acessibilidade não é opcional:** todo controle funciona por teclado, tem nome acessível e foco visível.

## Testes

- Regras de negócio e cálculos (filtro, ordem do leque, troca de placas, luz) ficam em funções puras com teste unitário.
- Comportamento de tela é testado como o usuário usa (Testing Library): por papel e nome acessível, não por classe.
- Nos testes as animações ficam desligadas (`src/test/setup.ts` simula "reduzir movimento").
