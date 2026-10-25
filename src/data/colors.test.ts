import { describe, expect, it } from 'vitest'
import { DEFAULT_FACADE } from '@/config/site'
import { ACM_COLORS, findColor, requireColor } from './colors'
import { FAMILY_LABEL } from './families'

/**
 * Testes de integridade da cartela. Rodam a cada `npm test` e no CI:
 * pegam erros comuns ao adicionar uma cor nova.
 */
describe('cartela de cores', () => {
  it('tem cores', () => {
    expect(ACM_COLORS.length).toBeGreaterThan(0)
  })

  it('não repete ids nem nomes', () => {
    const ids = ACM_COLORS.map((c) => c.id)
    const names = ACM_COLORS.map((c) => c.name)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(names).size).toBe(names.length)
  })

  it.each(ACM_COLORS)('$name tem id em kebab-case, hex válido, família e textura', (color) => {
    expect(color.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    expect(color.hex).toMatch(/^#[0-9A-F]{6}$/)
    expect(Object.keys(FAMILY_LABEL)).toContain(color.family)
    expect(color.texture).toBeTruthy()
  })

  it('mantém cada família agrupada (a ordem do array é a ordem da cartela)', () => {
    // Sequência de famílias sem repetições consecutivas: se uma família aparecer
    // em dois blocos separados, ela se repete aqui.
    const blocks = ACM_COLORS.map((c) => c.family).filter((f, i, all) => f !== all[i - 1])
    expect(new Set(blocks).size).toBe(blocks.length)
  })

  it.each(ACM_COLORS)('$name usa a própria textura (arquivo <id>.webp)', (color) => {
    // Pega import trocado (ex.: a Madeira Cedro apontando para a textura da Mogno).
    // Nos testes o Vite não põe hash no nome: o arquivo tem que ser exatamente <id>.webp.
    // (Comparação exata: "madeira-carvalho" não pode passar apontando para "madeira-carvalho-dourado".)
    expect(color.texture.split('/').at(-1)).toBe(`${color.id}.webp`)
  })

  // Pares que são a mesma tinta (só muda o acabamento) e cuja imagem da pasta oficial estava
  // errada: o script corrige pela tabela TONE_FIXES. Conferidos na chapa física.
  it.each([
    ['azul-marinho-brilho', 'azul-marinho'],
    ['vermelho-intenso-brilho', 'vermelho-intenso'],
  ])('%s tem o mesmo tom de %s', (brilho, convencional) => {
    expect(requireColor(brilho).hex).toBe(requireColor(convencional).hex)
  })

  it('a combinação padrão da fachada usa cores que existem', () => {
    expect(findColor(DEFAULT_FACADE.main)).toBeDefined()
    expect(findColor(DEFAULT_FACADE.detail)).toBeDefined()
  })

  it('requireColor falha com mensagem clara para id inexistente', () => {
    expect(() => requireColor('nao-existe')).toThrow(/nao-existe/)
  })
})
