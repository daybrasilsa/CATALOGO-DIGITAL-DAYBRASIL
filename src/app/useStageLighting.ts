import { SECTION_IDS } from '@/config/site'
import { gsap, useGSAP } from '@/lib/gsap'

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * "Acender a luz": ao rolar do hero para a cartela, o fundo vai do palco escuro
 * para o cinza neutro; no rodapé, escurece de novo.
 * As cores vêm dos tokens CSS (fonte única da verdade).
 *
 * Cada animação mexe só no elemento que precisa mudar: a cor de fundo no <body> e a cor do
 * texto na cartela (a única seção sem cores próprias). Animar variáveis no <html>, como antes,
 * obrigava o navegador a recalcular o estilo da página inteira a cada quadro da rolagem.
 */
export function useStageLighting(enabled: boolean): void {
  useGSAP(
    () => {
      if (!enabled) return
      const root = document.documentElement
      const catalog = document.getElementById(SECTION_IDS.catalog)
      const stage = token('--stage')
      const booth = token('--booth')
      root.classList.add('is-scrub')

      gsap.fromTo(
        document.body,
        { backgroundColor: stage },
        {
          backgroundColor: booth,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: `#${SECTION_IDS.catalog}`,
            start: 'top 92%',
            end: 'top 40%',
            scrub: true,
          },
        },
      )
      if (catalog) {
        gsap.fromTo(
          catalog,
          { '--fg': token('--light'), '--fg-2': token('--light-2') },
          {
            '--fg': token('--ink'),
            '--fg-2': token('--ink-2'),
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: `#${SECTION_IDS.catalog}`,
              start: 'top 92%',
              end: 'top 40%',
              scrub: true,
            },
          },
        )
      }
      // O holofote azulado do palco apaga junto, senão vira uma faixa sobre o cinza.
      gsap.fromTo(
        '[data-anim="spotlight"]',
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: `#${SECTION_IDS.catalog}`,
            start: 'top 92%',
            end: 'top 40%',
            scrub: true,
          },
        },
      )
      gsap.fromTo(
        document.body,
        { backgroundColor: booth },
        {
          backgroundColor: stage,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: `#${SECTION_IDS.sample}`,
            start: 'top bottom',
            end: 'top 45%',
            scrub: true,
          },
        },
      )

      return () => root.classList.remove('is-scrub')
    },
    { dependencies: [enabled], revertOnUpdate: true },
  )
}
