import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SiteNav } from '@/components/SiteNav/SiteNav'
import { DEFAULT_FACADE, SECTION_IDS } from '@/config/site'
import { ACM_COLORS, findColor } from '@/data/colors'
import { CatalogSection } from '@/features/catalog/CatalogSection'
import { visibleIds } from '@/features/catalog/filterColors'
import { ColorDetailDialog } from '@/features/color-detail/ColorDetailDialog'
import { pickerInputId } from '@/features/facade/pickerIds'
import { FacadeSection } from '@/features/facade/FacadeSection'
import { SiteFooter } from '@/features/footer/SiteFooter'
import { Hero } from '@/features/hero/Hero'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { ScrollTrigger } from '@/lib/gsap'
import { scrollToElement, startSmoothScroll } from '@/lib/smoothScroll'
import type { CatalogFilter, FacadeSelection, OpenOrigin } from '@/types/acm'
import { useStageLighting } from './useStageLighting'

interface DetailState {
  id: string
  origin: OpenOrigin | null
}

/** Tempo para a rolagem suave chegar na fachada antes de trocar as placas. */
const FACADE_SCROLL_DELAY_MS = 650

/** Marca da entrada do histórico criada ao abrir o detalhe. */
const DETAIL_ENTRY = 'catalogDetail'

function isDetailEntry(state: unknown): boolean {
  return typeof state === 'object' && state !== null && DETAIL_ENTRY in state
}

export function App() {
  const motion = !usePrefersReducedMotion()
  useStageLighting(motion)

  const [filter, setFilter] = useState<CatalogFilter>('todas')
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState<DetailState | null>(null)
  const [facade, setFacade] = useState<FacadeSelection>(DEFAULT_FACADE)
  /** Cor que o "Ver na fachada" vai mostrar assim que o detalhe terminar de fechar. */
  const facadeTarget = useRef<string | null>(null)
  const facadeTimer = useRef<number | undefined>(undefined)

  // Rolagem suave (desligada com "reduzir movimento").
  useEffect(() => (motion ? startSmoothScroll() : undefined), [motion])

  // No detalhe, "anterior/próxima" seguem a cartela filtrada (se a cor aberta estiver nela).
  const sequence = useMemo(() => {
    const filtered = visibleIds(ACM_COLORS, filter, query)
    return detail && filtered.includes(detail.id) ? filtered : ACM_COLORS.map((c) => c.id)
  }, [filter, query, detail])

  // Abrir o detalhe cria uma entrada no histórico: o "voltar" do celular ou do navegador
  // fecha o detalhe em vez de sair do site.
  const openColor = useCallback((id: string, origin: OpenOrigin) => {
    if (!isDetailEntry(window.history.state)) {
      window.history.pushState({ [DETAIL_ENTRY]: true }, '')
    }
    setDetail({ id, origin })
  }, [])

  // Fechar pelo site (botão, Esc) desfaz a entrada; quem fecha de fato é o "popstate" abaixo.
  const closeDetail = useCallback(() => {
    if (isDetailEntry(window.history.state)) window.history.back()
    else setDetail(null)
  }, [])

  // A página cuida da própria rolagem. Sem isto, ao fechar o detalhe pelo histórico o navegador
  // devolve a página à posição antiga e desfaz o "Ver na fachada" (sem animação, a rolagem é
  // instantânea e perde). Efeito colateral aceito: recarregar a página começa do topo.
  // Pelo ScrollTrigger, e não direto no `history`: ele regrava o valor a cada recálculo.
  useEffect(() => {
    ScrollTrigger.clearScrollMemory('manual')
  }, [])

  useEffect(() => {
    const onPopState = () => setDetail(null)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const step = (delta: 1 | -1) => {
    if (!detail) return
    const index = sequence.indexOf(detail.id)
    const next = sequence[(index + delta + sequence.length) % sequence.length]
    if (next) setDetail({ id: next, origin: null })
  }

  const showOnFacade = (id: string) => {
    facadeTarget.current = id
    closeDetail()
  }

  // Rola até a fachada só depois que o detalhe fechou. Com ele aberto, a rolagem da página
  // fica travada e o Lenis ignora o pedido: era por isso que o botão não saía do lugar.
  // (O diálogo destrava a rolagem num efeito de layout, que roda antes deste.)
  useEffect(() => {
    const id = facadeTarget.current
    if (detail || !id) return
    facadeTarget.current = null
    const facadeSection = document.getElementById(SECTION_IDS.facade)
    if (facadeSection) scrollToElement(facadeSection, motion)
    window.clearTimeout(facadeTimer.current)
    facadeTimer.current = window.setTimeout(
      () => {
        setFacade((current) => ({ ...current, main: id }))
        document.getElementById(pickerInputId('main', id))?.focus({ preventScroll: true })
      },
      motion ? FACADE_SCROLL_DELAY_MS : 0,
    )
  }, [detail, motion])

  useEffect(() => () => window.clearTimeout(facadeTimer.current), [])

  // A fonte muda a altura dos textos: recalcula os gatilhos de rolagem quando ela termina de carregar.
  useEffect(() => {
    if ('fonts' in document) void document.fonts.ready.then(() => ScrollTrigger.refresh())
  }, [])

  const detailColor = detail ? (findColor(detail.id) ?? null) : null
  const position = detail ? { index: sequence.indexOf(detail.id), total: sequence.length } : null

  return (
    <>
      <SiteNav />
      <main>
        <Hero colors={ACM_COLORS} onOpenColor={openColor} />
        <CatalogSection
          colors={ACM_COLORS}
          filter={filter}
          query={query}
          onFilterChange={setFilter}
          onQueryChange={setQuery}
          onOpenColor={openColor}
        />
        <FacadeSection colors={ACM_COLORS} selection={facade} onChange={setFacade} />
      </main>
      <SiteFooter />
      <ColorDetailDialog
        color={detailColor}
        origin={detail?.origin ?? null}
        position={position}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onClose={closeDetail}
        onShowOnFacade={showOnFacade}
      />
    </>
  )
}
