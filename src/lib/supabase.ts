import { createClient } from '@supabase/supabase-js'
import { appEnv } from './runtime-env'

const { supabaseUrl: url, supabasePublishableKey: key } = appEnv

export const supabase = url && key ? createClient(url, key) : null
