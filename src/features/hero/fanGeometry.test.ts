import { describe, expect, it } from 'vitest'
import {
  bladeBaseAngles,
  indexAtTop,
  rotationForIndex,
  rotationLimit,
  snapRotation,
} from './fanGeometry'

describe('geometria do leque', () => {
  it('distribui as lâminas simetricamente', () => {
    expect(bladeBaseAngles(3, 10)).toEqual([-10, 0, 10])
    expect(bladeBaseAngles(4, 10)).toEqual([-15, -5, 5, 15])
  })

  it('a rotação de uma lâmina a coloca exatamente no topo (ângulo 0)', () => {
    const base = bladeBaseAngles(44, 7.2)
    for (const index of [0, 10, 21, 22, 43]) {
      const rotation = rotationForIndex(index, 44, 7.2)
      expect((base[index] ?? NaN) + rotation).toBeCloseTo(0, 9)
      expect(indexAtTop(rotation, 44, 7.2)).toBe(index)
    }
  })

  it('nunca sai dos limites da sequência', () => {
    expect(indexAtTop(10_000, 44, 7.2)).toBe(0)
    expect(indexAtTop(-10_000, 44, 7.2)).toBe(43)
  })

  it('o limite de rotação deixa a primeira e a última lâmina chegarem ao topo', () => {
    const limit = rotationLimit(44, 7.2)
    expect(indexAtTop(limit, 44, 7.2)).toBe(0)
    expect(indexAtTop(-limit, 44, 7.2)).toBe(43)
  })

  it('o encaixe leva para a lâmina mais próxima', () => {
    const exact = rotationForIndex(30, 44, 7.2)
    expect(snapRotation(exact + 2, 44, 7.2)).toBeCloseTo(exact, 9)
    expect(snapRotation(exact - 3.5, 44, 7.2)).toBeCloseTo(exact, 9)
  })
})
