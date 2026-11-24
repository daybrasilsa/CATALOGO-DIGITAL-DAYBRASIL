import { useEffect, useRef, useState } from 'react'
import { BrandLogo } from '@/components/BrandLogo/BrandLogo'
import { SECTION_IDS } from '@/config/site'
import styles from './SiteNav.module.css'

const LINKS = [
  { href: `#${SECTION_IDS.catalog}`, label: 'Cores' },
  { href: `#${SECTION_IDS.facade}`, label: 'Fachada' },
  { href: `#${SECTION_IDS.sample}`, label: 'Amostra' },
] as const

/**
 * Menu do site, fixo no alto da tela. No topo da página fica transparente sobre o palco escuro;
 * na primeira rolada encolhe e ganha fundo próprio (escuro), para ser legível sobre qualquer seção.
 * Com o detalhe da cor aberto ele fica por baixo: o <dialog> cobre a tela inteira.
 */
export function SiteNav() {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [compact, setCompact] = useState(false)

  // Um marcador invisível no alto da página: quando ele sai da tela, a página rolou.
  // IntersectionObserver em vez de escutar a rolagem: não roda nada a cada quadro.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) setCompact(!entry.isIntersecting)
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <nav className={styles.nav} aria-label="Seções" data-compact={compact || undefined}>
        <a
          href={`#${SECTION_IDS.top}`}
          aria-label="DayBrasil, voltar ao topo"
          className={styles.home}
        >
          <BrandLogo variant="negative" className={styles.logo} />
        </a>
        <ul className={styles.links}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
