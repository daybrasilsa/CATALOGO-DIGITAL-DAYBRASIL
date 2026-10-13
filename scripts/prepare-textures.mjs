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
 *   3. Salva em src/assets/textures/<id>.webp e imprime o id, o nome e o tom médio (hex)
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

/** "Madeira Avelã" → "madeira-avela" */
export function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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

  // Tom médio do recorte, já em sRGB.
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

  const name = basename(file, extname(file))
  const id = slugify(name)
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
    const { id, name, hex, mode, kb } = await prepare(file)
    console.log(
      `${id.padEnd(28)} ${hex}  ${mode.padEnd(12)} ${kb.toFixed(0).padStart(4)} KB  ${name}`,
    )
  } catch (error) {
    failed++
    console.error(`ERRO  ${error instanceof Error ? error.message : error}`)
  }
}
process.exit(failed ? 1 : 0)
