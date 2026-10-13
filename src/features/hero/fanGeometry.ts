/**
 * Geometria do leque giratório (funções puras, sem DOM).
 *
 * Cada lâmina tem um ângulo-base fixo; o leque inteiro gira por `rotation`.
 * Ângulo na tela = base + rotation (0° = apontando para cima, positivo = horário).
 * A lâmina "da vez" é a que está mais perto de 0° (no topo, em cima do miolo).
 */

/** Centro da sequência (pode ser fracionário com quantidade par de lâminas). */
function center(count: number): number {
  return (count - 1) / 2
}

/** Ângulo-base de cada lâmina, distribuído simetricamente com `step` graus entre elas. */
export function bladeBaseAngles(count: number, step: number): number[] {
  return Array.from({ length: count }, (_, i) => (i - center(count)) * step)
}

/** Rotação do leque que coloca a lâmina `index` no topo. */
export function rotationForIndex(index: number, count: number, step: number): number {
  return (center(count) - index) * step
}

/** Lâmina mais próxima do topo para uma rotação. */
export function indexAtTop(rotation: number, count: number, step: number): number {
  const index = Math.round(center(count) - rotation / step)
  return Math.min(count - 1, Math.max(0, index))
}

/** Rotação máxima (para cada lado) que ainda deixa a primeira/última lâmina chegar ao topo. */
export function rotationLimit(count: number, step: number): number {
  return center(count) * step
}

/** Arredonda uma rotação para a lâmina mais próxima ficar exatamente no topo. */
export function snapRotation(rotation: number, count: number, step: number): number {
  return rotationForIndex(indexAtTop(rotation, count, step), count, step)
}
