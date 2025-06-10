'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'

export const useUser = () => {
  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User | null> => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()
      return user
    }
  })

  return { user, isLoading, error }
}
