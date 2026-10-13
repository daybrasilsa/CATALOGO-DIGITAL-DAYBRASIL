import type { CatalogFilter, FamilyId } from '@/types/acm'

export const FAMILY_LABEL: Readonly<Record<FamilyId, string>> = {
  brancos: 'Brancos',
  amarelos: 'Amarelos e laranjas',
  vermelhos: 'Vermelhos e vinho',
  azuis: 'Azuis',
  verdes: 'Verdes',
  cinzas: 'Cinzas e grafites',
  pretos: 'Pretos',
  marrons: 'Bronze, champagne e marrom',
  madeiras: 'Madeiras',
  texturas: 'Texturas',
}

/** Ordem dos botões de filtro na cartela. */
export const CATALOG_FILTERS: readonly { readonly id: CatalogFilter; readonly label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'madeiras', label: FAMILY_LABEL.madeiras },
  { id: 'cinzas', label: FAMILY_LABEL.cinzas },
  { id: 'brancos', label: FAMILY_LABEL.brancos },
  { id: 'pretos', label: FAMILY_LABEL.pretos },
  { id: 'azuis', label: FAMILY_LABEL.azuis },
  { id: 'verdes', label: FAMILY_LABEL.verdes },
  { id: 'vermelhos', label: FAMILY_LABEL.vermelhos },
  { id: 'amarelos', label: FAMILY_LABEL.amarelos },
  { id: 'marrons', label: FAMILY_LABEL.marrons },
  { id: 'texturas', label: FAMILY_LABEL.texturas },
]
