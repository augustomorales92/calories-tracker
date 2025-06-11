import Dashboard from '@/components/dashboard'
import LoadingComponent from '@/components/Loading'
import { getUserProfile } from '@/services/data'
import { getUser } from '@/services/server-user'
import { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

const Content = ({
  currentDate,
  user
}: {
  currentDate: string
  user: User
}) => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <Dashboard initialDate={currentDate} user={user} />
    </Suspense>
  )
}

export default async function CalorieTrackerPage({
  searchParams
}: {
  searchParams: Promise<{ date: string }>
}) {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  await getUserProfile(user)

  const params = await searchParams
  const currentDate = params.date ?? new Date().toISOString().split('T')[0]

  return <Content currentDate={currentDate} user={user} />
}
