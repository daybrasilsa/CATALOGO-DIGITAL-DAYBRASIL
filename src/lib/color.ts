import type { CSSProperties } from 'react'
import type { AcmColor } from '@/types/acm'

/**
 * Acima desta luminância o texto sobre a cor passa a ser escuro.
 * Valor ajustado visualmente para a cartela atual.
 */
export const LIGHT_SURFACE_THRESHOLD = 0.33

function linearChannel(value: number): number {
  const v = value / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/** Canais de uma cor `#RRGGBB`, de 0 a 255: "#10286B" → [16, 40, 107]. */
export function hexToRgb(hex: string): Rgb {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!match) throw new Error(`Cor inválida (esperado #RRGGBB): ${hex}`)
  const [, r = '00', g = '00', b = '00'] = match
  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)]
}

/** Luminância relativa (fórmula do WCAG 2.x) de uma cor `#RRGGBB`, entre 0 e 1. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b)
}

/** Cor sRGB com cada canal de 0 a 255. */
export type Rgb = readonly [r: number, g: number, b: number]
/** Cor na escala CIELAB: L = claridade (0 a 100); a e b = a cor em si. */
export type Lab = readonly [L: number, a: number, b: number]

const D65_WHITE = [0.95047, 1, 1.08883] as const
const labF = (t: number) => (t > (6 / 29) ** 3 ? Math.cbrt(t) : t / (3 * (6 / 29) ** 2) + 4 / 29)

/** Converte sRGB para CIELAB (iluminante D65), a escala em que se mede diferença de cor. */
export function rgbToLab([r, g, b]: Rgb): Lab {
  const [R, G, B] = [linearChannel(r), linearChannel(g), linearChannel(b)]
  const x = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / D65_WHITE[0]
  const y = (0.2126729 * R + 0.7151522 * G + 0.072175 * B) / D65_WHITE[1]
  const z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / D65_WHITE[2]
  const fy = labF(y)
  return [116 * fy - 16, 500 * (labF(x) - fy), 200 * (fy - labF(z))]
}

const DEG = Math.PI / 180

/**
 * Diferença de cor como o olho percebe (CIEDE2000, ou ΔE00).
 * Leitura: abaixo de 1 ninguém nota; 2 a 3 nota quem compara lado a lado; acima de 10 parece outra cor.
 */
export function deltaE2000([L1, a1, b1]: Lab, [L2, a2, b2]: Lab): number {
  const C7 = ((Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2) ** 7
  const G = 0.5 * (1 - Math.sqrt(C7 / (C7 + 25 ** 7)))
  const a1p = (1 + G) * a1
  const a2p = (1 + G) * a2
  const C1 = Math.hypot(a1p, b1)
  const C2 = Math.hypot(a2p, b2)
  const hue = (b: number, a: number) =>
    a === 0 && b === 0 ? 0 : (Math.atan2(b, a) / DEG + 360) % 360
  const h1 = hue(b1, a1p)
  const h2 = hue(b2, a2p)
  const neutral = C1 * C2 === 0
  let dh = h2 - h1
  if (neutral) dh = 0
  else if (dh > 180) dh -= 360
  else if (dh < -180) dh += 360
  let hm = h1 + h2
  if (!neutral) hm = Math.abs(h1 - h2) <= 180 ? hm / 2 : hm < 360 ? (hm + 360) / 2 : (hm - 360) / 2
  const Lm = (L1 + L2) / 2
  const Cm = (C1 + C2) / 2
  const T =
    1 -
    0.17 * Math.cos((hm - 30) * DEG) +
    0.24 * Math.cos(2 * hm * DEG) +
    0.32 * Math.cos((3 * hm + 6) * DEG) -
    0.2 * Math.cos((4 * hm - 63) * DEG)
  const SL = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2)
  const SC = 1 + 0.045 * Cm
  const SH = 1 + 0.015 * Cm * T
  const RT =
    -2 *
    Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)) *
    Math.sin(60 * Math.exp(-(((hm - 275) / 25) ** 2)) * DEG)
  const dL = (L2 - L1) / SL
  const dC = (C2 - C1) / SC
  const dH = (2 * Math.sqrt(C1 * C2) * Math.sin((dh / 2) * DEG)) / SH
  return Math.sqrt(dL ** 2 + dC ** 2 + dH ** 2 + RT * dC * dH)
}

export function isLightSurface(hex: string): boolean {
  return relativeLuminance(hex) > LIGHT_SURFACE_THRESHOLD
}

/** Estilo inline com a textura da placa. A cor de fundo aparece enquanto a imagem carrega. */
export function textureStyle(color: Pick<AcmColor, 'texture' | 'hex'>): CSSProperties {
  return { backgroundImage: `url("${color.texture}")`, backgroundColor: color.hex }
}
