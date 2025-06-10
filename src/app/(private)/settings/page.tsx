import Settings from '@/components/settings'
import { getUser } from '@/services/server-user'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return <Settings user={user} />
}
