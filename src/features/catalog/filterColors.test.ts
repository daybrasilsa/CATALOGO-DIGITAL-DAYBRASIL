import { describe, expect, it } from 'vitest'
import { ACM_COLORS } from '@/data/colors'
import { FAMILY_LABEL } from '@/data/families'
import type { FamilyId } from '@/types/acm'
import { countByFilter, normalizeSearch, visibleIds } from './filterColors'

describe('filtro da cartela', () => {
  it('"todas" mostra a cartela inteira, na ordem original', () => {
    expect(visibleIds(ACM_COLORS, 'todas')).toEqual(ACM_COLORS.map((c) => c.id))
  })

  it('filtra por família', () => {
    const ids = visibleIds(ACM_COLORS, 'madeiras')
    expect(ids).toHaveLength(7)
    for (const id of ids) expect(id.startsWith('madeira-')).toBe(true)
  })

  it('cada cor pertence a exatamente uma família (a soma das famílias é o total)', () => {
    const families = Object.keys(FAMILY_LABEL) as FamilyId[]
    const sum = families.reduce((acc, f) => acc + countByFilter(ACM_COLORS, f), 0)
    expect(sum).toBe(ACM_COLORS.length)
  })
})

describe('busca', () => {
  it('ignora acentos e maiúsculas', () => {
    expect(normalizeSearch('  Madeira AVELÃ ')).toBe('madeira avela')
    expect(visibleIds(ACM_COLORS, 'todas', 'avela')).toEqual(['madeira-avela'])
    expect(visibleIds(ACM_COLORS, 'todas', 'finlandia')).toEqual(['verde-finlandia'])
  })

  it('combina busca e família', () => {
    expect(visibleIds(ACM_COLORS, 'cinzas', 'metálico')).toEqual([
      'prata-metalico',
      'cinza-metalico',
      'grafite-metalico',
    ])
    expect(visibleIds(ACM_COLORS, 'azuis', 'madeira')).toEqual([])
  })

  it('procura também no acabamento e na família', () => {
    expect(visibleIds(ACM_COLORS, 'todas', 'textura')).toEqual(['concreto', 'aco-corten'])
    // "cinza" traz a família inteira, inclusive Dark Grey e os grafites
    expect(visibleIds(ACM_COLORS, 'todas', 'cinza')).toEqual(visibleIds(ACM_COLORS, 'cinzas'))
    expect(visibleIds(ACM_COLORS, 'todas', 'cinza')).toContain('dark-grey')
  })

  it('não mistura famílias mistas: "laranja" não traz os amarelos', () => {
    expect(visibleIds(ACM_COLORS, 'todas', 'laranja')).toEqual([
      'laranja-silvestre-brilho',
      'laranja-silvestre',
    ])
  })

  it('os números dos filtros acompanham a busca', () => {
    expect(countByFilter(ACM_COLORS, 'todas', 'azul')).toBe(4)
    expect(countByFilter(ACM_COLORS, 'madeiras', 'azul')).toBe(0)
  })

  it('busca vazia não filtra nada', () => {
    expect(visibleIds(ACM_COLORS, 'todas', '   ')).toHaveLength(ACM_COLORS.length)
  })
})
