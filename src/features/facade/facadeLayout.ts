import { createSeededRandom } from '@/lib/random'
import type { FacadeZone } from '@/types/acm'

/** Grade da fachada: 12 colunas x 7 linhas (a primeira é a faixa do letreiro). */
export const FACADE_COLUMNS = 12
export const FACADE_ROWS = 7

interface GridArea {
  readonly row: number
  readonly col: number
  readonly rowSpan: number
  readonly colSpan: number
}

export interface FacadePanel extends GridArea {
  readonly zone: FacadeZone
  /** Tamanho da textura (% da largura da placa): escala constante por célula e sempre cobrindo a placa. */
  readonly textureSize: string
  /** Recorte da textura: cada placa pega um pedaço diferente, como chapas de lotes distintos. */
  readonly textureX: string
  readonly textureY: string
}

export interface FacadeGlass extends GridArea {
  readonly kind: 'window' | 'shop' | 'door'
}

type Spec = readonly [row: number, col: number, rowSpan: number, colSpan: number]

/** Pórtico (moldura) e faixa do letreiro: cor de detalhe. */
const DETAIL_SPECS: readonly Spec[] = [
  [1, 1, 1, 3],
  [1, 4, 1, 6],
  [1, 10, 1, 3],
  [2, 1, 3, 1],
  [5, 1, 3, 1],
  [2, 12, 3, 1],
  [5, 12, 3, 1],
]

/** Revestimento do miolo: cor principal. */
const MAIN_SPECS: readonly Spec[] = [
  [2, 2, 1, 2],
  [2, 4, 1, 2],
  [2, 6, 1, 2],
  [2, 8, 1, 2],
  [2, 10, 1, 2],
  [3, 2, 2, 1],
  [3, 6, 2, 2],
  [3, 11, 2, 1],
  [5, 2, 1, 2],
  [5, 4, 1, 2],
  [5, 8, 1, 2],
  [5, 10, 1, 2],
]

export const FACADE_GLASS: readonly FacadeGlass[] = [
  { row: 3, col: 3, rowSpan: 2, colSpan: 3, kind: 'window' },
  { row: 3, col: 8, rowSpan: 2, colSpan: 3, kind: 'window' },
  { row: 6, col: 2, rowSpan: 2, colSpan: 4, kind: 'shop' },
  { row: 5, col: 6, rowSpan: 3, colSpan: 2, kind: 'door' },
  { row: 6, col: 8, rowSpan: 2, colSpan: 4, kind: 'shop' },
]

/** Faixa do letreiro "Sua marca" (sobre o painel central do pórtico). */
export const SIGN_AREA = '1 / 4 / 2 / 10'

function buildPanels(): FacadePanel[] {
  const random = createSeededRandom(7)
  const toPanel =
    (zone: FacadeZone) =>
    ([row, col, rowSpan, colSpan]: Spec): FacadePanel => {
      const imageCells = Math.max(3.4, colSpan * 1.25, rowSpan * 1.75)
      return {
        zone,
        row,
        col,
        rowSpan,
        colSpan,
        textureSize: `${((imageCells / colSpan) * 100).toFixed(1)}%`,
        textureX: `${(random() * 100).toFixed(1)}%`,
        textureY: `${(random() * 100).toFixed(1)}%`,
      }
    }
  return [...DETAIL_SPECS.map(toPanel('detail')), ...MAIN_SPECS.map(toPanel('main'))]
}

export const FACADE_PANELS: readonly FacadePanel[] = buildPanels()

export function gridArea({ row, col, rowSpan, colSpan }: GridArea): string {
  return `${row} / ${col} / ${row + rowSpan} / ${col + colSpan}`
}
