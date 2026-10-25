import { type KeyboardEvent, useRef, useState } from 'react'
import { PlateButton } from '@/components/PlateButton/PlateButton'
import { Swatch } from '@/components/Swatch/Swatch'
import { SITE } from '@/config/site'
import { FAMILY_LABEL } from '@/data/families'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { usePointerTilt } from '@/hooks/usePointerTilt'
import { textureStyle } from '@/lib/color'
import { gsap, useGSAP } from '@/lib/gsap'
import { setScrollLocked } from '@/lib/smoothScroll'
import type { AcmColor, OpenOrigin } from '@/types/acm'
import styles from './ColorDetailDialog.module.css'

interface ColorDetailDialogProps {
  /** Cor aberta. `null` = diálogo fechado. */
  color: AcmColor | null
  /** Elemento clicado, para a placa "sair" dele. */
  origin: OpenOrigin | null
  /** Posição na sequência navegável (respeita o filtro da cartela). */
  position: { index: number; total: number } | null
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  onShowOnFacade: (id: string) => void
}

const WIPE_HIDDEN_RIGHT = 'inset(0 0 0 100% round 14px)'
const WIPE_HIDDEN_LEFT = 'inset(0 100% 0 0 round 14px)'
const WIPE_VISIBLE = 'inset(0 0% 0 0% round 14px)'

export function ColorDetailDialog({
  color,
  origin,
  position,
  onPrev,
  onNext,
  onClose,
  onShowOnFacade,
}: ColorDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const swatchRef = useRef<HTMLSpanElement>(null)
  const incomingRef = useRef<HTMLSpanElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const direction = useRef<1 | -1>(1)
  const motion = !usePrefersReducedMotion()
  const isOpen = color !== null
  // A placa só existe com o diálogo aberto: o efeito precisa religar a cada abertura.
  // Funciona com mouse e com o dedo (o CSS da chapa reserva o arrasto para a inclinação).
  usePointerTilt(swatchRef, swatchRef, { enabled: isOpen, tilt: motion })

  // `shown` é a cor que está por inteiro na placa grande. Quando `color` muda com o
  // diálogo aberto, a nova cor entra por cima numa "cortina" e só depois vira `shown`.
  const [shown, setShown] = useState<AcmColor | null>(color)
  const [prevColor, setPrevColor] = useState<AcmColor | null>(color)
  if (color !== prevColor) {
    setPrevColor(color)
    // Abrindo ou fechando: troca direto, sem cortina.
    if (!color || !prevColor || !motion) setShown(color)
  }
  const incoming = color && shown && color.id !== shown.id ? color : null

  const { contextSafe } = useGSAP({ scope: dialogRef })

  // Abre/fecha o <dialog> nativo. showModal() já dá foco preso, fundo inerte e Esc.
  // Só reage a "abriu"/"fechou"; trocar de cor com ele aberto é a cortina, mais abaixo.
  useGSAP(
    () => {
      const dialog = dialogRef.current
      if (!dialog) return
      if (isOpen && !dialog.open) {
        lastFocus.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null
        dialog.showModal()
        setScrollLocked(true)
        if (motion) {
          playOpening(
            { inner: innerRef.current, wrap: wrapRef.current, info: infoRef.current },
            origin,
          )
        }
      } else if (!isOpen && dialog.open) {
        dialog.close()
        setScrollLocked(false)
        lastFocus.current?.focus({ preventScroll: true })
      }
    },
    { scope: dialogRef, dependencies: [isOpen] },
  )

  const requestClose = (after?: () => void) => {
    const done = after ?? onClose
    if (!motion) {
      done()
      return
    }
    // contextSafe: a animação fica registrada no contexto do componente e é limpa ao desmontar.
    contextSafe(() => {
      gsap
        .timeline({ onComplete: done })
        .to(
          infoRef.current?.children ?? [],
          { y: 14, opacity: 0, duration: 0.2, stagger: 0.02, ease: 'power2.in' },
          0,
        )
        .to(wrapRef.current, { scale: 0.9, opacity: 0, duration: 0.32, ease: 'power2.in' }, 0)
        .to(innerRef.current, { backgroundColor: 'rgb(180 181 178 / 0)', duration: 0.3 }, 0.05)
    })()
  }

  // Troca de cor com o diálogo aberto: cortina na placa + textos entrando de novo.
  useGSAP(
    () => {
      if (!incoming || !motion) return
      const from = direction.current > 0 ? WIPE_HIDDEN_RIGHT : WIPE_HIDDEN_LEFT
      const info = infoRef.current?.children ?? []
      gsap
        .timeline({ onComplete: () => setShown(incoming) })
        .fromTo(
          incomingRef.current,
          { clipPath: from },
          { clipPath: WIPE_VISIBLE, duration: 0.55, ease: 'expo.inOut', overwrite: 'auto' },
          0,
        )
        .fromTo(
          info,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.03, ease: 'power3.out' },
          0.05,
        )
    },
    { scope: dialogRef, dependencies: [incoming?.id] },
  )

  const go = (step: 1 | -1) => {
    direction.current = step
    if (step > 0) onNext()
    else onPrev()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(-1)
    }
  }

  const displayed = shown ?? color

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      // A rolagem suave da página não pode capturar a rolagem de dentro do diálogo.
      data-lenis-prevent
      aria-labelledby="detail-name"
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onKeyDown={onKeyDown}
      // Se o navegador fechar o diálogo sozinho (ex.: Esc repetido), sincroniza o estado.
      onClose={() => {
        setScrollLocked(false)
        onClose()
      }}
    >
      {color && displayed ? (
        <div ref={innerRef} className={styles.inner}>
          <div className={styles.stage}>
            <div ref={wrapRef} className={styles.wrap}>
              <Swatch ref={swatchRef} color={displayed} className={styles.swatch}>
                {incoming ? (
                  <span
                    ref={incomingRef}
                    className={styles.incoming}
                    style={textureStyle(incoming)}
                    aria-hidden="true"
                  />
                ) : null}
              </Swatch>
            </div>
          </div>

          <div ref={infoRef} className={styles.info}>
            <div className={styles.heading}>
              <p className={styles.family}>{FAMILY_LABEL[color.family]}</p>
              <h3 id="detail-name" className={styles.name}>
                {color.name}
              </h3>
            </div>
            <dl className={styles.specs}>
              {color.finish ? (
                <div className={styles.row}>
                  <dt>Acabamento</dt>
                  <dd>{color.finish}</dd>
                </div>
              ) : null}
            </dl>
            <p className={styles.note}>{SITE.colorNote}</p>
            <PlateButton onClick={() => requestClose(() => onShowOnFacade(color.id))}>
              Ver na fachada
            </PlateButton>
            <div className={styles.pager}>
              <button
                type="button"
                className={styles.pill}
                onClick={() => go(-1)}
                aria-label="Cor anterior"
              >
                ‹ Anterior
              </button>
              {position ? (
                <span className={styles.count} aria-live="polite">
                  {position.index + 1} de {position.total}
                </span>
              ) : null}
              <button
                type="button"
                className={styles.pill}
                onClick={() => go(1)}
                aria-label="Próxima cor"
              >
                Próxima ›
              </button>
            </div>
          </div>

          <button
            type="button"
            className={`${styles.pill} ${styles.close}`}
            onClick={() => requestClose()}
          >
            Fechar ✕
          </button>
        </div>
      ) : null}
    </dialog>
  )
}

