'use server'

import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}