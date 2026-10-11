import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronDown, LoaderCircle, Minus, Plus, X } from 'lucide-react'
import { Button } from './ui/button'
import { heroAssets, kinderBuenoPhotoAsset, tradicionalPhotoAsset } from '../config/heroAssets'
import { fetchStoreData, type Product, type StoreData } from '../lib/store'
import { getSessionId } from '../lib/session'
import { trackEvent } from '../lib/track'
import { createOrder, type OrderSuccessResponse } from '../services/orders'

type Quantities = Record<number, number>
type ReservationPanelProps = {
  open: boolean
  mode: 'reserve' | 'notice'
  initialData: StoreData
  quantities: Quantities
  onQuantitiesChange: (quantities: Quantities) => void
  onOpenChange: (open: boolean) => void
  onOrderCreated: (order: OrderSuccessResponse) => void
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const contactSchema = z.object({
  full_name: z.string().trim().min(2, 'Informe seu nome completo.'),
  whatsapp: z.string().refine((value) => {
    const digits = value.replace(/\D/g, '')
    return /^(?:[1-9][1-9]9\d{8}|[1-9][1-9]\d{8})$/.test(digits)
  }, 'Digite um DDD válido e um número de WhatsApp.'),
})
type ContactValues = z.infer<typeof contactSchema>

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('55')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, 11)
}
function formatPhone(value: string) {
  const digits = normalizePhone(value)
  if (digits.length <= 2) return digits ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}
function whatsappLink(number?: string | null) {
  if (!number) return null
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim pela página de pré-lançamento do Crookie e gostaria de tirar uma dúvida.')}`
}
function productThumbnail(product: Product) {
  if (product.photo_url) return product.photo_url
  if (product.slug === 'kinder-bueno') return kinderBuenoPhotoAsset
  return product.slug === 'tradicional' ? tradicionalPhotoAsset : heroAssets.closed
}

