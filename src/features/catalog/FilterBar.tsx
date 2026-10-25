import { CATALOG_FILTERS } from '@/data/families'
import type { AcmColor, CatalogFilter } from '@/types/acm'
import { countByFilter } from './filterColors'
import styles from './FilterBar.module.css'

interface FilterBarProps {
  colors: readonly AcmColor[]
  value: CatalogFilter
  /** Busca atual: os números mostram quantas cores de cada família a busca encontra. */
  query: string
  onChange: (filter: CatalogFilter) => void
}

export function FilterBar({ colors, value, query, onChange }: FilterBarProps) {
  return (
    <fieldset className={styles.bar}>
      <legend className="sr-only">Filtrar por família</legend>
      <div className={styles.chips}>
        {CATALOG_FILTERS.map((filter) => {
          if (countByFilter(colors, filter.id) === 0) return null
          const count = countByFilter(colors, filter.id, query)
          const pressed = value === filter.id
          return (
            <button
              key={filter.id}
              type="button"
              className={styles.filter}
              aria-pressed={pressed}
              // Família sem nenhuma cor na busca atual: não leva a uma cartela vazia.
              disabled={count === 0 && !pressed}
              onClick={() => onChange(filter.id)}
            >
              {filter.label} <span className={styles.count}>{count}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
