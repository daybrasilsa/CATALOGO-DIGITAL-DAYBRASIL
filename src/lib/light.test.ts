import { describe, expect, it } from 'vitest'
import { ACM_COLORS, requireColor } from '@/data/colors'
import { deltaE2000, hexToRgb, rgbToLab } from './color'
import {
  bladeHighlight,
  CARD_GLARE,
  colorLight,
  FACADE_GLINT,
  FAN_SHEEN_ALPHA,
  finishLabel,
  finishSlug,
  FINISH_LIGHT,
  lighten,
  lightProfile,
} from './light'

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

describe('colorLight', () => {
  /** Quanto a cor muda com branco de opacidade `alpha` por cima. */
  const change = (hex: string, alpha: number) => {
    const rgb = hexToRgb(hex)
    return deltaE2000(rgbToLab(rgb), rgbToLab(lighten(rgb, alpha)))
  }

  it.each(ACM_COLORS)(
    '$name: o reflexo nunca cobre a cor (cartela, detalhe, leque e fachada)',
    (color) => {
      const { cardSheen, cardGlare, fanGain, glint } = colorLight(color)
      const limit = lightProfile(color).maxDeltaE + 0.01
      expect(change(color.hex, 1 - (1 - cardSheen) * (1 - cardGlare))).toBeLessThanOrEqual(limit)
      expect(change(color.hex, fanGain * FAN_SHEEN_ALPHA)).toBeLessThanOrEqual(limit)
      expect(change(color.hex, glint)).toBeLessThanOrEqual(limit)
    },
  )

  it('cores claras mantêm a luz que já tinham', () => {
    expect(colorLight(requireColor('branco-neve')).cardSheen).toBeCloseTo(
      lightProfile({}).cardGain,
      5,
    )
    const brancoBrilho = colorLight(requireColor('branco-neve-brilho'))
    expect(brancoBrilho.cardSheen).toBeCloseTo(FINISH_LIGHT.Brilho.cardGain, 5)
    expect(brancoBrilho.cardGlare).toBeCloseTo(CARD_GLARE, 5)
    expect(brancoBrilho.glint).toBeCloseTo(FINISH_LIGHT.Brilho.gain * FACADE_GLINT, 5)
  })

  it('placa escura recebe menos luz que a clara do mesmo acabamento', () => {
    const escura = colorLight(requireColor('preto-carbono-brilho'))
    const clara = colorLight(requireColor('branco-neve-brilho'))
    expect(escura.cardSheen).toBeLessThan(clara.cardSheen)
    expect(escura.fanGain).toBeLessThan(clara.fanGain)
  })

  it('só o acabamento brilho tem reflexo nítido', () => {
    expect(colorLight(requireColor('preto-carbono')).cardGlare).toBe(0)
    expect(colorLight(requireColor('preto-carbono-brilho')).cardGlare).toBeGreaterThan(0)
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
