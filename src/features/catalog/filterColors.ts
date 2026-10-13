import type { AcmColor, CatalogFilter } from '@/types/acm'

/** Normaliza para busca: sem acento, minúsculo, sem espaços nas pontas ("Avelã" → "avela"). */
export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function matchesFilter(color: AcmColor, filter: CatalogFilter, query = ''): boolean {
  if (filter !== 'todas' && color.family !== filter) return false
  const q = normalizeSearch(query)
  return q === '' || normalizeSearch(color.name).includes(q)
}

/** Ids visíveis com o filtro e a busca atuais, na ordem da cartela. */
export function visibleIds(
  colors: readonly AcmColor[],
  filter: CatalogFilter,
  query = '',
): string[] {
  return colors.filter((c) => matchesFilter(c, filter, query)).map((c) => c.id)
}

/** Quantidade de cores por família (para o número ao lado de cada botão). */
export function countByFilter(colors: readonly AcmColor[], filter: CatalogFilter): number {
  return colors.filter((c) => matchesFilter(c, filter)).length
}
