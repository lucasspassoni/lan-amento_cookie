import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { CrookieHero } from './components/CrookieHero'
import { AvailableCrookies } from './components/AvailableCrookies'
import { HowItWorks, StoreFooter } from './components/StoreDetails'
import { Button } from './components/ui/button'
import { brandLogo } from './config/heroAssets'
import { fallbackStoreData, fetchStoreData, getEffectiveStatus } from './lib/store'
import { trackEvent } from './lib/track'
import type { OrderSuccessResponse } from './services/orders'

const ctaCopy = { open: 'Quero garantir meu Crookie', coming_soon: 'Quero garantir meu Crookie', sold_out: 'Avise-me no próximo lote', closed: 'Em breve, um novo lote' } as const
const CheckoutPage = lazy(() => import('./components/CheckoutPage').then(({ CheckoutPage: Component }) => ({ default: Component })))
const ReservationPanel = lazy(() => import('./components/ReservationPanel').then(({ ReservationPanel: Component }) => ({ default: Component })))
type CheckoutNavigationState = Pick<OrderSuccessResponse, 'checkout_url' | 'hold_expires_at'>

export default function App() {
  const reduceMotion = useReducedMotion()
  const logoSection = useRef<HTMLElement>(null)
  const heroSection = useRef<HTMLElement>(null)
  const [logoVisible, setLogoVisible] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [route, setRoute] = useState(() => window.location.pathname)
  const [checkoutNavigationState, setCheckoutNavigationState] = useState<CheckoutNavigationState | null>(() => window.history.state as CheckoutNavigationState | null)
  const { data = fallbackStoreData } = useQuery({ queryKey: ['store-data'], queryFn: fetchStoreData })
  const effectiveStatus = getEffectiveStatus(data.settings, data.availability)
  const selectedUnits = Object.values(quantities).reduce((total, quantity) => total + quantity, 0)
  const contextualCta = selectedUnits > 0 ? `Continuar reserva · ${selectedUnits} ${selectedUnits === 1 ? 'item' : 'itens'}` : ctaCopy[effectiveStatus]

  useEffect(() => {
    const onPopState = () => { setRoute(window.location.pathname); setCheckoutNavigationState(window.history.state as CheckoutNavigationState | null) }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  useEffect(() => {
    if (reduceMotion || route !== '/') return
    const toHero = window.setTimeout(() => heroSection.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 2800)
    return () => window.clearTimeout(toHero)
  }, [reduceMotion, route])
  useEffect(() => {
    const node = logoSection.current
    if (!node || reduceMotion) { if (reduceMotion) setLogoVisible(true); return }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setLogoVisible(true); observer.disconnect() } }, { threshold: .36 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduceMotion])

  const navigate = (path: string, state: CheckoutNavigationState | null = null) => { window.history.pushState(state, '', path); setCheckoutNavigationState(state); setRoute(path); window.scrollTo(0, 0) }
  const openReservation = () => { trackEvent('cta_click', { status: effectiveStatus }); setPanelOpen(true) }
  const onOrderCreated = (order: OrderSuccessResponse) => {
    const checkout = { order_id: order.order_id, checkout_url: order.checkout_url, hold_expires_at: order.hold_expires_at }
    sessionStorage.setItem(`cookie-pitada-checkout-${order.order_id}`, JSON.stringify(checkout))
    setPanelOpen(false)
    navigate(`/checkout/${order.order_id}`, { checkout_url: order.checkout_url, hold_expires_at: order.hold_expires_at })
  }
  if (route.startsWith('/checkout/')) return <Suspense fallback={<main className="min-h-[100svh] bg-cocoa" />}><CheckoutPage orderId={route.split('/').pop() || ''} checkoutUrl={checkoutNavigationState?.checkout_url} holdExpiresAt={checkoutNavigationState?.hold_expires_at} onBack={() => navigate('/')} /></Suspense>

  return <main className="cocoa-shell relative overflow-x-clip bg-cocoa pb-36 text-cream md:pb-24">
    <section ref={logoSection} aria-labelledby="brand-title" className="logo-section relative grid min-h-[62svh] place-items-center overflow-hidden px-6 py-10 md:min-h-[min(68svh,42rem)] md:py-12">
      <div className="warm-glow warm-glow--lower" aria-hidden="true" />
      <motion.div initial={{ opacity: 0, scale: .96, y: 12, filter: 'blur(14px)' }} animate={logoVisible ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' } : {}} transition={{ duration: 1.05, ease: [0.16, 1, .3, 1] }} className="relative z-10 w-full text-center">
        <div className="brand-logo-frame">
          <img id="brand-title" src={brandLogo} alt="Cookie Pitada de Amor" className="brand-logo-entrance block object-contain" />
        </div>
        <motion.p initial={{ opacity: 0, y: 10, letterSpacing: '0.28em' }} animate={logoVisible ? { opacity: 1, y: 0, letterSpacing: '0.12em' } : {}} transition={{ duration: .8, delay: .48, ease: [0.16, 1, .3, 1] }} className="mt-3 font-body text-[clamp(1.1rem,3vw,1.5rem)] font-semibold leading-none text-peach [text-shadow:0_12px_32px_rgba(255,179,107,.16)]">APRESENTA</motion.p>
      </motion.div>
    </section>
    <section ref={heroSection}><CrookieHero onReserve={openReservation} availableUnits={data.availability.units_free_total} pickupDate={data.settings.pickup_date} /></section>
    <AvailableCrookies data={data} onReserve={openReservation} />
    <HowItWorks data={data} />
    <StoreFooter data={data} onReserve={openReservation} />
    {effectiveStatus !== 'closed' && <Button onClick={openReservation} className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-[min(calc(100%-2rem),360px)] -translate-x-1/2 bg-brand px-6 text-cocoa shadow-[0_18px_36px_rgba(0,0,0,.48)] hover:bg-peach">{contextualCta}</Button>}
    {panelOpen && <Suspense fallback={null}><ReservationPanel open={panelOpen} mode="reserve" initialData={data} quantities={quantities} onQuantitiesChange={setQuantities} onOpenChange={setPanelOpen} onOrderCreated={onOrderCreated} /></Suspense>}
  </main>
}
