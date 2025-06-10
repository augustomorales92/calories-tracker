'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DatePicker } from '../date-picker'
import { Button } from '../ui/button'

export default function DateSelector({
  currentDate,
  setCurrentDate
}: {
  currentDate: string
  setCurrentDate: (date: string) => void
}) {
  const router = useRouter()
  const changeDate = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate || '')
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1))
    const newDate = date.toISOString().split('T')[0]

    // Actualiza el estado
    setCurrentDate(newDate)

    // Cambia la URL
    router.push(`?date=${newDate}`, { scroll: false })
  }
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" size="sm" onClick={() => changeDate('prev')}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <DatePicker
        date={new Date(currentDate || '')}
        onSelect={(date) => {
          if (date) {
            const newDate = date.toISOString().split('T')[0]
            setCurrentDate(newDate)
          }
        }}
        open={isCalendarOpen}
        onOpenChange={setIsCalendarOpen}
      />
      <Button variant="outline" size="sm" onClick={() => changeDate('next')}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
