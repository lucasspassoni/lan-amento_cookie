import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { brandLogo } from '../config/heroAssets'

type SavedCheckout = { order_id: string; checkout_url: string; hold_expires_at: string }

function readSavedCheckout(orderId: string): SavedCheckout | null {
  const saved = sessionStorage.getItem(`cookie-pitada-checkout-${orderId}`)
  if (!saved) return null
  try {
    const value = JSON.parse(saved) as Partial<SavedCheckout>
    return value.order_id === orderId && typeof value.checkout_url === 'string' && typeof value.hold_expires_at === 'string'
      ? value as SavedCheckout
      : null
  } catch { return null }
}

export function CheckoutPage({ orderId, checkoutUrl, holdExpiresAt, onBack }: { orderId: string; checkoutUrl?: string; holdExpiresAt?: string; onBack: () => void }) {
  const saved = readSavedCheckout(orderId)
  const paymentUrl = checkoutUrl ?? saved?.checkout_url
  const holdExpiry = holdExpiresAt ?? saved?.hold_expires_at
  const expiry = holdExpiry ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(holdExpiry)) : null
  return <main className="grid min-h-[100svh] place-items-center bg-cocoa px-5 py-10 text-center text-cream"><section className="w-full max-w-lg"><img src={brandLogo} alt="Cookie Pitada de Amor" className="mx-auto h-36 w-48 object-contain mix-blend-screen" /><CheckCircle2 className="mx-auto mt-4 text-brand" size={52} /><h1 className="mt-5 font-display text-5xl leading-none">Pedido recebido</h1><p className="mx-auto mt-5 max-w-sm text-base leading-7 text-cream/65">Seu Crookie ficou reservado. Finalize o pagamento para confirmar seu pedido.</p>{expiry && <p className="mt-4 text-sm text-peach">Reserva válida até {expiry}</p>}{paymentUrl && <a href={paymentUrl} className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-6 font-body text-sm font-semibold text-cocoa transition hover:bg-peach">Ir para o pagamento</a>}<button type="button" onClick={onBack} className="mt-10 inline-flex min-h-11 items-center gap-2 text-sm text-peach underline underline-offset-4"><ArrowLeft size={17} />Voltar para a página inicial</button></section></main>
}
