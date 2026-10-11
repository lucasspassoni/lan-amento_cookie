type RuntimeEnvironment = {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_PUBLISHABLE_KEY?: string
  VITE_N8N_CREATE_ORDER_WEBHOOK_URL?: string
  VITE_ORDER_SIMULATION?: string
}

declare global {
  interface Window {
    __COOKIE_PITADA_ENV__?: RuntimeEnvironment
  }
}

const runtimeEnvironment = typeof window === 'undefined' ? undefined : window.__COOKIE_PITADA_ENV__

// Vite uses these values locally. In production, nginx writes runtime-env.js
// from Easypanel environment variables before serving the static application.
export const appEnv = {
  supabaseUrl: runtimeEnvironment?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL,
  supabasePublishableKey: runtimeEnvironment?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  createOrderWebhookUrl: runtimeEnvironment?.VITE_N8N_CREATE_ORDER_WEBHOOK_URL || import.meta.env.VITE_N8N_CREATE_ORDER_WEBHOOK_URL,
  orderSimulation: (runtimeEnvironment?.VITE_ORDER_SIMULATION || import.meta.env.VITE_ORDER_SIMULATION) === 'true',
} as const
