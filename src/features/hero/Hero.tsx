import { useMemo, useRef } from 'react'
import { PlateLink } from '@/components/PlateButton/PlateButton'
import { SECTION_IDS } from '@/config/site'
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { gsap, useGSAP } from '@/lib/gsap'
import type { AcmColor, OpenOrigin } from '@/types/acm'
import { ColorFan } from './ColorFan'
import { fanOrder } from './fanOrder'
import { HeroNav } from './HeroNav'
import { INTRO } from './intro'
import { KineticTitle } from './KineticTitle'
import styles from './Hero.module.css'

interface HeroProps {
  colors: readonly AcmColor[]
  onOpenColor: (id: string, origin: OpenOrigin) => void
}

export function Hero({ colors, onOpenColor }: HeroProps) {
  const ref = useRef<HTMLElement>(null)
  const motion = !usePrefersReducedMotion()
  const finePointer = useFinePointer()
  const fanColors = useMemo(() => fanOrder(colors), [colors])

  useGSAP(
    () => {
      if (!motion) return
      const chars = gsap.utils.toArray<HTMLElement>('[data-anim="char"]')
      const side = gsap.utils.toArray<HTMLElement>('[data-anim="hero-side"]')

      // Entrada do título: letras sobem estreitas e "laminam" até a largura máxima.
      gsap.set(chars, { '--w': 62, yPercent: 105 })
      gsap.set(side, { y: 22, opacity: 0 })
      gsap
        .timeline({ delay: INTRO.delay })
        .to(chars, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.035 }, 0)
        .to(chars, { '--w': 125, duration: 1.4, ease: 'expo.inOut', stagger: 0.035 }, 0.1)
        .to(
          side,
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08 },
          INTRO.sideIn,
        )

      // Saída ao rolar: o texto sobe mais rápido que o leque (profundidade) e o leque afunda.
      const leave = { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.to('[data-anim="hero-copy"]', {
        yPercent: -22,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: leave,
      })
      gsap.to('[data-anim="fan-layer"]', {
        y: 110,
        scale: 0.94,
        ease: 'none',
        scrollTrigger: leave,
      })
    },
    { scope: ref, dependencies: [motion] },
  )

  return (
    <section ref={ref} id={SECTION_IDS.top} className={styles.hero} aria-labelledby="hero-title">
      <HeroNav />
      <div className={styles.copy} data-anim="hero-copy">
        <KineticTitle
          id="hero-title"
          lines={['Cartela de', 'cores ACM']}
          className={styles.title}
        />
        <div className={styles.side}>
          <p data-anim="hero-side">
            Lisas, brilho, metálicas e amadeiradas: <strong>{colors.length} cores de ACM</strong>{' '}
            para fachadas e comunicação visual. Gire o leque e toque numa lâmina para ver a cor de
            perto.
          </p>
          <div className={styles.actions} data-anim="hero-side">
            <PlateLink href={`#${SECTION_IDS.catalog}`}>Ver as {colors.length} cores</PlateLink>
            <a className={styles.textLink} href={`#${SECTION_IDS.facade}`}>
              Montar uma fachada
            </a>
          </div>
        </div>
      </div>
      <ColorFan
        colors={fanColors}
        motion={motion}
        finePointer={finePointer}
        onOpenColor={onOpenColor}
      />
    </section>
  )
}
