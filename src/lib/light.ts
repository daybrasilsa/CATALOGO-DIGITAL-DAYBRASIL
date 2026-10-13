import type { AcmColor, Finish } from '@/types/acm'

/**
 * Modelo VISUAL (não físico) de como cada acabamento reflete a luz.
 * Serve para o brilho das lâminas do leque e das placas da cartela.
 */
export interface LightProfile {
  /** Expoente do reflexo: quanto maior, mais estreito e nítido. */
  readonly sharpness: number
  /** Intensidade máxima do reflexo nas lâminas do leque (0–1). */
  readonly gain: number
  /** Intensidade do brilho nas placas da cartela (0–1). */
  readonly cardGain: number
}

const DEFAULT_PROFILE: LightProfile = { sharpness: 5, gain: 0.36, cardGain: 0.34 }

export const FINISH_LIGHT: Readonly<Record<Finish, LightProfile>> = {
  Brilho: { sharpness: 26, gain: 0.95, cardGain: 0.62 },
  Metálico: { sharpness: 9, gain: 0.7, cardGain: 0.5 },
  Acetinado: { sharpness: 6, gain: 0.5, cardGain: 0.4 },
  Cintilante: { sharpness: 9, gain: 0.72, cardGain: 0.52 },
  Fosco: { sharpness: 3, gain: 0.18, cardGain: 0.2 },
  Textura: { sharpness: 4, gain: 0.26, cardGain: 0.26 },
}

export function lightProfile(color: Pick<AcmColor, 'finish'>): LightProfile {
  return color.finish ? FINISH_LIGHT[color.finish] : DEFAULT_PROFILE
}

export interface BladeHighlight {
  /** Força do reflexo, 0–1. */
  readonly intensity: number
  /** Onde o reflexo cai ao longo da lâmina: 0 = ponta, 1 = pivô. */
  readonly position: number
}

/**
 * Reflexo numa lâmina do leque, a partir do ângulo entre a lâmina e a luz.
 *
 * @param bladeAngleDeg ângulo da lâmina (0 = vertical, positivo = sentido horário)
 * @param lightX posição horizontal da luz relativa ao pivô, em px
 * @param lightY posição vertical da luz relativa ao pivô, em px (negativo = acima)
 * @param radius comprimento da lâmina, em px
 */
export function bladeHighlight(
  bladeAngleDeg: number,
  lightX: number,
  lightY: number,
  radius: number,
  profile: LightProfile,
): BladeHighlight {
  const distance = Math.max(1, Math.hypot(lightX, lightY))
  const angle = (bladeAngleDeg * Math.PI) / 180
  // Produto escalar entre a direção da lâmina e a direção da luz (ambos normalizados).
  const alignment = (Math.sin(angle) * lightX - Math.cos(angle) * lightY) / distance
  const facing = Math.max(0, alignment)
  const along = Math.min(1, Math.max(0, (distance * facing) / Math.max(1, radius)))
  return { intensity: facing ** profile.sharpness * profile.gain, position: 1 - along }
}

/** Slug do acabamento para atributos `data-finish` (usado no CSS). */
export function finishSlug(finish: Finish | undefined): string {
  switch (finish) {
    case 'Brilho':
      return 'brilho'
    case 'Metálico':
      return 'metalico'
    case 'Acetinado':
      return 'acetinado'
    case 'Cintilante':
      return 'cintilante'
    case 'Fosco':
      return 'fosco'
    case 'Textura':
      return 'textura'
    default:
      return 'padrao'
  }
}

/** O acabamento só vira etiqueta quando o nome da cor ainda não o diz ("Azul Marinho Brilho" não precisa de "Brilho"). */
export function finishLabel(color: Pick<AcmColor, 'name' | 'finish'>): string | null {
  if (!color.finish) return null
  return color.name.includes(color.finish) ? null : color.finish
}
