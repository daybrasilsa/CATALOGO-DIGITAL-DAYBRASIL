import { describe, expect, it } from 'vitest'
import {
  deltaE2000,
  hexToRgb,
  isLightSurface,
  relativeLuminance,
  rgbToLab,
  textureStyle,
} from './color'

describe('relativeLuminance', () => {
  it('vai de 0 (preto) a 1 (branco)', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5)
  })

  it('aceita hexadecimal minúsculo', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5)
  })

  it('rejeita formatos que não são #RRGGBB', () => {
    expect(() => relativeLuminance('#FFF')).toThrow(/inválida/)
    expect(() => relativeLuminance('azul')).toThrow(/inválida/)
  })
})

describe('hexToRgb', () => {
  it('separa os três canais', () => {
    expect(hexToRgb('#10286B')).toEqual([16, 40, 107])
  })
})

describe('rgbToLab', () => {
  it('branco tem claridade 100 e nenhuma cor', () => {
    const [L, a, b] = rgbToLab([255, 255, 255])
    expect(L).toBeCloseTo(100, 3)
    expect(a).toBeCloseTo(0, 3)
    expect(b).toBeCloseTo(0, 3)
  })

  it('confere com o valor de referência do Azul Marinho', () => {
    const [L, a, b] = rgbToLab([16, 40, 107])
    expect(L).toBeCloseTo(18.75, 2)
    expect(a).toBeCloseTo(18.52, 2)
    expect(b).toBeCloseTo(-41.59, 2)
  })
})

describe('deltaE2000', () => {
  it('é zero entre cores iguais', () => {
    expect(deltaE2000([50, 10, -20], [50, 10, -20])).toBe(0)
  })

  // Pares de referência de Sharma, Wu e Dalal (2005), a tabela oficial de teste do CIEDE2000.
  it.each([
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
    [[50, 0, 0], [50, -1, 2], 2.3669],
    [[50, 2.5, 0], [50, 0, -2.5], 4.3065],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
  ] as const)('%j × %j = %d', (lab1, lab2, expected) => {
    expect(deltaE2000(lab1, lab2)).toBeCloseTo(expected, 4)
  })
})

describe('isLightSurface', () => {
  it('pede texto escuro sobre cores claras e claro sobre escuras', () => {
    expect(isLightSurface('#F7F8F6')).toBe(true) // Branco Neve
    expect(isLightSurface('#10286B')).toBe(false) // Azul Marinho
  })
})

describe('textureStyle', () => {
  it('usa a textura e a cor de fundo enquanto a imagem carrega', () => {
    expect(textureStyle({ texture: '/a.webp', hex: '#123456' })).toEqual({
      backgroundImage: 'url("/a.webp")',
      backgroundColor: '#123456',
    })
  })
})
