/**
 * Ponto único de entrada do GSAP: registra os plugins uma vez.
 * Importe sempre daqui (`@/lib/gsap`), nunca direto de 'gsap'.
 */
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { Flip } from 'gsap/Flip'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, Draggable, InertiaPlugin)

export { Draggable, Flip, gsap, InertiaPlugin, ScrollTrigger, useGSAP }
