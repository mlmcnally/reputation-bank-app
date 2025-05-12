import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL // URL of Supabase project
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Anon key from Supabase

// Create the Supabase client using these variables
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }
