import { ProgressCharts } from '@/components/progress/progress-charts'
import { getUser } from '@/services/server-user'
import { redirect } from 'next/navigation'

export default async function ProgressPage() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Progress Charts</h2>
      <ProgressCharts userId={user.id} />
    </div>
  )
}
