import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://yggsmqyozfpnudmnbpzu.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnZ3NtcXlvemZwbnVkbW5icHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NDM0NzgsImV4cCI6MjA5NzMxOTQ3OH0.nDtUlOteQVZVkxnB2UiIPyOXwwEaqiCUx6PuChiwHFY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
