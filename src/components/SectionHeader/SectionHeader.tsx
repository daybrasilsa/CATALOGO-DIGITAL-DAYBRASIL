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
 * Cabeçalho de seção. Quando a seção aparece na tela (uma vez só), as letras do título sobem
 * uma a uma, como no título principal, mas sem "laminar" (mudar a largura da fonte): ver abaixo.
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
      const chars = gsap.utils.toArray<HTMLElement>('[data-anim="char"]')
      const body = gsap.utils.toArray<HTMLElement>('[data-anim="header-body"]')
      // Letras escondidas, mas já na largura final: a página é montada com a altura certa.
      gsap.set(chars, { yPercent: 105, opacity: 0 })
      gsap.set(body, { y: 18, opacity: 0 })
      // Só posição e opacidade, que a placa de vídeo anima sem refazer a página. Animar a largura
      // da fonte (como no título do topo) obriga o navegador a recalcular o layout a cada quadro;
      // aqui a animação roda enquanto a pessoa rola, e isso travava a rolagem (medido na
      // passagem da fachada para o rodapé). O título do topo anima uma vez, ao carregar, e fica.
      gsap
        .timeline({ scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true } })
        .to(chars, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.025 }, 0)
        .to(body, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.35)
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