interface OpeningTargets {
  inner: HTMLElement | null
  wrap: HTMLElement | null
  info: HTMLElement | null
}

/** Entrada do detalhe: a placa grande nasce no lugar e no formato do elemento clicado. */
function playOpening({ inner, wrap, info }: OpeningTargets, from: OpenOrigin | null) {
  gsap.fromTo(
    inner,
    { backgroundColor: 'rgb(180 181 178 / 0)' },
    { backgroundColor: 'rgb(180 181 178 / 1)', duration: 0.45, ease: 'power1.out' },
  )
  gsap.fromTo(
    info?.children ?? [],
    { y: 26, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, delay: 0.25, ease: 'power3.out', stagger: 0.05 },
  )
  if (!wrap || !from || !from.element.isConnected) return

  const source = from.element.getBoundingClientRect()
  const target = wrap.getBoundingClientRect()
  const rotated = Math.abs(from.angle) > 0.01
  // Lâmina girada: o lado comprido dela vira o lado comprido da placa.
  const sourceWidth = rotated ? from.element.offsetHeight : source.width
  const sourceHeight = rotated ? from.element.offsetWidth : source.height
  gsap.fromTo(
    wrap,
    {
      x: source.left + source.width / 2 - (target.left + target.width / 2),
      y: source.top + source.height / 2 - (target.top + target.height / 2),
      scaleX: sourceWidth / target.width,
      scaleY: sourceHeight / target.height,
      rotation: rotated ? from.angle - 90 : 0,
    },
    { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: 1, ease: 'expo.out' },
  )
}
