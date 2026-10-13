import type { AcmColor } from '@/types/acm'

import acoCorten from '@/assets/textures/aco-corten.webp'
import amareloReal from '@/assets/textures/amarelo-real.webp'
import amareloRealBrilho from '@/assets/textures/amarelo-real-brilho.webp'
import azulMarinho from '@/assets/textures/azul-marinho.webp'
import azulMarinhoBrilho from '@/assets/textures/azul-marinho-brilho.webp'
import azulNoturno from '@/assets/textures/azul-noturno.webp'
import azulRoyal from '@/assets/textures/azul-royal.webp'
import brancoNeve from '@/assets/textures/branco-neve.webp'
import brancoNeveBrilho from '@/assets/textures/branco-neve-brilho.webp'
import bronze1003 from '@/assets/textures/bronze-1003.webp'
import champagneMetalico from '@/assets/textures/champagne-metalico.webp'
import cinzaAcetinado from '@/assets/textures/cinza-acetinado.webp'
import cinzaAcetinadoGeely from '@/assets/textures/cinza-acetinado-geely.webp'
import cinzaEscuro from '@/assets/textures/cinza-escuro.webp'
import cinzaGrey from '@/assets/textures/cinza-grey.webp'
import cinzaMetalico from '@/assets/textures/cinza-metalico.webp'
import cinzaRal7037 from '@/assets/textures/cinza-ral-7037.webp'
import cinzaSteel from '@/assets/textures/cinza-steel.webp'
import concreto from '@/assets/textures/concreto.webp'
import darkGrey from '@/assets/textures/dark-grey.webp'
import grafiteChumbo from '@/assets/textures/grafite-chumbo.webp'
import grafiteMetalico from '@/assets/textures/grafite-metalico.webp'
import laranjaSilvestre from '@/assets/textures/laranja-silvestre.webp'
import laranjaSilvestreBrilho from '@/assets/textures/laranja-silvestre-brilho.webp'
import madeiraAvela from '@/assets/textures/madeira-avela.webp'
import madeiraCarvalho from '@/assets/textures/madeira-carvalho.webp'
import madeiraCarvalhoDourado from '@/assets/textures/madeira-carvalho-dourado.webp'
import madeiraCedro from '@/assets/textures/madeira-cedro.webp'
import madeiraMogno from '@/assets/textures/madeira-mogno.webp'
import madeiraSucupira from '@/assets/textures/madeira-sucupira.webp'
import madeiraVintage from '@/assets/textures/madeira-vintage.webp'
import marrom from '@/assets/textures/marrom.webp'
import prataMetalico from '@/assets/textures/prata-metalico.webp'
import pretoCarbono from '@/assets/textures/preto-carbono.webp'
import pretoCarbonoBrilho from '@/assets/textures/preto-carbono-brilho.webp'
import verdeBr from '@/assets/textures/verde-br.webp'
import verdeEscuro from '@/assets/textures/verde-escuro.webp'
import verdeFinlandia from '@/assets/textures/verde-finlandia.webp'
import verdeFolha from '@/assets/textures/verde-folha.webp'
import verdeFoscoLocaliza from '@/assets/textures/verde-fosco-localiza.webp'
import vermelhoIntenso from '@/assets/textures/vermelho-intenso.webp'
import vermelhoIntensoBrilho from '@/assets/textures/vermelho-intenso-brilho.webp'
import vermelhoKarmin from '@/assets/textures/vermelho-karmin.webp'
import vinhoCintilante from '@/assets/textures/vinho-cintilante.webp'

/**
 * Cartela de cores de ACM.
 *
 * A ORDEM deste array é a ordem de exibição na cartela (agrupada por família).
 * Para adicionar uma cor, siga o passo a passo do README ("Como adicionar uma cor").
 *
 * `hex` é o tom médio da foto de cada placa, já convertido para sRGB pelo script
 * `npm run textura`: serve para a interface, não como referência de especificação.
 */
