import { useRef } from 'react'
import { SectionHeader } from '@/components/SectionHeader/SectionHeader'
import { SECTION_IDS } from '@/config/site'
import { FAMILY_LABEL } from '@/data/families'
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { Flip, gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import type { AcmColor, CatalogFilter, OpenOrigin } from '@/types/acm'
import { CatalogCard } from './CatalogCard'
import { FilterBar } from './FilterBar'
import { matchesFilter } from './filterColors'
import { SearchField } from './SearchField'
import styles from './CatalogSection.module.css'

interface CatalogSectionProps {
  colors: readonly AcmColor[]
  filter: CatalogFilter
  query: string
  onFilterChange: (filter: CatalogFilter) => void
  onQueryChange: (query: string) => void
  onOpenColor: (id: string, origin: OpenOrigin) => void
}

export function CatalogSection({
  colors,
  filter,
  query,
  onFilterChange,
  onQueryChange,
  onOpenColor,
}: CatalogSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const itemRefs = useRef(new Map<string, HTMLLIElement>())
  const flipState = useRef<Flip.FlipState | null>(null)
  const revealTriggers = useRef<ScrollTrigger[]>([])
  const motion = !usePrefersReducedMotion()
  const finePointer = useFinePointer()
  const visibleCount = colors.filter((c) => matchesFilter(c, filter, query)).length

  /**
   * Conclui a "instalação" de todas as placas de uma vez. Necessário antes do primeiro filtro/busca:
   * uma placa lá de baixo que ainda não apareceu na tela continuaria invisível ao subir para o topo.
   */
  const finishReveal = () => {
    if (revealTriggers.current.length === 0) return
    for (const trigger of revealTriggers.current) trigger.kill()
    revealTriggers.current = []
    gsap.set([...itemRefs.current.values()], { opacity: 1, clearProps: 'transform' })
  }

  // Antes de mudar filtro ou busca, fotografa as posições atuais (técnica FLIP).
  const captureLayout = () => {
    if (!motion) return
    finishReveal()
    flipState.current = Flip.getState([...itemRefs.current.values()])
  }
  const handleFilter = (next: CatalogFilter) => {
    if (next === filter) return
    captureLayout()
    onFilterChange(next)
  }
  const handleQuery = (next: string) => {
    captureLayout()
    onQueryChange(next)
  }

  // Depois que o React atualizou o DOM, anima das posições antigas para as novas.
  useGSAP(
    () => {
      const state = flipState.current
      if (!state) return
      flipState.current = null
      Flip.from(state, {
        duration: 0.7,
        ease: 'power3.inOut',
        absolute: true,
        stagger: 0.01,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { opacity: 0, scale: 0.82, rotationX: -40, transformPerspective: 900 },
            {
              opacity: 1,
              scale: 1,
              rotationX: 0,
              y: 0,
              duration: 0.6,
              delay: 0.2,
              ease: 'power3.out',
              stagger: 0.025,
              overwrite: true,
              clearProps: 'transform',
            },
          ),
        onLeave: (els) =>
          gsap.to(els, { opacity: 0, scale: 0.82, duration: 0.3, ease: 'power2.in' }),
        // Itens que mudaram de lugar podem cruzar gatilhos de rolagem: recalcula ao fim.
        onComplete: () => ScrollTrigger.refresh(),
      })
    },
    { scope: sectionRef, dependencies: [filter, query] },
  )

  // Placas "instaladas" em lotes, conforme cada linha entra na tela (giram da horizontal para a parede).
  useGSAP(
    () => {
      if (!motion) return
      const items = gsap.utils.toArray<HTMLElement>('[data-anim="card"]')
      gsap.set(items, {
        opacity: 0,
        y: 40,
        rotationX: -70,
        transformPerspective: 900,
        transformOrigin: '50% 0%',
      })
      revealTriggers.current = ScrollTrigger.batch(items, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.06,
            overwrite: true,
            // No fim, tira o 3D que sobra: parado, ele só gasta memória de vídeo.
            clearProps: 'transform',
          }),
      })
    },
    { scope: sectionRef, dependencies: [motion] },
  )

  const familyLabel = filter === 'todas' ? null : FAMILY_LABEL[filter]

  return (
    <section
      ref={sectionRef}
      id={SECTION_IDS.catalog}
      className={styles.section}
      aria-labelledby="catalog-title"
    >
      <SectionHeader
        id="catalog-title"
        title={`As ${colors.length} cores`}
        className={styles.header}
      >
        <p>
          Fundo cinza neutro, como numa cabine de luz, para comparar os tons sem interferência.
          Clique em uma placa para ampliar.
        </p>
      </SectionHeader>

      <div className={styles.tools}>
        <SearchField value={query} onChange={handleQuery} />
        <p className={styles.count} aria-live="polite">
          {visibleCount === colors.length
            ? `${colors.length} cores`
            : `${visibleCount} de ${colors.length} cores`}
        </p>
      </div>

      <FilterBar colors={colors} value={filter} onChange={handleFilter} />

      <ul className={styles.grid} aria-label="Cores da cartela">
        {colors.map((color) => (
          <CatalogCard
            key={color.id}
            ref={(el) => {
              if (el) itemRefs.current.set(color.id, el)
              else itemRefs.current.delete(color.id)
            }}
            color={color}
            hidden={!matchesFilter(color, filter, query)}
            finePointer={finePointer}
            motion={motion}
            onOpen={onOpenColor}
          />
        ))}
      </ul>

      {visibleCount === 0 ? (
        <div className={styles.empty} aria-live="polite">
          <p>
            Nenhuma cor com “{query.trim()}”{familyLabel ? ` em ${familyLabel}` : ''}.
          </p>
          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              handleQuery('')
              if (filter !== 'todas') handleFilter('todas')
            }}
          >
            Mostrar todas as cores
          </button>
        </div>
      ) : null}
    </section>
  )
}