function ProductOptionRow({ product, index, expanded, onExpandedChange, quantity, totalQuantity, poolFree, maxPerCustomer, lowStockThreshold, onQuantityChange }: {
  product: Product; index: number; expanded: boolean; onExpandedChange: () => void
  quantity: number; totalQuantity: number; poolFree: number; maxPerCustomer: number | null; lowStockThreshold: number
  onQuantityChange: (quantity: number) => void
}) {
  const remainingPool = Math.max(0, poolFree - (totalQuantity - quantity))
  const remainingLimit = maxPerCustomer === null ? Infinity : Math.max(0, maxPerCustomer - (totalQuantity - quantity))
  const maximum = Math.max(0, Math.min(product.units_free, remainingPool, remainingLimit))
  const soldOut = product.units_free === 0
  const limitMessage = product.units_free === 0 ? 'Este Crookie está esgotado.' : quantity >= maximum
    ? maxPerCustomer !== null && totalQuantity >= maxPerCustomer ? `Limite de ${maxPerCustomer} unidade${maxPerCustomer === 1 ? '' : 's'} por pessoa.`
      : poolFree <= totalQuantity ? 'As vagas disponíveis já foram selecionadas.' : 'Você atingiu o limite disponível deste Crookie.'
    : null
  return <article className={`border-b border-cream/12 last:border-b-0 ${soldOut ? 'opacity-55' : ''}`}>
    <button type="button" aria-expanded={expanded} aria-controls={`product-detail-${product.id}`} onClick={onExpandedChange} className="flex w-full items-center gap-2 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-inset md:gap-4">
      <span className="hidden w-14 flex-none font-body text-[10px] font-semibold uppercase tracking-[.12em] text-peach/75 md:block md:w-auto md:text-[11px] md:tracking-[.14em]">Produto {String(index + 1).padStart(2, '0')}</span>
      <span className="relative h-12 w-12 flex-none overflow-hidden rounded-xl bg-cocoa ring-1 ring-cream/15 md:h-16 md:w-16"><img src={productThumbnail(product)} alt="" className="h-full w-full object-cover object-center" /><span aria-hidden="true" className="absolute bottom-0 left-0 bg-cocoa/90 px-1.5 py-1 font-body text-[9px] font-semibold leading-none text-peach md:hidden">{String(index + 1).padStart(2, '0')}</span></span>
      <span className="min-w-0 flex-1"><span className="block whitespace-nowrap font-display text-[1.18rem] leading-[.9] tracking-[-.02em] text-cream sm:text-[1.35rem] md:text-[1.65rem]">{product.name}</span><span className="mt-2 block font-body text-sm font-semibold text-peach">{money.format(product.price)}</span></span>
      <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-cream/8 text-peach md:h-10 md:w-10 md:rounded-xl"><ChevronDown size={18} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} /></span>
    </button>
    {expanded && <div id={`product-detail-${product.id}`} className="pb-5">
      <p className="max-w-[46ch] text-sm leading-6 text-cream/70">{product.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-cream/10 pt-4">
        <div className="inline-flex items-center rounded-full bg-cocoa p-1">
          <button type="button" aria-label={`Diminuir quantidade de ${product.name}`} disabled={quantity === 0 || soldOut} onClick={() => onQuantityChange(quantity - 1)} className="grid h-11 w-11 place-items-center rounded-full text-peach transition hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-35"><Minus size={18} /></button>
          <output aria-label={`Quantidade de ${product.name}`} className="w-7 text-center font-body text-base font-semibold text-cream">{quantity}</output>
          <button type="button" aria-label={`Aumentar quantidade de ${product.name}`} disabled={soldOut || quantity >= maximum} onClick={() => onQuantityChange(quantity + 1)} className="grid h-11 w-11 place-items-center rounded-full bg-brand text-cocoa transition hover:bg-peach focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream disabled:opacity-35"><Plus size={18} /></button>
        </div>
        {soldOut ? <span className="text-sm font-semibold text-peach">Esgotado</span> : quantity > 0 ? <p className="text-right text-xs text-cream/70">Subtotal<br /><strong className="font-body text-sm font-semibold text-cream">{money.format(quantity * product.price)}</strong></p> : null}
      </div>
      {limitMessage && <p className="mt-3 text-xs text-peach/80">{limitMessage}</p>}
    </div>}
  </article>
}

export function ReservationPanel({ open, mode, initialData, quantities, onQuantitiesChange, onOpenChange, onOrderCreated }: ReservationPanelProps) {
  const [step, setStep] = useState<'choose' | 'contact'>('choose')
  const [notice, setNotice] = useState('')
  const [canRetrySubmit, setCanRetrySubmit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null)
  const dragStart = useRef<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const { data = initialData, error, isFetching, refetch } = useQuery({ queryKey: ['store-data'], queryFn: fetchStoreData, initialData, enabled: open, refetchOnMount: 'always', refetchInterval: open ? 30_000 : false })
  const form = useForm<ContactValues>({ resolver: zodResolver(contactSchema), defaultValues: { full_name: '', whatsapp: '' } })
  const { settings, products, availability } = data
  const allSoldOut = products.length > 0 && products.every((product) => product.units_free === 0)
  const totalQuantity = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0)
  const total = products.reduce((sum, product) => sum + product.price * (quantities[product.id] ?? 0), 0)
  const camilaUrl = whatsappLink(settings.owner_whatsapp)

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement as HTMLElement
    panelRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onOpenChange(false); return }
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown); previousFocus.current?.focus() }
  }, [open, onOpenChange])

  useEffect(() => {
    let changed = false
    const next = { ...quantities }
    for (const product of products) {
      const chosenElsewhere = Object.entries(next).filter(([id]) => Number(id) !== product.id).reduce((sum, [, quantity]) => sum + quantity, 0)
      const maximum = Math.max(0, Math.min(product.units_free, availability.units_free_total - chosenElsewhere, settings.max_units_per_customer === null ? Infinity : settings.max_units_per_customer - chosenElsewhere))
      if ((next[product.id] ?? 0) > maximum) { next[product.id] = maximum; changed = true }
    }
    if (changed) { onQuantitiesChange(next); setNotice('A disponibilidade mudou e ajustamos suas quantidades.') }
  }, [availability.units_free_total, products, settings.max_units_per_customer])

  if (!open) return null
  const updateQuantity = (product: Product, requested: number) => {
    const chosenElsewhere = totalQuantity - (quantities[product.id] ?? 0)
    const maximum = Math.max(0, Math.min(product.units_free, availability.units_free_total - chosenElsewhere, settings.max_units_per_customer === null ? Infinity : settings.max_units_per_customer - chosenElsewhere))
    const next = { ...quantities, [product.id]: Math.max(0, Math.min(requested, maximum)) }
    if ((next[product.id] ?? 0) > (quantities[product.id] ?? 0)) trackEvent('product_added', { product_id: product.id, quantity: next[product.id] })
    onQuantitiesChange(next)
  }
  const openChoice = () => { setStep('choose'); setNotice(''); setCanRetrySubmit(false) }
  const submit = async (values: ContactValues) => {
    setSubmitting(true); setNotice(''); setCanRetrySubmit(false)
    try {
      const latest = await fetchStoreData()
      const selected = latest.products.filter((product) => (quantities[product.id] ?? 0) > 0)
      const latestTotal = selected.reduce((sum, product) => sum + (quantities[product.id] ?? 0), 0)
      const hasStockIssue = selected.some((product) => (quantities[product.id] ?? 0) > product.units_free) || latestTotal > latest.availability.units_free_total || (latest.settings.max_units_per_customer !== null && latestTotal > latest.settings.max_units_per_customer)
      if (hasStockIssue) { await refetch(); setStep('choose'); setNotice('A disponibilidade mudou. Revise sua escolha antes de continuar.'); return }
      const normalizedPhone = normalizePhone(values.whatsapp)
      const result = await createOrder({
        full_name: values.full_name.trim(),
        whatsapp: `55${normalizedPhone}`,
        contact_consent: true,
        items: selected.map((product) => ({ product_id: product.id, quantity: quantities[product.id] })),
        session_id: getSessionId(),
      })
      if (!result.ok) {
        if (result.error_code === 'insufficient_stock') {
          await refetch()
          setStep('choose')
          setNotice('As unidades mudaram. Revise sua escolha antes de continuar.')
          return
        }
        if (result.error_code === 'invalid_input') { setNotice('Confira seu nome e WhatsApp e tente de novo.'); return }
        if (result.error_code === 'campaign_not_open') { setNotice('As reservas não estão abertas no momento.'); return }
        if (result.error_code === 'limit_exceeded') { setNotice('Você atingiu o limite de unidades por cliente.'); return }
        setNotice('Não conseguimos gerar seu pagamento agora. Tente novamente em instantes.')
        setCanRetrySubmit(true)
        return
      }
      trackEvent('order_started', { items: selected.map((product) => ({ product_id: product.id, quantity: quantities[product.id] })) })
      onOrderCreated(result.data)
    } catch (reason) {
      setNotice('Não conseguimos gerar seu pagamento agora. Tente novamente em instantes.')
      setCanRetrySubmit(true)
    } finally { setSubmitting(false) }
  }
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const panelStyle = isMobile && dragOffset ? { transform: `translateY(${dragOffset}px)` } : undefined
  return <div className="fixed inset-0 z-[70]" aria-live="polite">
    <button type="button" aria-label="Fechar painel" onClick={() => onOpenChange(false)} className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm" />
    <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="reservation-title" onPointerDown={(event) => { if (isMobile && !(event.target instanceof HTMLButtonElement) && !(event.target instanceof HTMLInputElement)) dragStart.current = event.clientY }} onPointerMove={(event) => { if (dragStart.current !== null) setDragOffset(Math.max(0, event.clientY - dragStart.current)) }} onPointerUp={() => { if (dragOffset > 110) onOpenChange(false); setDragOffset(0); dragStart.current = null }} style={panelStyle} className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[90svh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-2xl bg-surface shadow-[0_-20px_70px_rgba(0,0,0,.55)] transition-transform duration-200 md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[min(760px,88svh)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl">
      <div className="mx-auto mt-3 h-1.5 w-11 rounded-full bg-cream/20 md:hidden" />
      <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
        <div><h2 id="reservation-title" className="font-display text-3xl leading-none text-cream">{mode === 'notice' ? 'Fique por perto' : step === 'choose' ? 'Escolha o seu Crookie' : 'Seus dados'}</h2><p className="mt-2 text-sm text-cream/65">Retirada na loja • {settings.service_area}</p></div>
        <button type="button" aria-label="Fechar" onClick={() => onOpenChange(false)} className="grid h-11 w-11 place-items-center rounded-xl bg-cream/8 text-cream transition hover:bg-cream/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"><X size={20} /></button>
      </header>
      {mode === 'reserve' && settings.status === 'open' && <div className="mx-5 mb-4 flex items-center justify-between rounded-xl bg-cocoa px-4 py-3 text-sm"><span className="text-cream/65">Disponibilidade</span><strong className="font-body text-sm font-semibold text-peach">Restam {availability.units_free_total} de {settings.pool_units_cap}</strong></div>}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        {import.meta.env.VITE_ORDER_SIMULATION === 'true' && <p className="mb-4 rounded-lg bg-peach/10 px-3 py-2 text-xs font-bold tracking-[.08em] text-peach">MODO SIMULAÇÃO</p>}
        {mode === 'notice' ? <InterestNotice /> : error ? <div className="py-10 text-center"><p className="font-display text-xl text-cream">Não conseguimos carregar os produtos agora</p><Button onClick={() => refetch()} className="mt-5 bg-brand text-cocoa">Tentar de novo</Button>{camilaUrl && <a className="mt-4 block text-sm text-peach underline underline-offset-4" href={camilaUrl} target="_blank" rel="noreferrer">Falar com a Camila</a>}</div> : step === 'choose' ? <div className="divide-y divide-cream/12">{products.map((product, index) => <ProductOptionRow key={product.id} product={product} index={index} expanded={expandedProductId === product.id} onExpandedChange={() => setExpandedProductId((current) => current === product.id ? null : product.id)} quantity={quantities[product.id] ?? 0} totalQuantity={totalQuantity} poolFree={availability.units_free_total} maxPerCustomer={settings.max_units_per_customer} lowStockThreshold={settings.low_stock_threshold} onQuantityChange={(quantity) => updateQuantity(product, quantity)} />)}{notice && <p className="my-3 rounded-xl bg-peach/10 px-3 py-3 text-sm text-peach">{notice}</p>}{isFetching && <p className="py-3 text-center text-xs text-cream/45">Atualizando disponibilidade…</p>}</div> : <ContactForm form={form} total={total} products={products} quantities={quantities} submitting={submitting} notice={notice} canRetrySubmit={canRetrySubmit} camilaUrl={camilaUrl} onBack={openChoice} onSubmit={submit} />}
      </div>
      {mode === 'reserve' && step === 'choose' && <footer className="flex items-center justify-between gap-4 border-t border-cream/10 bg-surface px-5 py-4"><div><p className="text-xs text-cream/55">Total</p><strong className="font-body text-xl font-semibold text-cream">{money.format(total)}</strong></div>{allSoldOut ? <p className="max-w-48 text-right text-sm text-peach">Todas as unidades foram reservadas</p> : <Button disabled={totalQuantity === 0} onClick={() => { setStep('contact'); setNotice(''); setCanRetrySubmit(false) }} className="bg-brand text-cocoa hover:bg-peach">Pedir agora</Button>}</footer>}
    </div>
  </div>
}

function InterestNotice() { return <div className="py-12 text-center"><p className="font-display text-2xl text-cream">Em breve você poderá deixar seu contato aqui.</p><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-cream/65">Estamos finalizando os detalhes da próxima fornada. Volte em breve para garantir seu Crookie.</p></div> }
function ContactForm({ form, total, products, quantities, submitting, notice, canRetrySubmit, camilaUrl, onBack, onSubmit }: { form: ReturnType<typeof useForm<ContactValues>>; total: number; products: Product[]; quantities: Quantities; submitting: boolean; notice: string; canRetrySubmit: boolean; camilaUrl: string | null; onBack: () => void; onSubmit: (values: ContactValues) => void }) {
  const summary = products.filter((product) => (quantities[product.id] ?? 0) > 0).map((product) => `${quantities[product.id]}x ${product.name}`).join(' • ')
  return <form onSubmit={form.handleSubmit(onSubmit)}><button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 text-sm text-peach underline underline-offset-4"><ArrowLeft size={16} />Voltar</button><div className="mt-3 rounded-xl bg-cocoa p-4"><p className="text-sm text-cream/65">{summary}</p><strong className="mt-1 block font-body text-lg font-semibold text-cream">{money.format(total)}</strong></div><label className="mt-6 block text-sm font-semibold text-cream">Seu nome<input autoComplete="name" {...form.register('full_name')} className="mt-2 h-12 w-full rounded-xl border border-cream/15 bg-cocoa px-4 text-cream outline-none transition placeholder:text-cream/30 focus:border-brand focus:ring-2 focus:ring-brand/30" /></label>{form.formState.errors.full_name && <p className="mt-1 text-xs text-peach">{form.formState.errors.full_name.message}</p>}<label className="mt-5 block text-sm font-semibold text-cream">WhatsApp<div className="relative mt-2"><span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-cream/55">+55</span><input inputMode="numeric" autoComplete="tel-national" value={formatPhone(form.watch('whatsapp'))} onChange={(event) => form.setValue('whatsapp', normalizePhone(event.target.value), { shouldValidate: true })} className="h-12 w-full rounded-xl border border-cream/15 bg-cocoa pl-14 pr-4 text-cream outline-none transition placeholder:text-cream/30 focus:border-brand focus:ring-2 focus:ring-brand/30" /></div></label><p className="mt-2 text-xs leading-5 text-cream/55">Só o DDD e o número. Enviaremos a confirmação por aqui.</p>{form.formState.errors.whatsapp && <p className="mt-1 text-xs text-peach">{form.formState.errors.whatsapp.message}</p>}{notice && <div className="mt-5 rounded-xl bg-peach/10 px-3 py-3 text-sm text-peach">{notice}{camilaUrl && <a className="ml-1 underline underline-offset-4" href={camilaUrl} target="_blank" rel="noreferrer">Falar com a Camila</a>}</div>}{canRetrySubmit && <Button disabled={submitting} type="button" onClick={() => form.handleSubmit(onSubmit)()} className="mt-4 w-full bg-cream/10 text-cream hover:bg-cream/15">Tentar de novo</Button>}<Button disabled={submitting} type="submit" className="mt-7 w-full bg-brand text-cocoa hover:bg-peach">{submitting ? <><LoaderCircle className="mr-2 animate-spin" size={18} />Enviando pedido…</> : 'Enviar pedido'}</Button><p className="mt-3 text-center text-xs leading-5 text-cream/50">Ao continuar, você aceita receber por WhatsApp a confirmação do pedido e os avisos de retirada.</p></form>
}
