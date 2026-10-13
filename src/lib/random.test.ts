import { describe, expect, it } from 'vitest'
import { createSeededRandom } from './random'

describe('createSeededRandom', () => {
  it('repete a mesma sequência para a mesma semente', () => {
    const a = createSeededRandom(7)
    const b = createSeededRandom(7)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('gera números em [0, 1)', () => {
    const random = createSeededRandom(42)
    for (let i = 0; i < 1000; i++) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})
