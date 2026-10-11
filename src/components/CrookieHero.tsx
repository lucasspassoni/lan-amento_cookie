import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { heroAssets, introVideoAsset, tradicionalPhotoAsset } from '../config/heroAssets'
import { Button } from './ui/button'

function ProductLoop() {
  const reduceMotion = useReducedMotion()
  const [frame, setFrame] = useState<'nutella' | 'video' | 'tradicional'>('nutella')

  useEffect(() => {
    if (reduceMotion || frame === 'video') return
    const timer = window.setTimeout(() => setFrame(frame === 'nutella' ? 'video' : 'nutella'), 2800)
    return () => window.clearTimeout(timer)
  }, [reduceMotion, frame])

  return (
    <div className="relative aspect-[.8] w-full overflow-hidden rounded-2xl bg-cocoa md:aspect-[1.05]">
      <AnimatePresence mode="wait" initial={false}>
        {frame === 'video' ? (
          <motion.video key="rotation-video" autoPlay muted playsInline preload="metadata" onEnded={() => setFrame('tradicional')}
            initial={{ opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .99 }} transition={{ duration: .45, ease: [0.16, 1, .3, 1] }}
            aria-label="Vídeo do Crookie girando" className="h-full w-full object-contain object-center">
            <source src={introVideoAsset} type="video/mp4" />
          </motion.video>
        ) : frame === 'tradicional' ? (
          <motion.img key="tradicional-still" src={tradicionalPhotoAsset} alt="Crookie tradicional coberto com açúcar de confeiteiro"
            initial={{ opacity: 0, scale: 1.015 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .99 }} transition={{ duration: .55, ease: [0.16, 1, .3, 1] }}
            className="h-full w-full object-cover object-center" />
        ) : (
          <motion.img key="hero-still" src={heroAssets.topHalf} alt="Crookie aberto, com chocolate cremoso e brilhante escorrendo"
            initial={{ opacity: 0, scale: 1.015 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.01 }} transition={{ duration: .55, ease: [0.16, 1, .3, 1] }}
            className="h-full w-full object-cover object-center" />
        )}
      </AnimatePresence>
    </div>
  )
}

function formatPickupDate(value: string | null) {
  if (!value) return null
  const formatted = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`
}

export function CrookieHero({ onReserve, availableUnits, pickupDate }: { onReserve: () => void; availableUnits: number; pickupDate: string | null }) {
  const formattedPickupDate = formatPickupDate(pickupDate)
  return (
    <section id="hero-principal" aria-labelledby="crookie-title" className="crookie-hero relative isolate min-h-[100svh] overflow-hidden bg-cocoa px-5 py-7 md:px-10 md:py-10">
      <div className="hero-product-light" aria-hidden="true" />
      <div className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-7xl items-center gap-7 lg:grid-cols-[.92fr_1.08fr] lg:gap-12">
        <div className="relative z-10 order-2 max-w-xl lg:order-1">
          <h1 id="crookie-title" aria-label="Crookie" className="crookie-wordmark text-[clamp(3.9rem,8vw,6rem)]">
            <span aria-hidden="true" className="crookie-wordmark__name">CROOKIE</span>
            <span aria-hidden="true" className="crookie-wordmark__accent" />
            <span aria-hidden="true" className="crookie-wordmark__period">.</span>
          </h1>
          <p className="mt-8 max-w-[23ch] font-display text-2xl leading-[1.08] tracking-[-.025em] text-peach md:text-4xl">Seja um dos {availableUnits} primeiros a garantir o Crookie exclusivo.</p>
          <p className="mt-5 max-w-[38rem] text-sm leading-7 text-cream/70 md:text-base">Uma primeira fornada feita para Jundiaí - SP e região. Escolha o seu antes que ela acabe.</p>
          {formattedPickupDate && <div className="mt-7 flex max-w-md items-center gap-3 border-y border-cream/15 py-3 text-cream">
            <CalendarDays aria-hidden="true" size={22} strokeWidth={1.7} className="flex-none text-peach" />
            <div><p className="font-body text-[10px] font-semibold uppercase tracking-[.14em] text-peach">Retirada</p><p className="mt-1 font-display text-2xl leading-none tracking-[-.02em] md:text-3xl">{formattedPickupDate}</p></div>
          </div>}
          <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Button onClick={onReserve} className="w-full bg-brand text-cocoa hover:bg-peach sm:w-auto">Quero garantir meu Crookie</Button>
            <div aria-label={`${availableUnits} unidades disponíveis`} className="flex min-h-11 items-center gap-3 rounded-xl bg-brand px-4 py-2.5 text-cocoa shadow-[0_14px_28px_rgba(255,52,133,.22)]">
              <span className="font-display text-6xl leading-[.62] tabular-nums tracking-[-.04em]">{availableUnits}</span>
              <span className="font-body text-[10px] font-bold uppercase leading-[1.15] tracking-[.14em]"><span className="block">unidades</span><span className="block">disponíveis</span></span>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: .96, y: 20 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: 1.1, ease: [0.16, 1, .3, 1] }} className="relative order-1 mx-auto w-full max-w-[650px] lg:order-2">
          <div className="hero-image-mask absolute inset-x-[9%] bottom-[4%] top-[12%] bg-cookie/30 blur-3xl" aria-hidden="true" />
          <div className="relative shadow-[0_32px_80px_rgba(0,0,0,.7)]"><ProductLoop /></div>
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-cyan/25" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  )
}
