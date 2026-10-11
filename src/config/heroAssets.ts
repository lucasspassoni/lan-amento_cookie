import nutellaPhoto from '../assets/crookie-nutella.jpeg'
import pullPhoto from '../assets/crookie-puxando-nutella.jpeg'
import tradicionalPhoto from '../assets/crookie-tradicional.png'
import kinderBuenoPhoto from '../assets/crookie-kinder-bueno.jpeg'
import introVideo from '../assets/crookie-rotation-optimized.mp4'
import logoImage from '../assets/brand-logo.png'

/** Set this to true after adding final transparent assets under /public/hero. */
const useFinalCutouts = false

const final = {
  closed: '/hero/crookie-fechado.webp',
  topHalf: '/hero/crookie-metade-cima.webp',
  bottomHalf: '/hero/crookie-metade-baixo.webp',
  filling: '/hero/crookie-recheio.webp',
}

export const heroAssets = useFinalCutouts
  ? final
  : { closed: nutellaPhoto, topHalf: pullPhoto, bottomHalf: nutellaPhoto, filling: null }

export const introVideoAsset = introVideo
export const tradicionalPhotoAsset = tradicionalPhoto
export const kinderBuenoPhotoAsset = kinderBuenoPhoto

export const brandLogo = logoImage
