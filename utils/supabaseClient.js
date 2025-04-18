import { createClient } from '@supabase/supabase-js'

// Get environment variables for Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create the Supabase client using these variables
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }
