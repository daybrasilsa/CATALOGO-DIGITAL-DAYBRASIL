import { Fragment } from 'react'
import { cx } from '@/lib/cx'
import styles from './KineticTitle.module.css'

interface KineticTitleProps {
  id: string
  lines: readonly string[]
  as?: 'h1' | 'h2'
  /** Tamanho e espaçamento vêm de quem usa. */
  className?: string
}

/**
 * Título quebrado em letras (`data-anim="char"`) para a animação de largura variável
 * (as letras chegam estreitas e "laminam" até a largura máxima da fonte).
 * Leitores de tela ouvem o texto inteiro pelo aria-label; as letras soltas ficam ocultas.
 */
export function KineticTitle({ id, lines, as: Tag = 'h1', className }: KineticTitleProps) {
  return (
    <Tag id={id} className={cx(styles.title, className)} aria-label={lines.join(' ')}>
      {lines.map((line) => (
        <span key={line} className={styles.line} aria-hidden="true">
          {line.split(' ').map((word, wordIndex, words) => (
            <Fragment key={`${word}-${wordIndex}`}>
              <span className={styles.word}>
                {Array.from(word).map((char, charIndex) => (
                  <span key={charIndex} className={styles.char} data-anim="char">
                    {char}
                  </span>
                ))}
              </span>
              {wordIndex < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </span>
      ))}
    </Tag>
  )
}
