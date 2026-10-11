import { appEnv } from '../lib/runtime-env'

export type CreateOrderItem = {
  product_id: number
  quantity: number
}

export type CreateOrderRequest = {
  full_name: string
  whatsapp: string
  contact_consent: true
  items: CreateOrderItem[]
  session_id: string
}

export type OrderSuccessResponse = {
  order_id: string
  order_number: number | string
  total_amount: number
  hold_expires_at: string
  checkout_url: string
}

export type OrderErrorResponse = {
  error_code: string
}

export type CreateOrderResult =
  | { ok: true; data: OrderSuccessResponse }
  | { ok: false; error_code: string }

export class OrderRequestError extends Error {
  constructor(public readonly kind: 'network' | 'timeout' | 'invalid_response' | 'misconfigured') {
    super(kind)
    this.name = 'OrderRequestError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isOrderSuccess(value: Record<string, unknown>): value is OrderSuccessResponse {
  return typeof value.order_id === 'string'
    && value.order_id.length > 0
    && (typeof value.order_number === 'string' || typeof value.order_number === 'number')
    && typeof value.total_amount === 'number'
    && typeof value.hold_expires_at === 'string'
    && typeof value.checkout_url === 'string'
}

export function interpretCreateOrderResponse(payload: unknown): CreateOrderResult | null {
  if (!isRecord(payload)) return null
  if (typeof payload.error_code === 'string' && payload.error_code.length > 0) return { ok: false, error_code: payload.error_code }
  if (isOrderSuccess(payload)) return { ok: true, data: payload }
  return null
}

export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResult> {
  if (appEnv.orderSimulation) {
    return {
      ok: true,
      data: {
        order_id: crypto.randomUUID(),
        order_number: 0,
        total_amount: 0,
        hold_expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
        checkout_url: '',
      },
    }
  }

  const webhookUrl = appEnv.createOrderWebhookUrl
  if (!webhookUrl) throw new OrderRequestError('misconfigured')

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 20_000)

  try {
    let response: Response
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      })
    } catch (error) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw new OrderRequestError('timeout')
      throw new OrderRequestError('network')
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      throw new OrderRequestError('invalid_response')
    }

    if (!response.ok) throw new OrderRequestError('network')

    const interpreted = interpretCreateOrderResponse(payload)
    if (!interpreted) throw new OrderRequestError('invalid_response')
    return interpreted
  } finally {
    window.clearTimeout(timeout)
  }
}
