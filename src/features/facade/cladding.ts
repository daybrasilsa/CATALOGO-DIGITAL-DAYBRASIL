import { relativeLuminance } from '@/lib/color'
import type { AcmColor, FacadeSelection } from '@/types/acm'

/**
 * Cada placa da fachada tem duas faces (frente e verso).
 * A cada troca de cor, a nova cor vai para a face escondida e a placa gira mais 180°.
 * `turns` conta os giros: par = face 0 visível, ímpar = face 1 visível.
 */
export interface RoleCladding {
  readonly faces: readonly [string, string]
  readonly turns: number
}

export interface FacadeCladding {
  readonly main: RoleCladding
  readonly detail: RoleCladding
}

export function initialCladding(selection: FacadeSelection): FacadeCladding {
  return {
    main: { faces: [selection.main, selection.main], turns: 0 },
    detail: { faces: [selection.detail, selection.detail], turns: 0 },
  }
}

export function visibleColor({ faces, turns }: RoleCladding): string {
  return turns % 2 === 0 ? faces[0] : faces[1]
}

/** Próximo estado ao escolher `id`. Mesma cor: devolve o mesmo objeto (nada gira). */
export function cladWith(state: RoleCladding, id: string): RoleCladding {
  if (visibleColor(state) === id) return state
  const turns = state.turns + 1
  const faces: [string, string] = turns % 2 === 0 ? [id, state.faces[1]] : [state.faces[0], id]
  return { faces, turns }
}

export function syncCladding(state: FacadeCladding, selection: FacadeSelection): FacadeCladding {
  const main = cladWith(state.main, selection.main)
  const detail = cladWith(state.detail, selection.detail)
  return main === state.main && detail === state.detail ? state : { main, detail }
}

/** Diferença mínima de luminância para o sorteio não gerar pórtico e miolo quase iguais. */
const MIN_CONTRAST = 0.12

/** Sorteia uma combinação de famílias diferentes, com contraste e diferente da atual. */
export function pickRandomCombo(
  colors: readonly AcmColor[],
  current: FacadeSelection,
  random: () => number = Math.random,
): FacadeSelection {
  const pick = () => colors[Math.floor(random() * colors.length)]
  for (let attempt = 0; attempt < 200; attempt++) {
    const main = pick()
    const detail = pick()
    if (!main || !detail || main.family === detail.family) continue
    if (Math.abs(relativeLuminance(main.hex) - relativeLuminance(detail.hex)) < MIN_CONTRAST)
      continue
    if (main.id === current.main && detail.id === current.detail) continue
    return { main: main.id, detail: detail.id }
  }
  return current
}
