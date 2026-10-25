import { useState } from 'react'
import { PlateButton } from '@/components/PlateButton/PlateButton'
import { SectionHeader } from '@/components/SectionHeader/SectionHeader'
import { SECTION_IDS } from '@/config/site'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import type { AcmColor, FacadeSelection } from '@/types/acm'
import { pickRandomCombo } from './cladding'
import { ColorPicker } from './ColorPicker'
import { FacadeScene } from './FacadeScene'
import styles from './FacadeSection.module.css'

interface FacadeSectionProps {
  colors: readonly AcmColor[]
  selection: FacadeSelection
  onChange: (selection: FacadeSelection) => void
}

/** Último sorteio: a combinação de antes e a sorteada. */
interface Shuffle {
  before: FacadeSelection
  after: FacadeSelection
}

const sameSelection = (a: FacadeSelection, b: FacadeSelection) =>
  a.main === b.main && a.detail === b.detail

export function FacadeSection({ colors, selection, onChange }: FacadeSectionProps) {
  const motion = !usePrefersReducedMotion()
  const [shuffle, setShuffle] = useState<Shuffle | null>(null)
  // Só dá para desfazer enquanto a fachada ainda mostra o que foi sorteado.
  const canUndo = shuffle !== null && sameSelection(shuffle.after, selection)

  const shuffleCombo = () => {
    const after = pickRandomCombo(colors, selection)
    setShuffle({ before: selection, after })
    onChange(after)
  }

  const undoShuffle = () => {
    if (!shuffle) return
    onChange(shuffle.before)
    setShuffle(null)
  }

  return (
    <section id={SECTION_IDS.facade} className={styles.section} aria-labelledby="facade-title">
      <div className={styles.layout}>
        <div className={styles.side}>
          <SectionHeader
            id="facade-title"
            title="Monte sua fachada"
            layout="stacked"
            className={styles.head}
          >
            <p>
              Escolha a cor principal e a do pórtico. As placas são trocadas uma a uma, como numa
              instalação de verdade.
            </p>
          </SectionHeader>
          <div className={styles.pickers}>
            <ColorPicker
              zone="main"
              legend="Cor principal"
              colors={colors}
              value={selection.main}
              onChange={(id) => onChange({ ...selection, main: id })}
            />
            <ColorPicker
              zone="detail"
              legend="Pórtico e letreiro"
              colors={colors}
              value={selection.detail}
              onChange={(id) => onChange({ ...selection, detail: id })}
            />
            <div className={styles.actions}>
              <PlateButton onClick={shuffleCombo}>Sortear combinação</PlateButton>
              {/* Sempre no lugar (escondido quando não há o que desfazer): não empurra o layout */}
              <button
                type="button"
                className={styles.undo}
                disabled={!canUndo}
                onClick={undoShuffle}
              >
                Desfazer sorteio
              </button>
            </div>
          </div>
        </div>
        <FacadeScene selection={selection} motion={motion} className={styles.scene} />
      </div>
      <div className={styles.ground} aria-hidden="true" />
    </section>
  )
}
