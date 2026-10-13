/** Famílias usadas no filtro da cartela (por tom, não por acabamento). */
export type FamilyId =
  | 'brancos'
  | 'amarelos'
  | 'vermelhos'
  | 'azuis'
  | 'verdes'
  | 'cinzas'
  | 'pretos'
  | 'marrons'
  | 'madeiras'
  | 'texturas'

/**
 * Acabamento da placa.
 * Brilho, Metálico, Acetinado, Cintilante e Fosco vêm do nome comercial da cor.
 * Textura é uma classificação visual (Concreto, Aço Corten).
 */
export type Finish = 'Brilho' | 'Metálico' | 'Acetinado' | 'Cintilante' | 'Fosco' | 'Textura'

export interface AcmColor {
  /** Slug estável em kebab-case. Usado como key, id de input e nome do arquivo de textura. */
  readonly id: string
  /** Nome comercial, exatamente como o cliente vê. */
  readonly name: string
  readonly family: FamilyId
  /** Só preencha quando o acabamento for conhecido. */
  readonly finish?: Finish
  /** Tom médio extraído da foto da placa. Aproximado: não é referência oficial de cor. */
  readonly hex: `#${string}`
  /** URL da textura (WebP) resolvida pelo Vite no build. */
  readonly texture: string
}

/** Filtro da cartela: todas as cores ou uma família. */
export type CatalogFilter = 'todas' | FamilyId

/** De onde o detalhe foi aberto: usado para animar a placa saindo do elemento clicado. */
export interface OpenOrigin {
  readonly element: HTMLElement
  /** Rotação do elemento de origem em graus (lâminas do leque são giradas). */
  readonly angle: number
}

/** Cores escolhidas no simulador de fachada. */
export interface FacadeSelection {
  readonly main: string
  readonly detail: string
}

/** Zona da fachada: miolo (cor principal) ou pórtico/letreiro (cor de detalhe). */
export type FacadeZone = keyof FacadeSelection
