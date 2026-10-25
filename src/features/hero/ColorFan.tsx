import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { FAMILY_LABEL } from '@/data/families'
import { isLightSurface, textureStyle } from '@/lib/color'
import { Draggable, gsap, useGSAP } from '@/lib/gsap'
import { bladeHighlight, colorLight, lightProfile } from '@/lib/light'
import type { AcmColor, OpenOrigin } from '@/types/acm'
import type { CSSVars } from '@/types/css'
import {
  bladeBaseAngles,
  indexAtTop,
  rotationForIndex,
  rotationLimit,
  snapRotation,
} from './fanGeometry'
import { INTRO } from './intro'
import styles from './ColorFan.module.css'

/** Graus entre uma lâmina e a próxima. */
const STEP = 7.2
/** Quanto o leque gira por pixel arrastado na horizontal. */
const DEG_PER_PX = 0.16
/** Onde a luz descansa depois da varredura de entrada (e em telas de toque). */
const REST_LIGHT_ANGLE = -38
/** Cor que começa no topo do leque. */
const START_COLOR_ID = 'branco-neve'
/** Um clique logo depois de um arrasto não abre a cor (foi o fim do gesto, não um clique). */
const CLICK_AFTER_DRAG_MS = 250

/** Escreve a variável CSS só se o valor mudou: escrever o mesmo valor também custa um recálculo. */
function setVar(element: HTMLElement, name: string, value: string): void {
  if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value)
}

interface ColorFanProps {
  /** Cores já na ordem do leque (veja fanOrder). */
  colors: readonly AcmColor[]
  motion: boolean
  finePointer: boolean
  onOpenColor: (id: string, origin: OpenOrigin) => void
}

/**
 * Leque de cores giratório.
 *
 * - As lâminas ficam num "disco" (wheel) que gira em torno do pivô no rodapé do hero.
 * - Arrastar na horizontal gira o disco, com inércia; ao soltar ele encaixa com uma lâmina no topo.
 * - A luz é fixa: quando o disco gira, os reflexos correm pelas lâminas conforme o acabamento.
 * - Teclado: setas giram e movem o foco (padrão toolbar do ARIA); Enter abre a cor.
 *
 * Tudo que muda a cada frame (rotação, reflexo) é escrito direto no DOM, sem setState.
 */
