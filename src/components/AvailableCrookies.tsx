import { MapPin } from 'lucide-react'
import { heroAssets, kinderBuenoPhotoAsset, tradicionalPhotoAsset } from '../config/heroAssets'
import type { StoreData } from '../lib/store'
import { Button } from './ui/button'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function productImage(slug: string) {
  if (slug === 'kinder-bueno') return kinderBuenoPhotoAsset
  return slug === 'tradicional' ? tradicionalPhotoAsset : heroAssets.closed
}

function productLabel(name: string) {
  return name.replace(/[🥐🍫🍪]/gu, '').replace(/\s+/g, ' ').trim()
}

function productWeight(slug: string) {
  if (slug === 'kinder-bueno') return '380g'
  return slug === 'tradicional' ? '250g' : '360g'
}

function descriptionWithServing(description: string) {
  return /\(Serve até \d+ pessoas\)\.?$/u.test(description) ? description : `${description} (Serve até 2 pessoas)`
}

export function AvailableCrookies({ data, onReserve }: { data: StoreData; onReserve: () => void }) {
  const availableProducts = data.products.filter((product) => product.units_free > 0)
  const units = data.settings.pool_units_cap

  return <section id="crookies-disponiveis" aria-labelledby="available-crookies-title" className="relative overflow-hidden bg-cocoa px-5 py-20 md:px-10 md:py-28">
    <div aria-hidden="true" className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-brand/7 blur-3xl" />
    <div className="relative mx-auto max-w-6xl">
      <div className="max-w-2xl">
        <h2 id="available-crookies-title" className="font-display text-[clamp(3rem,6.4vw,5rem)] leading-[.86] tracking-[-.035em] text-cream">Crookies disponíveis</h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-cream/70 md:text-lg">Uma primeira fornada feita para quem chega antes.</p>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-y border-peach/30 py-5 text-sm leading-6 text-peach sm:flex-row sm:items-center sm:justify-between md:mt-12">
        <p className="font-body font-semibold">Apenas {units} unidades disponíveis</p>
        <p className="text-cream/60">Retirada exclusiva em Jundiaí - SP e região</p>
      </div>

      <div className="divide-y divide-cream/15">
        {availableProducts.map((product) => {
          const label = productLabel(product.name)
          return <article key={product.id} className="grid gap-7 py-9 md:grid-cols-[minmax(14rem,.72fr)_minmax(0,1fr)] md:items-center md:gap-14 md:py-12">
            <div className="relative aspect-[1.35] overflow-hidden rounded-2xl bg-surface shadow-[0_24px_56px_rgba(0,0,0,.38)]">
              <img src={productImage(product.slug)} alt={product.name} loading="lazy" className="h-full w-full object-cover object-center" />
            </div>
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h3 className="font-display text-[clamp(2.1rem,4.2vw,3.5rem)] leading-[.9] tracking-[-.03em] text-cream">{label}<span className="ml-3 inline-block align-[.1em] font-body text-[.38em] font-semibold tracking-normal text-peach">{productWeight(product.slug)}</span></h3>
                <p className="font-body text-base font-semibold text-peach md:text-lg">{money.format(product.price)}</p>
              </div>
              <p className="mt-5 max-w-xl text-sm leading-7 text-cream/70 md:text-base">{descriptionWithServing(product.description)}</p>
            </div>
          </article>
        })}
      </div>

      <div className="mt-10 flex flex-col gap-6 md:mt-12 md:flex-row md:items-center md:justify-between">
        <p className="flex max-w-xl items-start gap-3 text-sm leading-6 text-cream/65"><MapPin className="mt-0.5 flex-none text-peach" size={20} aria-hidden="true" />Atendimento e retirada destinados a clientes de Jundiaí - SP e região.</p>
        <Button onClick={onReserve} className="w-full bg-brand text-cocoa hover:bg-peach md:w-auto">Quero garantir meu Crookie</Button>
      </div>
    </div>
  </section>
}
