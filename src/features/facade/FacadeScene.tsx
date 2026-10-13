import { useLayoutEffect, useRef, useState } from 'react'
import { requireColor } from '@/data/colors'
import { isLightSurface, textureStyle } from '@/lib/color'
import { cx } from '@/lib/cx'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { lightProfile } from '@/lib/light'
import type { FacadeZone, FacadeSelection } from '@/types/acm'
import type { CSSVars } from '@/types/css'
import { type FacadeCladding, initialCladding, syncCladding, visibleColor } from './cladding'
import { FACADE_GLASS, FACADE_PANELS, gridArea, SIGN_AREA } from './facadeLayout'
import styles from './FacadeScene.module.css'

interface FacadeSceneProps {
  selection: FacadeSelection
  motion: boolean
  className?: string
}

const ZONES: readonly FacadeZone[] = ['main', 'detail']

/** Atraso de cada placa: a troca "varre" a fachada da esquerda para a direita, de cima para baixo. */
function tileDelay(tile: HTMLElement): number {
  return Number(tile.dataset.col) * 0.06 + Number(tile.dataset.row) * 0.05
}

export function FacadeScene({ selection, motion, className }: FacadeSceneProps) {
  const sceneRef = useRef<HTMLElement>(null)
  const facadeRef = useRef<HTMLDivElement>(null)
  const glintRef = useRef<HTMLDivElement>(null)

  // Estado das faces derivado da seleção (padrão "ajustar estado quando a prop muda").
  const [cladding, setCladding] = useState<FacadeCladding>(() => initialCladding(selection))
  const synced = syncCladding(cladding, selection)
  if (synced !== cladding) setCladding(synced)

  const latest = useRef(cladding)
  const animatedTurns = useRef<Record<FacadeZone, number>>({ main: 0, detail: 0 })
  const installed = useRef(false)
  useLayoutEffect(() => {
    latest.current = cladding
  }, [cladding])

  const playGlint = (colorId: string, delay = 0) => {
    const glint = glintRef.current
    if (!glint) return
    glint.style.setProperty('--g', (lightProfile(requireColor(colorId)).gain * 0.55).toFixed(2))
    gsap.fromTo(
      glint,
      { backgroundPosition: '120% 0' },
      { backgroundPosition: '-20% 0', duration: 1.3, ease: 'power2.inOut', delay },
    )
  }

  // Montagem: na primeira vez que a fachada aparece, as placas giram para a parede.
  useGSAP(
    (_context, contextSafe) => {
      const tiles = gsap.utils.toArray<HTMLElement>('[data-tile]')
      const turnsOf = (tile: HTMLElement) => latest.current[tile.dataset.zone as FacadeZone].turns

      if (!motion) {
        installed.current = true
        tiles.forEach((tile) => gsap.set(tile, { rotationY: turnsOf(tile) * 180 }))
        return
      }
      if (installed.current) return

      tiles.forEach((tile) => gsap.set(tile, { rotationY: turnsOf(tile) * 180 - 90 }))
      const install = () => {
        installed.current = true
        tiles.forEach((tile) =>
          gsap.to(tile, {
            rotationY: turnsOf(tile) * 180,
            duration: 0.6,
            ease: 'back.out(1.6)',
            delay: tileDelay(tile),
            overwrite: 'auto',
          }),
        )
        playGlint(visibleColor(latest.current.main), 1)
      }
      ScrollTrigger.create({
        trigger: facadeRef.current,
        start: 'top 75%',
        once: true,
        onEnter: contextSafe ? contextSafe(install) : install,
      })
    },
    { scope: sceneRef, dependencies: [motion], revertOnUpdate: true },
  )

  // Troca de cor: só giram as placas da zona (principal/pórtico) que mudou.
  useGSAP(
    () => {
      const changed = ZONES.filter((zone) => cladding[zone].turns !== animatedTurns.current[zone])
      if (changed.length === 0) return
      const both = changed.length === 2

      for (const zone of changed) {
        const state = cladding[zone]
        animatedTurns.current[zone] = state.turns
        const tiles = gsap.utils.toArray<HTMLElement>(`[data-zone="${zone}"]`)
        const rotationY = state.turns * 180

        if (!motion) {
          gsap.set(tiles, { rotationY })
          continue
        }
        if (!installed.current) {
          // Ainda não montada: continua escondida, mas já na face certa.
          gsap.set(tiles, { rotationY: rotationY - 90 })
          continue
        }
        const offset = both && zone === 'detail' ? 0.38 : 0
        tiles.forEach((tile) =>
          gsap.to(tile, {
            rotationY,
            duration: 0.7,
            ease: 'power2.inOut',
            delay: tileDelay(tile) + offset,
            overwrite: 'auto',
          }),
        )
      }
      if (motion && installed.current) playGlint(selection.main, 0.45)
    },
    { scope: sceneRef, dependencies: [cladding.main.turns, cladding.detail.turns] },
  )

  const main = requireColor(selection.main)
  const detail = requireColor(selection.detail)
  const signStyle: CSSVars = {
    gridArea: SIGN_AREA,
    '--sign-c': isLightSurface(detail.hex) ? 'var(--ink)' : '#fff',
  }

  return (
    <figure ref={sceneRef} className={cx(styles.scene, className)}>
      <figcaption className="sr-only">
        Simulação de fachada de loja: revestimento {main.name} e pórtico {detail.name}.
      </figcaption>
      <div className={styles.building} aria-hidden="true">
        <div ref={facadeRef} className={styles.facade}>
          {FACADE_PANELS.map((panel) => {
            const state = cladding[panel.zone]
            const tileStyle: CSSVars = {
              gridArea: gridArea(panel),
              '--bs': panel.textureSize,
              '--px': panel.textureX,
              '--py': panel.textureY,
            }
            return (
              <div
                key={`${panel.zone}-${panel.row}-${panel.col}`}
                className={styles.tile}
                style={tileStyle}
                data-tile=""
                data-zone={panel.zone}
                data-row={panel.row}
                data-col={panel.col}
              >
                <div className={styles.face} style={textureStyle(requireColor(state.faces[0]))} />
                <div
                  className={cx(styles.face, styles.back)}
                  style={textureStyle(requireColor(state.faces[1]))}
                />
              </div>
            )
          })}
          {FACADE_GLASS.map((glass) => (
            <div
              key={`glass-${glass.row}-${glass.col}`}
              className={cx(styles.glass, styles[glass.kind])}
              style={{ gridArea: gridArea(glass) }}
            />
          ))}
          <div className={styles.sign} style={signStyle}>
            Sua marca
          </div>
        </div>
        <div className={styles.light} />
        <div ref={glintRef} className={styles.glint} />
      </div>
      <div className={styles.groundMobile} aria-hidden="true" />
    </figure>
  )
}
