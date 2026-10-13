import { describe, expect, it } from 'vitest'
import { ACM_COLORS } from '@/data/colors'
import { relativeLuminance } from '@/lib/color'
import { createSeededRandom } from '@/lib/random'
import { cladWith, initialCladding, pickRandomCombo, syncCladding, visibleColor } from './cladding'

describe('cladding (faces das placas)', () => {
  it('começa com as duas faces na cor inicial', () => {
    const state = initialCladding({ main: 'a', detail: 'b' })
    expect(visibleColor(state.main)).toBe('a')
    expect(visibleColor(state.detail)).toBe('b')
  })

  it('a cada troca a cor nova vai para a face escondida e a placa gira', () => {
    const start = initialCladding({ main: 'a', detail: 'b' }).main
    const once = cladWith(start, 'c')
    expect(once).toEqual({ faces: ['a', 'c'], turns: 1 })
    const twice = cladWith(once, 'd')
    expect(twice).toEqual({ faces: ['d', 'c'], turns: 2 })
    expect(visibleColor(twice)).toBe('d')
  })

  it('escolher a cor que já está visível não gira nada', () => {
    const state = initialCladding({ main: 'a', detail: 'b' })
    expect(syncCladding(state, { main: 'a', detail: 'b' })).toBe(state)
  })
})

describe('pickRandomCombo', () => {
  it('sorteia famílias diferentes, com contraste e diferente da atual', () => {
    const random = createSeededRandom(3)
    const current = { main: 'dark-grey', detail: 'amarelo-real' }
    for (let i = 0; i < 50; i++) {
      const combo = pickRandomCombo(ACM_COLORS, current, random)
      expect(combo.main).not.toBe(combo.detail)
      expect(combo).not.toEqual(current)
      const main = ACM_COLORS.find((c) => c.id === combo.main)
      const detail = ACM_COLORS.find((c) => c.id === combo.detail)
      expect(main && detail).toBeTruthy()
      expect(main!.family).not.toBe(detail!.family)
      const diff = Math.abs(relativeLuminance(main!.hex) - relativeLuminance(detail!.hex))
      expect(diff).toBeGreaterThanOrEqual(0.12)
    }
  })
})
