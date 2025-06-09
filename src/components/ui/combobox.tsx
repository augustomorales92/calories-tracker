'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface ComboboxProps {
  items: { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  className?: string
}

export function Combobox({
  items,
  value,
  onValueChange,
  placeholder = 'Select an item...',
  emptyText = 'No items found',
  className
}: ComboboxProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          <span className="block truncate">
            {value
              ? items.find((item) => item.value === value)?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList className="max-h-56">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={(currentLabel) => {
                    const selectedItem = items.find(
                      (item) =>
                        item.label.toLowerCase() === currentLabel.toLowerCase()
                    )
                    onValueChange(
                      selectedItem?.value === value
                        ? ''
                        : selectedItem?.value || ''
                    )
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
