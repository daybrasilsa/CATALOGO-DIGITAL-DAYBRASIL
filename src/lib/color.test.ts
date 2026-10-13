import { describe, expect, it } from 'vitest'
import { isLightSurface, relativeLuminance, textureStyle } from './color'

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
