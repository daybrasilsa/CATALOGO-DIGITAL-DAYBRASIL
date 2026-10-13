import { CATALOG_FILTERS } from '@/data/families'
import type { AcmColor, CatalogFilter } from '@/types/acm'
import { countByFilter } from './filterColors'
import styles from './FilterBar.module.css'

interface FilterBarProps {
  colors: readonly AcmColor[]
  value: CatalogFilter
  onChange: (filter: CatalogFilter) => void
}

export function FilterBar({ colors, value, onChange }: FilterBarProps) {
  return (
    <fieldset className={styles.bar}>
      <legend className="sr-only">Filtrar por família</legend>
      {CATALOG_FILTERS.map((filter) => {
        const count = countByFilter(colors, filter.id)
        if (count === 0) return null
        return (
          <button
            key={filter.id}
            type="button"
            className={styles.filter}
            aria-pressed={value === filter.id}
            onClick={() => onChange(filter.id)}
          >
            {filter.label} <span className={styles.count}>{count}</span>
          </button>
        )
      })}
    </fieldset>
  )
}
