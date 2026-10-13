import logoColor from '@/assets/brand/logo-daybrasil.svg'
import logoNegative from '@/assets/brand/logo-daybrasil-negativo.svg'
import { cx } from '@/lib/cx'
import styles from './BrandLogo.module.css'

interface BrandLogoProps {
  /**
   * color: azul e vermelho originais (fundos claros).
   * negative: azul vira branco, para fundos escuros (o azul da marca some no azul-escuro do palco).
   */
  variant?: 'color' | 'negative'
  className?: string
}

/** Logo DayBrasil em vetor (SVG extraído do arquivo original do modelo). */
export function BrandLogo({ variant = 'color', className }: BrandLogoProps) {
  return (
    <img
      src={variant === 'negative' ? logoNegative : logoColor}
      alt="DayBrasil"
      width={283}
      height={186}
      className={cx(styles.logo, className)}
    />
  )
}
