#!/usr/bin/env node
/**
 * Gera a textura (WebP) de cada cor a partir da imagem no MODELO PADRÃO DayBrasil (2000 × 1386 px).
 *
 * Uso:
 *   npm run textura -- "C:/caminho/Azul Royal.png" "C:/caminho/Madeira Cedro.png"
 *
 * O que faz, para cada arquivo:
 *   1. Converte para sRGB usando o perfil de cor embutido (algumas fotos vêm em Adobe RGB;
 *      sem essa conversão a cor fica errada no navegador).
 *   2. Acha a borda da placa e recorta uma janela fixa do miolo (sem borda arredondada,
 *      sem fundo e SEM redimensionar, para preservar veios e granulado).
 *   3. Se a cor estiver em TONE_FIXES, corrige o tom do recorte (veja a tabela abaixo).
 *   4. Salva em src/assets/textures/<id>.webp e imprime o id, o nome e o tom médio (hex)
 *      para você colar em src/data/colors.ts.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const TEMPLATE = { width: 2000, height: 1386 }
/** Janela recortada do miolo da placa (cabe com folga dentro de todas as variações do modelo). */
const CROP = { width: 888, height: 544 }
/** Onde procurar cada borda da placa no modelo (px). */
const SEARCH = { left: [470, 570], right: [1430, 1530], top: [340, 430], bottom: [950, 1050] }
/**
 * Placas lisas: WebP SEM PERDA (pixels idênticos à foto, arquivo de poucos KB).
 * Texturas (madeira, metálico, concreto) ficariam pesadas demais sem perda: usam qualidade 90,
 * que mantém a cor média praticamente idêntica (ΔE < 1) e o granulado/veio.
 */
const LOSSLESS_MAX_BYTES = 64 * 1024
const WEBP_LOSSLESS = { lossless: true, effort: 6 }
const WEBP_LOSSY = { quality: 90, effort: 6, smartSubsample: true }
const OUT_DIR = fileURLToPath(new URL('../src/assets/textures/', import.meta.url))
/**
 * Correções de tom: cores cuja imagem na pasta oficial NÃO bate com a chapa física.
 * Chave: id da cor. Valor: o tom médio certo (hex sRGB).
 * O script desloca a cor de todos os pixels do recorte, em Lab, até a média virar esse tom.
 * O desenho da foto (reflexo, veio, granulado) continua igual; só a cor muda.
 * Só entra aqui o que foi conferido na chapa física ou aprovado pelo responsável pelo
 * catálogo, com data, quem decidiu e o motivo.
 */
const TONE_FIXES = {
  // Mesma tinta da Azul Marinho, só que com acabamento brilhante; a imagem da pasta está roxa.
  // Conferido na chapa física pelo Andrei em 25/10/2026. Tom = hex da Azul Marinho.
  'azul-marinho-brilho': '#10286B',
  // Mesma tinta do Vermelho Intenso, com acabamento brilhante; a imagem da pasta está saturada
  // demais (mesmo padrão da Azul Marinho Brilho; o PDF de 2025 também mostra o mesmo tom).
  // Aprovado pelo Andrei em 25/10/2026, sem conferir a chapa. Tom = hex do Vermelho Intenso.
  'vermelho-intenso-brilho': '#BA211B',
}

/** "Madeira Avelã" → "madeira-avela" */
export function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** "#10286B" → [16, 40, 107] */
function hexToRgb(hex) {
  return [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16))
}

