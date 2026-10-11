import { Check, CreditCard, MapPin, PackageCheck } from 'lucide-react'
import { brandLogo } from '../config/heroAssets'
import { getEffectiveStatus, type StoreData } from '../lib/store'
import { Button } from './ui/button'

function pickupLabel(data: StoreData) {
  const { settings } = data
  if (!settings.pickup_date) return 'Data de retirada a divulgar'
  const date = new Date(`${settings.pickup_date}T12:00:00`)
  const day = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
  const time = settings.pickup_start_time && settings.pickup_end_time ? ` • ${settings.pickup_start_time.slice(0, 5)} às ${settings.pickup_end_time.slice(0, 5)}` : ''
  return `${day}${time}${settings.pickup_location ? ` • ${settings.pickup_location}` : ''}`
}
export function HowItWorks({ data }: { data: StoreData }) {
  const status = getEffectiveStatus(data.settings, data.availability)
  const steps = [{ icon: PackageCheck, text: 'Escolha seus Crookies' }, { icon: CreditCard, text: 'Pague por Pix' }, { icon: MapPin, text: 'Retire na loja' }]
  return <section className="relative overflow-hidden bg-surface px-5 py-20 md:px-10 md:py-28">
    <div aria-hidden="true" className="absolute -right-32 top-8 h-72 w-72 rounded-full bg-brand/5 blur-3xl" />
    <div className="relative mx-auto max-w-6xl">
      <h2 className="whitespace-nowrap font-display text-[clamp(2.75rem,6vw,3.75rem)] leading-[.9] tracking-[-.025em] text-cream">Como funciona</h2>
      <div className="mt-12 overflow-hidden border-y border-cream/15 md:mt-14">
        <div className="grid md:grid-cols-3">
          {steps.map(({ icon: Icon, text }, index) => <article key={text} className="grid min-h-36 grid-cols-[4.5rem_1fr] items-center gap-4 border-b border-cream/12 py-7 last:border-b-0 md:min-h-[20rem] md:grid-cols-1 md:content-start md:gap-7 md:border-b-0 md:border-r md:border-cream/12 md:px-8 md:py-10 md:last:border-r-0">
            <span aria-hidden="true" className="font-display text-[4.5rem] leading-[.68] tracking-[-.035em] text-peach/30 md:text-[5.75rem]">0{index + 1}</span>
            <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-5">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-brand text-cocoa shadow-[0_12px_24px_rgba(255,52,133,.16)]"><Icon size={21} strokeWidth={1.8} /></span>
              <p className="font-body text-base font-semibold leading-6 tracking-[-.015em] text-peach md:max-w-[14ch] md:text-lg">{text}</p>
            </div>
          </article>)}
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4 text-sm leading-6 text-cream/65 md:mt-10 md:flex-row md:items-center md:justify-between md:gap-8">
        <p className="max-w-2xl">{pickupLabel(data)}</p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 md:justify-end"><p>Retirada exclusiva em {data.settings.service_area}</p>{status !== 'sold_out' && <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-peach"><Check size={17} />Apenas {data.settings.pool_units_cap} unidades disponíveis</span>}</div>
      </div>
    </div>
  </section>
}
export function StoreFooter({ data, onReserve }: { data: StoreData; onReserve: () => void }) {
  const phone = data.settings.owner_whatsapp?.replace(/\D/g, '')
  const href = phone ? `https://wa.me/${phone}?text=${encodeURIComponent('Olá! Vim pela página de pré-lançamento do Crookie e gostaria de tirar uma dúvida.')}` : null
  const hasStoreDetails = Boolean(data.settings.store_address || data.settings.store_hours)
  const pickup = pickupLabel(data)
  return <footer className="bg-cocoa px-5 pb-36 pt-4 md:px-10 md:pb-24">
    <div className="mx-auto max-w-6xl border-t border-cream/15">
      <section className="grid gap-8 border-b border-cream/15 py-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:py-16">
        <div className="max-w-2xl"><h2 className="font-display text-[clamp(2.8rem,5vw,4.5rem)] leading-[.86] tracking-[-.035em] text-cream">A sua primeira mordida começa aqui.</h2><p className="mt-5 font-body text-sm leading-6 text-cream/65 md:text-base">{pickup} • retirada exclusiva em {data.settings.service_area}.</p></div>
        <Button onClick={onReserve} className="w-full bg-brand text-cocoa hover:bg-peach md:w-auto">Quero garantir meu Crookie</Button>
      </section>
      <div className="flex flex-col items-center gap-8 py-9 text-center md:flex-row md:justify-between md:py-10 md:text-left">
        <div className="flex items-center gap-4 text-left">
          <span className="footer-brand-logo" aria-hidden="true"><img src={brandLogo} alt="" /></span>
          <div><p className="font-display text-3xl leading-[.85] tracking-[-.02em] text-cream">Cookie Pitada de Amor</p><p className="mt-2 font-body text-[11px] font-semibold uppercase tracking-[.16em] text-peach">cookies artesanais</p></div>
        </div>
        {hasStoreDetails && <div className="font-body text-sm leading-6 text-cream/60">{data.settings.store_address && <p>{data.settings.store_address}</p>}{data.settings.store_hours && <p>{data.settings.store_hours}</p>}</div>}
        {href && <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-peach px-5 font-body text-sm font-semibold text-cocoa transition hover:bg-brand sm:w-auto">Falar com a Camila</a>}
      </div>
    </div>
  </footer>
}
