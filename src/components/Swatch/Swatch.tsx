import type { ReactNode, Ref } from 'react'
import { textureStyle } from '@/lib/color'
import { cx } from '@/lib/cx'
import { colorLight, finishSlug } from '@/lib/light'
import type { AcmColor } from '@/types/acm'
import type { CSSVars } from '@/types/css'
import styles from './Swatch.module.css'

interface SwatchProps {
  color: AcmColor
  className?: string
  ref?: Ref<HTMLSpanElement>
  /** Camadas extras por cima da textura (ex.: transição de troca de cor). */
  children?: ReactNode
}

/**
 * A placa de ACM: textura real, borda com a espessura do material
 * (alumínio / núcleo / alumínio) e brilho de acordo com o acabamento.
 * Para o brilho seguir o cursor, combine com usePointerTilt.
 */
export function Swatch({ color, className, ref, children }: SwatchProps) {
  const light = colorLight(color)
  const style: CSSVars = {
    ...textureStyle(color),
    '--sheen-gain': light.cardSheen.toFixed(3),
    '--glare-gain': light.cardGlare.toFixed(3),
  }
  return (
    <span
      ref={ref}
      className={cx(styles.swatch, className)}
      data-finish={finishSlug(color.finish)}
      style={style}
    >
      <span className={styles.sheen} aria-hidden="true" />
      <span className={styles.glare} aria-hidden="true" />
      {children}
    </span>
  )
}
