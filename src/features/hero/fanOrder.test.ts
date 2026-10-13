import { describe, expect, it } from 'vitest'
import { ACM_COLORS } from '@/data/colors'
import type { AcmColor } from '@/types/acm'
import { fanOrder } from './fanOrder'

describe('fanOrder', () => {
  it('mantém todas as cores, cada uma uma única vez', () => {
    const ordered = fanOrder(ACM_COLORS)
    expect(ordered).toHaveLength(ACM_COLORS.length)
    expect(new Set(ordered.map((c) => c.id))).toEqual(new Set(ACM_COLORS.map((c) => c.id)))
  })

  it('vai dos frios escuros, passa pelos brancos e termina nos quentes', () => {
    const families = fanOrder(ACM_COLORS).map((c) => c.family)
    expect(families[0]).toBe('pretos')
    expect(families.at(-1)).toBe('texturas')
    const firstWhite = families.indexOf('brancos')
    expect(families.slice(0, firstWhite)).not.toContain('madeiras')
    expect(families.slice(firstWhite)).not.toContain('azuis')
  })

  it('madeiras ficam juntas, da mais clara para a mais escura', () => {
    const woods = fanOrder(ACM_COLORS).filter((c) => c.family === 'madeiras')
    expect(woods[0]?.id).toBe('madeira-carvalho')
    expect(woods.at(-1)?.id).toBe('madeira-sucupira')
  })

  it('não perde uma cor de família que ainda não está na sequência', () => {
    const extra = { ...ACM_COLORS[0], id: 'teste', family: 'novos' } as unknown as AcmColor
    expect(fanOrder([...ACM_COLORS, extra]).at(-1)?.id).toBe('teste')
  })
})
