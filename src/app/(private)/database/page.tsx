import DatabaseComponent from '@/components/database'
import { getUser } from '@/services/server-user'
import { redirect } from 'next/navigation'

export default async function DatabasePage() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return <DatabaseComponent user={user} />
}
