import { type ReactNode, useRef } from 'react'
import { KineticTitle } from '@/features/hero/KineticTitle'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { cx } from '@/lib/cx'
import { gsap, useGSAP } from '@/lib/gsap'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  id: string
  title: string
  children?: ReactNode
  /** split: título à esquerda e texto à direita; stacked: um embaixo do outro. */
  layout?: 'split' | 'stacked'
  className?: string
}

/**
 * Cabeçalho de seção. O título entra com o mesmo efeito de "laminação" do título
 * principal, quando a seção aparece na tela (uma vez só).
 */
export function SectionHeader({
  id,
  title,
  children,
  layout = 'split',
  className,
}: SectionHeaderProps) {
  const ref = useRef<HTMLElement>(null)
  const motion = !usePrefersReducedMotion()

  useGSAP(
    () => {
      if (!motion) return
      const words = gsap.utils.toArray<HTMLElement>('[data-anim="word"]')
      const chars = gsap.utils.toArray<HTMLElement>('[data-anim="char"]')
      const body = gsap.utils.toArray<HTMLElement>('[data-anim="header-body"]')
      // Letras escondidas, mas ainda na largura final: a página é montada com a altura certa.
      gsap.set(chars, { yPercent: 105, opacity: 0 })
      gsap.set(body, { y: 18, opacity: 0 })
      gsap
        .timeline({ scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true } })
        // Trava a largura final de cada palavra antes de estreitar as letras: assim a quebra de
        // linha já fica onde vai terminar e o texto não pula de linha no meio da animação.
        .set(words, { width: (_: number, el: HTMLElement) => el.getBoundingClientRect().width }, 0)
        .set(chars, { '--w': 62 }, 0)
        .to(chars, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.025 }, 0)
        .to(chars, { '--w': 125, duration: 1.2, ease: 'expo.inOut', stagger: 0.025 }, 0.05)
        .to(body, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.35)
        // No fim, solta as larguras: o título volta a se ajustar se a tela mudar de tamanho.
        .set(words, { clearProps: 'width' })
    },
    { scope: ref, dependencies: [motion] },
  )

  return (
    <header ref={ref} className={cx(styles.header, styles[layout], className)}>
      <KineticTitle id={id} as="h2" lines={[title]} className={styles.title} />
      {children ? (
        <div className={styles.body} data-anim="header-body">
          {children}
        </div>
      ) : null}
    </header>
  )
}
