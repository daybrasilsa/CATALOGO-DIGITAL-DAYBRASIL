/**
 * Rolagem suave (Lenis) sincronizada com o GSAP/ScrollTrigger.
 *
 * Um único Lenis por página. Os componentes não falam com o Lenis direto:
 * usam `scrollToElement` e `setScrollLocked`, que funcionam com ou sem ele
 * (sem ele = movimento reduzido ou testes).
 */
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenis: Lenis | null = null

/** Liga a rolagem suave. Devolve a função que desliga (use no cleanup do efeito). */
export function startSmoothScroll(): () => void {
  const instance = new Lenis({
    // Curva com inércia curta: suave sem ficar "atrasada" em relação ao mouse.
    lerp: 0.1,
    wheelMultiplier: 1,
    // Links internos (#cores, #fachada...) também rolam suave.
    anchors: true,
    stopInertiaOnNavigate: true,
  })
  lenis = instance

  // O ScrollTrigger recalcula a cada passo da rolagem suave.
  const offScroll = instance.on('scroll', ScrollTrigger.update)
  // Um único relógio (o do GSAP) dirige animações e rolagem: evita tremidas.
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    offScroll()
    gsap.ticker.remove(tick)
    gsap.ticker.lagSmoothing(500, 33)
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

/** Rola até o elemento (suave quando o Lenis está ligado). */
export function scrollToElement(element: HTMLElement, smooth: boolean): void {
  if (lenis) {
    lenis.scrollTo(element, { duration: 1.1 })
    return
  }
  element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
}

/** Trava/destrava a rolagem da página (ex.: com o detalhe da cor aberto). */
export function setScrollLocked(locked: boolean): void {
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}
