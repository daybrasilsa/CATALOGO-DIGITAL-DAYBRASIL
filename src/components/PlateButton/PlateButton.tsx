import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'
import styles from './PlateButton.module.css'

/** Botão com cara de chapa de alumínio escovado. Para ações (abre, troca, sorteia). */
export function PlateButton({
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx(styles.plate, className)} {...props} />
}

/** Mesmo visual do PlateButton, mas é um link (navega para uma âncora ou página). */
export function PlateLink({
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cx(styles.plate, className)} {...props}>
      {children}
    </a>
  )
}
