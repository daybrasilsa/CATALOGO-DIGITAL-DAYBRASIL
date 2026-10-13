import { Plaque } from '@/components/Plaque/Plaque'
import { PlateLink } from '@/components/PlateButton/PlateButton'
import { SectionHeader } from '@/components/SectionHeader/SectionHeader'
import { SECTION_IDS, SITE } from '@/config/site'
import styles from './SiteFooter.module.css'

export function SiteFooter() {
  return (
    <footer id={SECTION_IDS.sample} className={styles.footer} aria-labelledby="footer-title">
      <SectionHeader id="footer-title" title="Gostou de uma cor?">
        <p>
          Peça a amostra física ao seu vendedor {SITE.company} e confira o tom ao vivo, na luz real
          da obra.
        </p>
        <div className={styles.cta}>
          <PlateLink href={`#${SECTION_IDS.catalog}`}>Rever a cartela</PlateLink>
        </div>
      </SectionHeader>
      <div className={styles.bar}>
        <p className={styles.disclaimer}>
          <b>{SITE.disclaimer.lead}</b> {SITE.disclaimer.body}
        </p>
        <Plaque />
      </div>
    </footer>
  )
}
