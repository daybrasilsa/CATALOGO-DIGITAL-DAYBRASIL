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

/** Luminância relativa (fórmula do WCAG 2.x) de uma cor `#RRGGBB`, entre 0 e 1. */
export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!match) throw new Error(`Cor inválida (esperado #RRGGBB): ${hex}`)
  const [, r = '00', g = '00', b = '00'] = match
  return (
    0.2126 * linearChannel(parseInt(r, 16)) +
    0.7152 * linearChannel(parseInt(g, 16)) +
    0.0722 * linearChannel(parseInt(b, 16))
  )
}

export function isLightSurface(hex: string): boolean {
  return relativeLuminance(hex) > LIGHT_SURFACE_THRESHOLD
}

/** Estilo inline com a textura da placa. A cor de fundo aparece enquanto a imagem carrega. */
export function textureStyle(color: Pick<AcmColor, 'texture' | 'hex'>): CSSProperties {
  return { backgroundImage: `url("${color.texture}")`, backgroundColor: color.hex }
}
