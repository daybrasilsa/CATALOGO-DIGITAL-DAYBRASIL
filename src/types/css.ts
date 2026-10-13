import type { CSSProperties } from 'react'

/** CSSProperties que também aceita variáveis CSS (`--nome`). */
export type CSSVars = CSSProperties & Record<`--${string}`, string | number>
