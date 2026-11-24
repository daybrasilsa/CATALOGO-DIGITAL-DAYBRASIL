import { type Ref, useRef } from 'react'
import { Swatch } from '@/components/Swatch/Swatch'
import { usePointerTilt } from '@/hooks/usePointerTilt'
import { finishLabel } from '@/lib/light'
import type { AcmColor, OpenOrigin } from '@/types/acm'
import styles from './CatalogCard.module.css'

interface CatalogCardProps {
  color: AcmColor
  hidden: boolean
  finePointer: boolean
  motion: boolean
  onOpen: (id: string, origin: OpenOrigin) => void
  ref?: Ref<HTMLLIElement>
}

export function CatalogCard({ color, hidden, finePointer, motion, onOpen, ref }: CatalogCardProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const swatchRef = useRef<HTMLSpanElement>(null)
  usePointerTilt(buttonRef, swatchRef, { enabled: finePointer, tilt: motion })
  const finish = finishLabel(color)

  return (
    <li ref={ref} className={styles.item} hidden={hidden} data-anim="card">
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-label={`${color.name}. Ampliar`}
        onClick={() => {
          if (swatchRef.current) onOpen(color.id, { element: swatchRef.current, angle: 0 })
        }}
      >
        <Swatch ref={swatchRef} color={color} className={styles.swatch} />
        <span className={styles.meta}>
          <span className={styles.name}>{color.name}</span>
          {finish ? (
            <span className={styles.sub}>
              <span className={styles.tag}>{finish}</span>
            </span>
          ) : null}
        </span>
      </button>
    </li>
  )
}
