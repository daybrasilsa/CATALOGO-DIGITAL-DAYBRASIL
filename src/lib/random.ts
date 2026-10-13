/**
 * Gerador pseudoaleatório determinístico (Park–Miller).
 * Mesma semente, mesma sequência: a fachada fica idêntica a cada carregamento
 * e os testes são reproduzíveis.
 */
export function createSeededRandom(seed: number): () => number {
  let state = Math.abs(Math.trunc(seed)) % 2147483647
  if (state === 0) state = 2147483646
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}