export function ColorFan({ colors, motion, finePointer, onOpenColor }: ColorFanProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const fanRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const bladeRefs = useRef<(HTMLButtonElement | null)[]>([])
  const bodyRefs = useRef<(HTMLSpanElement | null)[]>([])
  const sheenRefs = useRef<(HTMLSpanElement | null)[]>([])
  const proxyRef = useRef<HTMLDivElement | null>(null)
  const rotation = useRef(0)
  const light = useRef({ x: 0, y: -300 })
  const pointerLive = useRef(false)
  const lastDragEnd = useRef(0)
  const draggableRef = useRef<Draggable | null>(null)

  const count = colors.length
  const baseAngles = useMemo(() => bladeBaseAngles(count, STEP), [count])
  // Perfil de luz de cada lâmina, com o ganho limitado para o reflexo não cobrir a cor.
  // Calculado uma vez aqui, não a cada quadro do giro.
  const profiles = useMemo(
    () => colors.map((c) => ({ ...lightProfile(c), gain: colorLight(c).fanGain })),
    [colors],
  )
  const startIndex = useMemo(
    () =>
      Math.max(
        0,
        colors.findIndex((c) => c.id === START_COLOR_ID),
      ),
    [colors],
  )
  const [activeIndex, setActiveIndex] = useState(startIndex)
  const [focusIndex, setFocusIndex] = useState(startIndex)
  const [hovered, setHovered] = useState<AcmColor | null>(null)
  const [hasSpun, setHasSpun] = useState(false)

  const radius = () => bladeRefs.current[0]?.offsetHeight ?? 400

  /** Repinta reflexos, lado do nome e lâmina da vez para a rotação e a luz atuais. */
  const paint = useCallback(() => {
    // Primeiro todas as leituras de medida, depois todas as escritas: medir depois de escrever
    // obriga o navegador a recalcular o estilo na hora, no meio do quadro.
    const R = bladeRefs.current[0]?.offsetHeight ?? 400
    const f = fanRef.current?.getBoundingClientRect()
    const l = layerRef.current?.getBoundingClientRect()
    const { x, y } = light.current
    bladeRefs.current.forEach((blade, i) => {
      const sheen = sheenRefs.current[i]
      const profile = profiles[i]
      const base = baseAngles[i]
      if (!blade || !sheen || !profile || base === undefined) return
      const world = base + rotation.current
      const { intensity, position } = bladeHighlight(world, x, y, R, profile)
      // Variáveis no próprio reflexo: no botão, elas seriam herdadas e recalculariam a lâmina inteira.
      setVar(sheen, '--hl', intensity.toFixed(3))
      setVar(sheen, '--hy', position.toFixed(3))
      // Nome sempre legível: do lado esquerdo o texto não gira 180°.
      const side = world < 0 ? 'left' : 'right'
      if (blade.dataset.side !== side) blade.dataset.side = side
    })
    const spotlight = spotlightRef.current
    if (spotlight && f && l) {
      setVar(spotlight, '--sx', `${(((f.left + x - l.left) / l.width) * 100).toFixed(1)}%`)
      setVar(spotlight, '--sy', `${(((f.top + y - l.top) / l.height) * 100).toFixed(1)}%`)
    }
    const top = indexAtTop(rotation.current, count, STEP)
    setActiveIndex((current) => (current === top ? current : top))
  }, [profiles, baseAngles, count])

  /** Gira o disco (graus). Estilo direto no elemento: fora do contexto do GSAP de propósito. */
  const applyRotation = useCallback(
    (degrees: number) => {
      rotation.current = degrees
      // Pinta antes de girar: o paint() mede a página, e a medida precisa vir antes das escritas.
      paint()
      if (wheelRef.current) wheelRef.current.style.transform = `rotate(${degrees}deg)`
    },
    [paint],
  )

  const setLightFromAngle = useCallback(
    (angleDeg: number, distance = 0.85) => {
      const R = bladeRefs.current[0]?.offsetHeight ?? 400
      const a = (angleDeg * Math.PI) / 180
      light.current = { x: Math.sin(a) * R * distance, y: -Math.cos(a) * R * distance }
      paint()
    },
    [paint],
  )

  // Posição inicial antes da primeira pintura: cor de partida no topo e luz em repouso.
  useLayoutEffect(() => {
    rotation.current = rotationForIndex(startIndex, count, STEP)
    if (wheelRef.current) wheelRef.current.style.transform = `rotate(${rotation.current}deg)`
    setLightFromAngle(REST_LIGHT_ANGLE)
  }, [startIndex, count, setLightFromAngle])

  useEffect(() => {
    const onResize = () => {
      if (!pointerLive.current || !finePointer) setLightFromAngle(REST_LIGHT_ANGLE)
      else paint()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [finePointer, paint, setLightFromAngle])

  // Luz seguindo o cursor (só com mouse), no máximo um cálculo por frame.
  useEffect(() => {
    const host = layerRef.current?.parentElement
    if (!host || !finePointer) return
    let frame = 0
    let last: PointerEvent | null = null
    const onMove = (event: PointerEvent) => {
      last = event
      if (!pointerLive.current || frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const fan = fanRef.current
        if (!fan || !last) return
        const box = fan.getBoundingClientRect()
        light.current = { x: last.clientX - box.left, y: last.clientY - box.top }
        paint()
      })
    }
    host.addEventListener('pointermove', onMove)
    return () => {
      host.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [finePointer, paint])

  // Arrasto com inércia. Um "proxy" invisível guarda a posição x; ela vira rotação do disco.
  const { contextSafe } = useGSAP(
    () => {
      const fan = fanRef.current
      if (!fan) return
      const proxy = document.createElement('div')
      proxyRef.current = proxy
      const limit = rotationLimit(count, STEP) / DEG_PER_PX
      const snapX = (x: number) => snapRotation(x * DEG_PER_PX, count, STEP) / DEG_PER_PX
      const sync = () => applyRotation(Number(gsap.getProperty(proxy, 'x')) * DEG_PER_PX)
      gsap.set(proxy, { x: rotation.current / DEG_PER_PX })

      const [draggable] = Draggable.create(proxy, {
        type: 'x',
        trigger: fan,
        // As lâminas são <button>: precisam poder iniciar o arrasto também.
        dragClickables: true,
        minimumMovement: 6,
        bounds: { minX: -limit, maxX: limit },
        edgeResistance: 0.85,
        inertia: motion,
        snap: { x: snapX },
        cursor: 'grab',
        activeCursor: 'grabbing',
        onPress: () => {
          gsap.killTweensOf(proxy)
        },
        onDragStart: () => {
          // Durante o arrasto (e a inércia) o miolo mostra a lâmina do topo,
          // não a que estava sob o cursor quando o gesto começou.
          setHovered(null)
          setHasSpun(true)
        },
        onDrag: sync,
        onThrowUpdate: sync,
        onDragEnd: () => {
          lastDragEnd.current = performance.now()
        },
        onRelease: () => {
          // Sem inércia (movimento reduzido): encaixa na hora.
          if (!motion) {
            gsap.set(proxy, { x: snapX(Number(gsap.getProperty(proxy, 'x'))) })
            sync()
          }
        },
      })

      draggableRef.current = draggable ?? null

      return () => {
        draggableRef.current = null
        draggable?.kill()
        gsap.killTweensOf(proxy)
        proxyRef.current = null
      }
    },
    { scope: layerRef, dependencies: [motion, count, applyRotation] },
  )

  /** Gira até a lâmina `index` ficar no topo (teclado e convite inicial). */
  const rotateTo = (index: number) => {
    const proxy = proxyRef.current
    if (!proxy) return
    const x = rotationForIndex(index, count, STEP) / DEG_PER_PX
    const sync = () => applyRotation(Number(gsap.getProperty(proxy, 'x')) * DEG_PER_PX)
    contextSafe(() => {
      gsap.killTweensOf(proxy)
      if (!motion) {
        gsap.set(proxy, { x })
        sync()
        return
      }
      gsap.to(proxy, { x, duration: 0.7, ease: 'power3.out', onUpdate: sync })
    })()
  }

  // Entrada: lâminas sobem empilhadas, abrem do centro para fora, a luz varre o leque
  // e o disco dá um "empurrãozinho" para mostrar que gira.
  useGSAP(
    () => {
      if (!motion) {
        pointerLive.current = true
        return
      }
      pointerLive.current = false
      const blades = bladeRefs.current.filter((b): b is HTMLButtonElement => b !== null)
      const R = radius()
      const sweep = { angle: -100 }
      const followLight = () => setLightFromAngle(sweep.angle)
      const nudge = () => {
        const proxy = proxyRef.current
        if (!proxy) return
        const x0 = Number(gsap.getProperty(proxy, 'x'))
        const sync = () => applyRotation(Number(gsap.getProperty(proxy, 'x')) * DEG_PER_PX)
        gsap.to(proxy, {
          x: x0 - (2 * STEP) / DEG_PER_PX,
          duration: 0.6,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: 1,
          onUpdate: sync,
        })
      }

      gsap.set(blades, { rotation: 0, y: R * 0.55, opacity: 0 })
      gsap.set('[data-anim="hub"]', { yPercent: 100 })

      gsap
        .timeline({ delay: INTRO.delay })
        .to('[data-anim="hub"]', { yPercent: 0, duration: 0.8, ease: 'expo.out' }, INTRO.hubIn)
        .to(
          blades,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: { each: 0.01, from: 'center' },
          },
          INTRO.bladesRise,
        )
        .to(
          blades,
          {
            rotation: (i: number) => baseAngles[i] ?? 0,
            duration: 1.7,
            ease: 'expo.out',
            stagger: { each: 0.012, from: 'center' },
          },
          INTRO.bladesSpread,
        )
        .to(
          sweep,
          { angle: 100, duration: 2.1, ease: 'sine.inOut', onUpdate: followLight },
          INTRO.lightSweep,
        )
        .to(sweep, {
          angle: REST_LIGHT_ANGLE,
          duration: 1.1,
          ease: 'power2.inOut',
          onUpdate: followLight,
        })
        .call(nudge, [], '-=0.4')
        .call(() => {
          pointerLive.current = true
        })
    },
    { scope: layerRef, dependencies: [motion] },
  )

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = count - 1
    const keyMap: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowUp: index + 1,
      ArrowLeft: index - 1,
      ArrowDown: index - 1,
      Home: 0,
      End: last,
    }
    const target = keyMap[event.key]
    if (target === undefined) return
    event.preventDefault()
    const next = Math.min(last, Math.max(0, target))
    setFocusIndex(next)
    setHasSpun(true)
    bladeRefs.current[next]?.focus({ preventScroll: true })
    rotateTo(next)
  }

  const shown = hovered ?? colors[activeIndex] ?? null
  const hint = finePointer ? 'Arraste para girar' : 'Deslize para girar'

  return (
    <div ref={layerRef} className={styles.layer} data-anim="fan-layer">
      <div
        ref={spotlightRef}
        className={styles.spotlight}
        data-anim="spotlight"
        aria-hidden="true"
      />
      <div
        ref={fanRef}
        className={styles.fan}
        role="toolbar"
        aria-orientation="horizontal"
        aria-label={`Leque com as ${count} cores. Arraste ou use as setas para girar; Enter abre a cor.`}
      >
        <div ref={wheelRef} className={styles.wheel}>
          {colors.map((color, i) => {
            const bladeStyle: CSSVars = { '--a': `${baseAngles[i] ?? 0}deg`, '--z': i + 1 }
            return (
              <button
                key={color.id}
                ref={(el) => {
                  bladeRefs.current[i] = el
                }}
                type="button"
                className={styles.blade}
                style={bladeStyle}
                data-active={i === activeIndex ? '' : undefined}
                tabIndex={i === focusIndex ? 0 : -1}
                aria-label={`${color.name}. Ampliar`}
                onPointerEnter={() => {
                  // Com o leque em movimento (arrasto ou inércia) as lâminas passam sob o cursor parado.
                  const drag = draggableRef.current
                  if (drag?.isDragging || drag?.isThrowing) return
                  setHovered(color)
                }}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setFocusIndex(i)}
                onKeyDown={(event) => moveFocus(event, i)}
                onClick={() => {
                  if (performance.now() - lastDragEnd.current < CLICK_AFTER_DRAG_MS) return
                  const body = bodyRefs.current[i]
                  if (body)
                    onOpenColor(color.id, {
                      element: body,
                      angle: (baseAngles[i] ?? 0) + rotation.current,
                    })
                }}
              >
                <span
                  ref={(el) => {
                    bodyRefs.current[i] = el
                  }}
                  className={styles.body}
                  style={textureStyle(color)}
                >
                  <span
                    ref={(el) => {
                      sheenRefs.current[i] = el
                    }}
                    className={styles.sheen}
                    aria-hidden="true"
                  />
                  <span
                    className={`${styles.name} ${isLightSurface(color.hex) ? styles.onLight : styles.onDark}`}
                  >
                    {color.name}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <div className={styles.hub} data-anim="hub" aria-hidden="true">
          <span className={styles.hubName}>{shown?.name ?? `${count} cores`}</span>
          <span className={styles.hubSub}>
            {hasSpun && shown ? FAMILY_LABEL[shown.family] : hint}
          </span>
        </div>
      </div>
    </div>
  )
}
