/** Junta classes CSS ignorando valores vazios: cx('a', cond && 'b') */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
