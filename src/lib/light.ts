import { deltaE2000, hexToRgb, type Rgb, rgbToLab } from '@/lib/color'
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
  /**
   * Quanto o reflexo pode mudar a cor da placa no ponto mais forte (ΔE2000).
   * Acima de 10 a cor parece outra: o reflexo tem que parecer luz, não cobrir a tinta.
   */
  readonly maxDeltaE: number
}

const DEFAULT_PROFILE: LightProfile = { sharpness: 5, gain: 0.36, cardGain: 0.34, maxDeltaE: 8 }

export const FINISH_LIGHT: Readonly<Record<Finish, LightProfile>> = {
  Brilho: { sharpness: 26, gain: 0.95, cardGain: 0.62, maxDeltaE: 12 },
  Metálico: { sharpness: 9, gain: 0.7, cardGain: 0.5, maxDeltaE: 10 },
  Acetinado: { sharpness: 6, gain: 0.5, cardGain: 0.4, maxDeltaE: 8 },
  Cintilante: { sharpness: 9, gain: 0.72, cardGain: 0.52, maxDeltaE: 10 },
  Fosco: { sharpness: 3, gain: 0.18, cardGain: 0.2, maxDeltaE: 8 },
  Textura: { sharpness: 4, gain: 0.26, cardGain: 0.26, maxDeltaE: 8 },
}

/** Opacidade do reflexo nítido (`.glare` do Swatch) nas placas de acabamento brilho. */
export const CARD_GLARE = 0.38
/** Opacidade do branco no reflexo das lâminas (`.sheen` em ColorFan.module.css). */
export const FAN_SHEEN_ALPHA = 0.95
/** Fração do ganho usada no reflexo que passa na fachada depois de cada troca. */
export const FACADE_GLINT = 0.55

export function lightProfile(color: Pick<AcmColor, 'finish'>): LightProfile {
  return color.finish ? FINISH_LIGHT[color.finish] : DEFAULT_PROFILE
}

/** Opacidades da luz de uma cor em cada lugar do site, já limitadas por `maxDeltaE`. */
export interface ColorLight {
  /** Placa (cartela e detalhe): brilho difuso que segue o cursor. */
  readonly cardSheen: number
  /** Placa (cartela e detalhe): reflexo nítido, só no acabamento brilho. */
  readonly cardGlare: number
  /** Leque: ganho do reflexo da lâmina (substitui `gain` do perfil). */
  readonly fanGain: number
  /** Fachada: opacidade do reflexo que passa depois de cada troca. */
  readonly glint: number
}

/** Cor que resulta de branco com opacidade `alpha` por cima (modo normal e `screen` dão o mesmo). */
export function lighten(rgb: Rgb, alpha: number): Rgb {
  const [r, g, b] = rgb
  return [r + alpha * (255 - r), g + alpha * (255 - g), b + alpha * (255 - b)]
}

/** Maior fator de 0 a 1 que mantém a mudança de cor no ponto mais forte dentro de `maxDeltaE`. */
function fitScale(hex: string, maxDeltaE: number, peakAlpha: (scale: number) => number): number {
  const rgb = hexToRgb(hex)
  const base = rgbToLab(rgb)
  const fits = (scale: number) =>
    deltaE2000(base, rgbToLab(lighten(rgb, peakAlpha(scale)))) <= maxDeltaE
  if (fits(1)) return 1
  // Busca binária: 12 passos já dão precisão de 1/4096 no fator, bem abaixo do que o olho nota.
  let low = 0
  let high = 1
  for (let step = 0; step < 12; step++) {
    const mid = (low + high) / 2
    if (fits(mid)) low = mid
    else high = mid
  }
  return low
}

const lightCache = new Map<string, ColorLight>()

/**
 * Luz de uma cor em cada lugar do site, sem cobrir a cor da placa.
 *
 * O reflexo é branco por cima da placa. A mesma opacidade muda muito mais uma placa escura
 * que uma clara (no Preto Carbono Brilho, o pico virava cinza claro). Por isso a opacidade de
 * cada cor é reduzida até a mudança no ponto mais forte caber no `maxDeltaE` do acabamento.
 * Cores claras, que já cabiam, ficam como estavam.
 */
export function colorLight(color: Pick<AcmColor, 'finish' | 'hex'>): ColorLight {
  const key = `${color.finish ?? ''}${color.hex}`
  const cached = lightCache.get(key)
  if (cached) return cached
  const profile = lightProfile(color)
  const glare = color.finish === 'Brilho' ? CARD_GLARE : 0
  const fit = (peakAlpha: (scale: number) => number) =>
    fitScale(color.hex, profile.maxDeltaE, peakAlpha)
  // Na placa, os dois reflexos se somam no ponto mais forte (com o mouse em cima).
  const card = fit((s) => 1 - (1 - s * profile.cardGain) * (1 - s * glare))
  const fan = fit((s) => s * profile.gain * FAN_SHEEN_ALPHA)
  const glint = fit((s) => s * profile.gain * FACADE_GLINT)
  const light: ColorLight = {
    cardSheen: card * profile.cardGain,
    cardGlare: card * glare,
    fanGain: fan * profile.gain,
    glint: glint * profile.gain * FACADE_GLINT,
  }
  lightCache.set(key, light)
  return light
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
