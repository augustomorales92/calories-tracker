'use client'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  date: Date
  onSelect: (date: Date) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DatePicker({
  date,
  onSelect,
  open,
  onOpenChange
}: DatePickerProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            ' justify-center text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            if (date) onSelect(date)
            onOpenChange(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
