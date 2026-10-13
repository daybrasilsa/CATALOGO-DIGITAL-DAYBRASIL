import { type RefObject, useEffect } from 'react'

interface PointerTiltOptions {
  /** Liga o efeito (normalmente: só com mouse). */
  enabled: boolean
  /** Inclina a placa em 3D. Desligue com movimento reduzido: o brilho continua seguindo o cursor. */
  tilt: boolean
}

const MAX_TILT_X = 9
const MAX_TILT_Y = 12

/**
 * Brilho e inclinação que seguem o cursor.
 * Escreve variáveis CSS direto no elemento (sem setState), para não re-renderizar a cada movimento do mouse.
 *
 * Variáveis: --mx, --my (posição do brilho), --rx, --ry (inclinação). Atributo: data-live.
 */
export function usePointerTilt(
  targetRef: RefObject<HTMLElement | null>,
  surfaceRef: RefObject<HTMLElement | null>,
  { enabled, tilt }: PointerTiltOptions,
): void {
  useEffect(() => {
    const target = targetRef.current
    const surface = surfaceRef.current
    if (!enabled || !target || !surface) return

    const onMove = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect()
      const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
      surface.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
      surface.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
      if (tilt) {
        surface.style.setProperty('--rx', `${((0.5 - y) * MAX_TILT_X).toFixed(2)}deg`)
        surface.style.setProperty('--ry', `${((x - 0.5) * MAX_TILT_Y).toFixed(2)}deg`)
      }
      surface.dataset.live = ''
    }
    const onLeave = () => {
      delete surface.dataset.live
      for (const prop of ['--mx', '--my', '--rx', '--ry']) surface.style.removeProperty(prop)
    }

    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerleave', onLeave)
    return () => {
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerleave', onLeave)
      onLeave()
    }
  }, [targetRef, surfaceRef, enabled, tilt])
}
