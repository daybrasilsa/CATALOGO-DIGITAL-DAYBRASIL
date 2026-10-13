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

export function FacadeSection({ colors, selection, onChange }: FacadeSectionProps) {
  const motion = !usePrefersReducedMotion()
  return (
    <section id={SECTION_IDS.facade} className={styles.section} aria-labelledby="facade-title">
      <div className={styles.layout}>
        <div className={styles.side}>
          <SectionHeader
            id="facade-title"
            title="Veja na fachada"
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
            <PlateButton onClick={() => onChange(pickRandomCombo(colors, selection))}>
              Sortear combinação
            </PlateButton>
          </div>
        </div>
        <FacadeScene selection={selection} motion={motion} className={styles.scene} />
      </div>
      <div className={styles.ground} aria-hidden="true" />
    </section>
  )
}
