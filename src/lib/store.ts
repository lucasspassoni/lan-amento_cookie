import { supabase } from './supabase'

export type CampaignStatus = 'coming_soon' | 'open' | 'sold_out' | 'closed'
export type StoreSettings = {
  status: CampaignStatus
  slogan: string
  service_area: string
  pool_units_cap: number
  max_units_per_customer: number | null
  low_stock_threshold: number
  pickup_date: string | null
  pickup_start_time: string | null
  pickup_end_time: string | null
  pickup_location: string | null
  store_address: string | null
  store_hours: string | null
  owner_whatsapp: string | null
}
export type Product = {
  id: number
  slug: string
  name: string
  description: string
  photo_url: string | null
  price: number
  sort_order: number
  units_free: number
}
export type StoreAvailability = { units_free_total: number; is_sold_out: boolean }
export type StoreData = { settings: StoreSettings; products: Product[]; availability: StoreAvailability }

export const fallbackSettings: StoreSettings = {
  status: 'coming_soon', slogan: 'Em breve vem por aí', service_area: 'Jundiaí - SP e região', pool_units_cap: 30,
  max_units_per_customer: 4, low_stock_threshold: 2, pickup_date: '2026-10-16', pickup_start_time: null,
  pickup_end_time: null, pickup_location: null, store_address: null, store_hours: null, owner_whatsapp: null,
}

export const fallbackProducts: Product[] = [
  { id: 1, slug: 'nutella', name: 'Crookie Nutella 🥐🍫', description: 'Croissant, recheado com massa tradicional de baunilha, Nutella, finalizada com mais Nutella e granulé meio amargo Melken.', photo_url: null, price: 66.99, sort_order: 1, units_free: 30 },
  { id: 2, slug: 'tradicional', name: 'Crookie Tradicional 🥐🍪', description: 'Croissant com massa de cookie tradicional, finalizado com Açúcar gelado.', photo_url: null, price: 43.99, sort_order: 2, units_free: 30 },
  { id: 3, slug: 'kinder-bueno', name: 'Crookie Kinder Bueno', description: 'Croissant, recheado com cookie tradicional de baunilha, creme Bueno, finalizado com mais creme Bueno e bombom Kinder White (Serve até 2 pessoas).', photo_url: null, price: 66.99, sort_order: 3, units_free: 30 },
]

export const fallbackStoreData: StoreData = { settings: fallbackSettings, products: fallbackProducts, availability: { units_free_total: 30, is_sold_out: false } }

export async function fetchStoreData(): Promise<StoreData> {
  if (!supabase) return fallbackStoreData
  const [settingsResponse, productsResponse, availabilityResponse] = await Promise.all([
    supabase.from('store_settings').select('status,slogan,service_area,pool_units_cap,max_units_per_customer,low_stock_threshold,pickup_date,pickup_start_time,pickup_end_time,pickup_location,store_address,store_hours,owner_whatsapp').eq('id', 1).single(),
    supabase.from('product_availability').select('id,slug,name,description,photo_url,price,sort_order,units_free').order('sort_order'),
    supabase.from('store_availability').select('units_free,is_sold_out').single(),
  ])
  if (settingsResponse.error) throw settingsResponse.error
  if (productsResponse.error) throw productsResponse.error
  if (availabilityResponse.error) throw availabilityResponse.error
  return {
    settings: settingsResponse.data as StoreSettings,
    products: (productsResponse.data ?? []).map((product) => ({ ...product, id: Number(product.id), price: Number(product.price), units_free: Number(product.units_free) })) as Product[],
    availability: { units_free_total: Number(availabilityResponse.data.units_free), is_sold_out: Boolean(availabilityResponse.data.is_sold_out) },
  }
}

export function getEffectiveStatus(settings: StoreSettings, availability: StoreAvailability): CampaignStatus {
  return settings.status === 'open' && availability.is_sold_out ? 'sold_out' : settings.status
}
