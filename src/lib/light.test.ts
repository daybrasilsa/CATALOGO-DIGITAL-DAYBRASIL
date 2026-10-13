import { describe, expect, it } from 'vitest'
import { bladeHighlight, finishLabel, finishSlug, FINISH_LIGHT, lightProfile } from './light'

const brilho = FINISH_LIGHT.Brilho

describe('bladeHighlight', () => {
  it('é máximo com a luz alinhada à lâmina', () => {
    // lâmina vertical (0°), luz logo acima do pivô
    const { intensity } = bladeHighlight(0, 0, -300, 400, brilho)
    expect(intensity).toBeCloseTo(brilho.gain, 5)
  })

  it('é zero com a luz do lado oposto', () => {
    expect(bladeHighlight(0, 0, 300, 400, brilho).intensity).toBe(0)
  })

  it('acabamento brilho tem reflexo mais estreito que o padrão', () => {
    const tilted = { x: Math.sin(Math.PI / 8) * 300, y: -Math.cos(Math.PI / 8) * 300 }
    const shiny = bladeHighlight(0, tilted.x, tilted.y, 400, brilho).intensity / brilho.gain
    const plainProfile = lightProfile({})
    const plain =
      bladeHighlight(0, tilted.x, tilted.y, 400, plainProfile).intensity / plainProfile.gain
    expect(shiny).toBeLessThan(plain)
  })

  it('posiciona o reflexo entre a ponta (0) e o pivô (1)', () => {
    const { position } = bladeHighlight(0, 0, -200, 400, brilho)
    expect(position).toBeCloseTo(0.5, 5)
  })
})

describe('finishSlug', () => {
  it('normaliza acentos para uso em CSS', () => {
    expect(finishSlug('Metálico')).toBe('metalico')
    expect(finishSlug(undefined)).toBe('padrao')
  })
})

describe('finishLabel', () => {
  it('não repete o acabamento que já está no nome', () => {
    expect(finishLabel({ name: 'Azul Marinho Brilho', finish: 'Brilho' })).toBeNull()
    expect(finishLabel({ name: 'Concreto', finish: 'Textura' })).toBe('Textura')
    expect(finishLabel({ name: 'Azul Royal' })).toBeNull()
  })
})
