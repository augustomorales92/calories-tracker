'use server'

import { createClient } from "@/lib/supabase/server"

export async function getMealSections(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('meal_sections')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  return data
}