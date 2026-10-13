import { textureStyle } from '@/lib/color'
import type { AcmColor, FacadeZone } from '@/types/acm'
import { pickerInputId } from './pickerIds'
import styles from './ColorPicker.module.css'

interface ColorPickerProps {
  zone: FacadeZone
  legend: string
  colors: readonly AcmColor[]
  value: string
  onChange: (id: string) => void
}

/** Grupo de rádios nativos com cara de amostra: setas do teclado já funcionam. */
export function ColorPicker({ zone, legend, colors, value, onChange }: ColorPickerProps) {
  const selected = colors.find((c) => c.id === value)
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>
        <span>{legend}</span>
        <output className={styles.output}>{selected?.name}</output>
      </legend>
      <div className={styles.chips}>
        {colors.map((color) => (
          <label key={color.id} className={styles.chip} title={color.name}>
            <input
              id={pickerInputId(zone, color.id)}
              type="radio"
              name={`facade-${zone}`}
              value={color.id}
              checked={color.id === value}
              onChange={() => onChange(color.id)}
            />
            <span className={styles.face} style={textureStyle(color)} aria-hidden="true" />
            <span className="sr-only">{color.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
