import { BrandLogo } from '@/components/BrandLogo/BrandLogo'
import { SECTION_IDS } from '@/config/site'
import styles from './HeroNav.module.css'

const LINKS = [
  { href: `#${SECTION_IDS.catalog}`, label: 'Cores' },
  { href: `#${SECTION_IDS.facade}`, label: 'Fachada' },
  { href: `#${SECTION_IDS.sample}`, label: 'Amostra' },
] as const

export function HeroNav() {
  return (
    <nav className={styles.nav} aria-label="Seções">
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
  )
}