// Conversão sRGB ↔ CIELAB (iluminante D65). Lab separa claridade (L) de cor (a, b) e é
// a escala em que as diferenças de cor que o olho percebe são medidas (ΔE).
const WHITE = [0.95047, 1, 1.08883]
const EPS = (6 / 29) ** 3
const toLinear = (v) => {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const fromLinear = (c) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const labF = (t) => (t > EPS ? Math.cbrt(t) : t / (3 * (6 / 29) ** 2) + 4 / 29)
const labFInv = (t) => (t > 6 / 29 ? t ** 3 : 3 * (6 / 29) ** 2 * (t - 4 / 29))

function rgbToLab(r, g, b) {
  const [R, G, B] = [r, g, b].map(toLinear)
  const x = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / WHITE[0]
  const y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B
  const z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / WHITE[2]
  const fy = labF(y)
  return [116 * fy - 16, 500 * (labF(x) - fy), 200 * (fy - labF(z))]
}

function labToRgb(L, a, b) {
  const fy = (L + 16) / 116
  const x = labFInv(fy + a / 500) * WHITE[0]
  const y = labFInv(fy)
  const z = labFInv(fy - b / 200) * WHITE[2]
  const linear = [
    3.2404542 * x - 1.5371385 * y - 0.4985314 * z,
    -0.969266 * x + 1.8760108 * y + 0.041556 * z,
    0.0556434 * x - 0.2040259 * y + 1.0572252 * z,
  ]
  return linear.map((c) => Math.min(255, Math.max(0, Math.round(fromLinear(Math.max(0, c))))))
}

/**
 * Desloca a cor de cada pixel da região, em Lab, pela mesma distância: a cor média vira
 * `targetHex` e as variações entre os pixels (reflexo, granulado) ficam como estavam.
 * Altera `data` no lugar.
 */
function shiftTone(data, width, region, targetHex) {
  const n = region.width * region.height
  const lab = new Float64Array(n * 3)
  const sum = [0, 0, 0]
  let k = 0
  for (let y = region.top; y < region.top + region.height; y++) {
    for (let x = region.left; x < region.left + region.width; x++) {
      const i = (y * width + x) * 3
      const [L, a, b] = rgbToLab(data[i], data[i + 1], data[i + 2])
      lab[k] = L
      lab[k + 1] = a
      lab[k + 2] = b
      sum[0] += L
      sum[1] += a
      sum[2] += b
      k += 3
    }
  }
  const target = rgbToLab(...hexToRgb(targetHex))
  const shift = target.map((v, c) => v - sum[c] / n)
  k = 0
  for (let y = region.top; y < region.top + region.height; y++) {
    for (let x = region.left; x < region.left + region.width; x++) {
      const i = (y * width + x) * 3
      const [r, g, b] = labToRgb(lab[k] + shift[0], lab[k + 1] + shift[1], lab[k + 2] + shift[2])
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      k += 3
    }
  }
}

/** Índice da maior variação de brilho dentro de [from, to): é a borda da placa. */
function strongestEdge(profile, [from, to]) {
  let best = from
  let bestDiff = -1
  for (let i = from; i < to; i++) {
    const diff = Math.abs(profile[i + 1] - profile[i])
    if (diff > bestDiff) {
      bestDiff = diff
      best = i
    }
  }
  return best
}

async function prepare(file) {
  // .toColourspace('srgb') aplica o perfil ICC embutido antes de entregar os pixels.
  const { data, info } = await sharp(file)
    .toColourspace('srgb')
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  if (info.width !== TEMPLATE.width || info.height !== TEMPLATE.height) {
    throw new Error(
      `${basename(file)}: ${info.width}×${info.height}. O script só aceita o modelo padrão ${TEMPLATE.width}×${TEMPLATE.height}.`,
    )
  }

  const luminance = (x, y) => {
    const i = (y * info.width + x) * 3
    return (data[i] + data[i + 1] + data[i + 2]) / 3
  }
  // Perfis médios (várias linhas/colunas) para a borda não depender de um pixel isolado.
  const rowProfile = Array.from({ length: info.width }, (_, x) => {
    let sum = 0
    for (let y = 600; y < 780; y++) sum += luminance(x, y)
    return sum / 180
  })
  const colProfile = Array.from({ length: info.height }, (_, y) => {
    let sum = 0
    for (let x = 850; x < 1150; x++) sum += luminance(x, y)
    return sum / 300
  })
  const left = strongestEdge(rowProfile, SEARCH.left)
  const right = strongestEdge(rowProfile, SEARCH.right)
  const top = strongestEdge(colProfile, SEARCH.top)
  const bottom = strongestEdge(colProfile, SEARCH.bottom)

  const region = {
    left: Math.round((left + right - CROP.width) / 2),
    top: Math.round((top + bottom - CROP.height) / 2),
    width: CROP.width,
    height: CROP.height,
  }
  const margin = Math.min(
    region.left - left,
    right - (region.left + region.width),
    region.top - top,
    bottom - (region.top + region.height),
  )
  if (margin < 30) {
    throw new Error(
      `${basename(file)}: placa menor que o esperado (margem ${margin}px). Confira a imagem.`,
    )
  }

  const name = basename(file, extname(file))
  const id = slugify(name)
  const toneFix = TONE_FIXES[id]
  if (toneFix) shiftTone(data, info.width, region, toneFix)

  // Tom médio do recorte, já em sRGB (e já corrigido, se a cor estiver em TONE_FIXES).
  let r = 0
  let g = 0
  let b = 0
  for (let y = region.top; y < region.top + region.height; y++) {
    for (let x = region.left; x < region.left + region.width; x++) {
      const i = (y * info.width + x) * 3
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
    }
  }
  const n = region.width * region.height
  const hex = `#${[r, g, b]
    .map((v) =>
      Math.round(v / n)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
    .toUpperCase()}`

  const output = `${OUT_DIR}${id}.webp`
  const crop = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 3 },
  }).extract(region)
  const lossless = await crop.clone().webp(WEBP_LOSSLESS).toBuffer()
  const encoded =
    lossless.length <= LOSSLESS_MAX_BYTES
      ? lossless
      : await crop.clone().webp(WEBP_LOSSY).toBuffer()
  await writeFile(output, encoded)

  return {
    id,
    name,
    hex,
    output,
    mode: encoded === lossless ? 'sem perda' : 'qualidade 90',
    kb: encoded.length / 1024,
    fixed: Boolean(toneFix),
  }
}

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error('Uso: npm run textura -- "<imagem no modelo padrão>.png" [...]')
  process.exit(1)
}

await mkdir(OUT_DIR, { recursive: true })
let failed = 0
for (const file of files) {
  try {
    const { id, name, hex, mode, kb, fixed } = await prepare(file)
    console.log(
      `${id.padEnd(28)} ${hex}  ${mode.padEnd(12)} ${kb.toFixed(0).padStart(4)} KB  ${name}${fixed ? '  (tom corrigido)' : ''}`,
    )
  } catch (error) {
    failed++
    console.error(`ERRO  ${error instanceof Error ? error.message : error}`)
  }
}
process.exit(failed ? 1 : 0)
