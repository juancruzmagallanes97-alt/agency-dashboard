import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL!
const key = process.env.SUPABASE_ANON_KEY!

// Singleton — reused across server requests
export const supabase = createClient(url, key)
