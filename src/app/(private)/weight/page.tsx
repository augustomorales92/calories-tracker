import { WeightTracker } from '@/components/weight/weight-tracker'
import { getUser } from '@/services/server-user'
import { redirect } from 'next/navigation'

export default async function WeightPage() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Weight & Photos</h2>
      <WeightTracker userId={user.id} />
    </div>
  )
}
