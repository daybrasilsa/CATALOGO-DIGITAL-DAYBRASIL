import { BrandLogo } from '@/components/BrandLogo/BrandLogo'
import { cx } from '@/lib/cx'
import styles from './Plaque.module.css'

interface PlaqueProps {
  size?: 'sm' | 'md'
  className?: string
}

/** Logo DayBrasil montado numa plaquinha de alumínio com rebites (para fundos escuros). */
export function Plaque({ size = 'md', className }: PlaqueProps) {
  return (
    <span className={cx(styles.plaque, styles[size], className)}>
      <BrandLogo className={styles.logo} />
    </span>
  )
}
