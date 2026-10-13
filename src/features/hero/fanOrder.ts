import { relativeLuminance } from '@/lib/color'
import type { AcmColor, FamilyId } from '@/types/acm'

/**
 * Sequência do leque, da esquerda para a direita: um espectro que vai dos tons frios e
 * escuros (pretos, azuis, verdes) clareando pelos cinzas até os brancos no topo, e desce
 * pelos quentes (amarelos, vermelhos, marrons, madeiras, texturas).
 * A ordem dentro de cada grupo sai da luminância: ninguém precisa manter lista manual.
 */
const FAN_SEQUENCE: readonly { families: readonly FamilyId[]; direction: 'asc' | 'desc' }[] = [
  { families: ['pretos'], direction: 'asc' },
  { families: ['azuis'], direction: 'asc' },
  { families: ['verdes'], direction: 'asc' },
  { families: ['cinzas'], direction: 'asc' },
  { families: ['brancos'], direction: 'asc' },
  { families: ['amarelos'], direction: 'desc' },
  { families: ['vermelhos'], direction: 'desc' },
  { families: ['marrons'], direction: 'desc' },
  { families: ['madeiras'], direction: 'desc' },
  { families: ['texturas'], direction: 'desc' },
]

/** Ordena as cores para o leque. Toda cor aparece exatamente uma vez. */
export function fanOrder(colors: readonly AcmColor[]): AcmColor[] {
  const placed = new Set<string>()
  const ordered: AcmColor[] = []
  for (const { families, direction } of FAN_SEQUENCE) {
    const group = colors
      .filter((c) => families.includes(c.family))
      .sort((a, b) => {
        const diff = relativeLuminance(a.hex) - relativeLuminance(b.hex)
        return direction === 'asc' ? diff : -diff
      })
    for (const color of group) {
      ordered.push(color)
      placed.add(color.id)
    }
  }
  // Rede de segurança: uma família nova que ainda não está na sequência vai para o fim.
  return [...ordered, ...colors.filter((c) => !placed.has(c.id))]
}
