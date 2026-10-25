import type { FacadeSelection } from '@/types/acm'

/** Textos institucionais usados em mais de um lugar. */
export const SITE = {
  company: 'DayBrasil',
  disclaimer: {
    lead: '*Cores meramente ilustrativas.',
    body: 'Pode haver variação de tom, a depender de monitores e celulares. Solicite uma amostra física ao seu vendedor.',
  },
  colorNote:
    'Tom aproximado, tirado da foto da placa. Monitores e celulares mostram a cor de jeitos diferentes; para especificar a obra, use a amostra física.',
} as const

/** Ids das seções (âncoras do menu e gatilhos das animações de rolagem). */
export const SECTION_IDS = {
  top: 'topo',
  catalog: 'cores',
  facade: 'fachada',
  sample: 'amostra',
} as const

/** Combinação que a fachada mostra ao abrir a página. */
export const DEFAULT_FACADE: FacadeSelection = { main: 'dark-grey', detail: 'amarelo-real' }