export const ACM_COLORS: readonly AcmColor[] = [
  // Brancos
  {
    id: 'branco-neve-brilho',
    name: 'Branco Neve Brilho',
    family: 'brancos',
    finish: 'Brilho',
    hex: '#FBFCFA',
    texture: brancoNeveBrilho,
  },
  {
    id: 'branco-neve',
    name: 'Branco Neve',
    family: 'brancos',
    hex: '#F7F8F6',
    texture: brancoNeve,
  },

  // Amarelos e laranjas
  {
    id: 'amarelo-real-brilho',
    name: 'Amarelo Real Brilho',
    family: 'amarelos',
    finish: 'Brilho',
    hex: '#FFBF00',
    texture: amareloRealBrilho,
  },
  {
    id: 'amarelo-real',
    name: 'Amarelo Real',
    family: 'amarelos',
    hex: '#F5C70B',
    texture: amareloReal,
  },
  {
    id: 'laranja-silvestre-brilho',
    name: 'Laranja Silvestre Brilho',
    family: 'amarelos',
    finish: 'Brilho',
    hex: '#EA7735',
    texture: laranjaSilvestreBrilho,
  },
  {
    id: 'laranja-silvestre',
    name: 'Laranja Silvestre',
    family: 'amarelos',
    hex: '#D66424',
    texture: laranjaSilvestre,
  },

  // Vermelhos e vinho
  {
    id: 'vermelho-intenso-brilho',
    name: 'Vermelho Intenso Brilho',
    family: 'vermelhos',
    finish: 'Brilho',
    hex: '#F40000',
    texture: vermelhoIntensoBrilho,
  },
  {
    id: 'vermelho-intenso',
    name: 'Vermelho Intenso',
    family: 'vermelhos',
    hex: '#BA211B',
    texture: vermelhoIntenso,
  },
  {
    id: 'vermelho-karmin',
    name: 'Vermelho Karmin',
    family: 'vermelhos',
    hex: '#930001',
    texture: vermelhoKarmin,
  },
  {
    id: 'vinho-cintilante',
    name: 'Vinho Cintilante',
    family: 'vermelhos',
    finish: 'Cintilante',
    hex: '#8E1424',
    texture: vinhoCintilante,
  },

  // Azuis
  { id: 'azul-royal', name: 'Azul Royal', family: 'azuis', hex: '#005BB4', texture: azulRoyal },
  {
    id: 'azul-marinho-brilho',
    name: 'Azul Marinho Brilho',
    family: 'azuis',
    finish: 'Brilho',
    hex: '#3D28CD',
    texture: azulMarinhoBrilho,
  },
  {
    id: 'azul-marinho',
    name: 'Azul Marinho',
    family: 'azuis',
    hex: '#10286B',
    texture: azulMarinho,
  },
  {
    id: 'azul-noturno',
    name: 'Azul Noturno',
    family: 'azuis',
    hex: '#1A2A41',
    texture: azulNoturno,
  },

  // Verdes
  { id: 'verde-folha', name: 'Verde Folha', family: 'verdes', hex: '#15C423', texture: verdeFolha },
  {
    id: 'verde-finlandia',
    name: 'Verde Finlândia',
    family: 'verdes',
    hex: '#00757D',
    texture: verdeFinlandia,
  },
  { id: 'verde-br', name: 'Verde BR', family: 'verdes', hex: '#237348', texture: verdeBr },
  {
    id: 'verde-fosco-localiza',
    name: 'Verde Fosco Localiza',
    family: 'verdes',
    finish: 'Fosco',
    hex: '#006A29',
    texture: verdeFoscoLocaliza,
  },
  {
    id: 'verde-escuro',
    name: 'Verde Escuro',
    family: 'verdes',
    hex: '#00485C',
    texture: verdeEscuro,
  },

  // Cinzas e grafites
  {
    id: 'prata-metalico',
    name: 'Prata Metálico',
    family: 'cinzas',
    finish: 'Metálico',
    hex: '#DBD6CF',
    texture: prataMetalico,
  },
  {
    id: 'cinza-metalico',
    name: 'Cinza Metálico',
    family: 'cinzas',
    finish: 'Metálico',
    hex: '#D1D1D1',
    texture: cinzaMetalico,
  },
  {
    id: 'cinza-acetinado',
    name: 'Cinza Acetinado',
    family: 'cinzas',
    finish: 'Acetinado',
    hex: '#BDBEC2',
    texture: cinzaAcetinado,
  },
  {
    id: 'cinza-acetinado-geely',
    name: 'Cinza Acetinado Geely',
    family: 'cinzas',
    finish: 'Acetinado',
    hex: '#BEBCB9',
    texture: cinzaAcetinadoGeely,
  },
  {
    id: 'cinza-ral-7037',
    name: 'Cinza RAL 7037',
    family: 'cinzas',
    hex: '#807C75',
    texture: cinzaRal7037,
  },
  { id: 'cinza-steel', name: 'Cinza Steel', family: 'cinzas', hex: '#686A65', texture: cinzaSteel },
  {
    id: 'grafite-chumbo',
    name: 'Grafite Chumbo',
    family: 'cinzas',
    hex: '#615E5B',
    texture: grafiteChumbo,
  },
  {
    id: 'grafite-metalico',
    name: 'Grafite Metálico',
    family: 'cinzas',
    finish: 'Metálico',
    hex: '#5E5E5E',
    texture: grafiteMetalico,
  },
  { id: 'cinza-grey', name: 'Cinza Grey', family: 'cinzas', hex: '#4D504C', texture: cinzaGrey },
  {
    id: 'cinza-escuro',
    name: 'Cinza Escuro',
    family: 'cinzas',
    hex: '#2D4548',
    texture: cinzaEscuro,
  },
  { id: 'dark-grey', name: 'Dark Grey', family: 'cinzas', hex: '#393C36', texture: darkGrey },

  // Pretos
  {
    id: 'preto-carbono-brilho',
    name: 'Preto Carbono Brilho',
    family: 'pretos',
    finish: 'Brilho',
    hex: '#28282D',
    texture: pretoCarbonoBrilho,
  },
  {
    id: 'preto-carbono',
    name: 'Preto Carbono',
    family: 'pretos',
    hex: '#1C1B20',
    texture: pretoCarbono,
  },

  // Bronze, champagne e marrom
  {
    id: 'champagne-metalico',
    name: 'Champagne Metálico',
    family: 'marrons',
    finish: 'Metálico',
    hex: '#B1A392',
    texture: champagneMetalico,
  },
  {
    id: 'bronze-1003',
    name: 'Bronze 1003',
    family: 'marrons',
    hex: '#4B3C24',
    texture: bronze1003,
  },
  { id: 'marrom', name: 'Marrom', family: 'marrons', hex: '#4A1D00', texture: marrom },

  // Madeiras
  {
    id: 'madeira-carvalho',
    name: 'Madeira Carvalho',
    family: 'madeiras',
    hex: '#8E764A',
    texture: madeiraCarvalho,
  },
  {
    id: 'madeira-mogno',
    name: 'Madeira Mogno',
    family: 'madeiras',
    hex: '#7D4B11',
    texture: madeiraMogno,
  },
  {
    id: 'madeira-carvalho-dourado',
    name: 'Madeira Carvalho Dourado',
    family: 'madeiras',
    hex: '#8B4A15',
    texture: madeiraCarvalhoDourado,
  },
  {
    id: 'madeira-cedro',
    name: 'Madeira Cedro',
    family: 'madeiras',
    hex: '#7D3108',
    texture: madeiraCedro,
  },
  {
    id: 'madeira-vintage',
    name: 'Madeira Vintage',
    family: 'madeiras',
    hex: '#673310',
    texture: madeiraVintage,
  },
  {
    id: 'madeira-avela',
    name: 'Madeira Avelã',
    family: 'madeiras',
    hex: '#644B2A',
    texture: madeiraAvela,
  },
  {
    id: 'madeira-sucupira',
    name: 'Madeira Sucupira',
    family: 'madeiras',
    hex: '#322216',
    texture: madeiraSucupira,
  },

  // Texturas
  {
    id: 'concreto',
    name: 'Concreto',
    family: 'texturas',
    finish: 'Textura',
    hex: '#877E73',
    texture: concreto,
  },
  {
    id: 'aco-corten',
    name: 'Aço Corten',
    family: 'texturas',
    finish: 'Textura',
    hex: '#66422E',
    texture: acoCorten,
  },
]

const COLORS_BY_ID: ReadonlyMap<string, AcmColor> = new Map(ACM_COLORS.map((c) => [c.id, c]))

export function findColor(id: string): AcmColor | undefined {
  return COLORS_BY_ID.get(id)
}

/** Para ids que DEVEM existir (constantes do código). Falha cedo se alguém digitar errado. */
export function requireColor(id: string): AcmColor {
  const color = COLORS_BY_ID.get(id)
  if (!color) throw new Error(`Cor de ACM não encontrada: "${id}"`)
  return color
}
