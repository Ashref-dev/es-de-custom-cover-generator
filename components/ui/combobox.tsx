"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  popoverWidth?: "trigger" | "content"
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  emptyText = "No results found",
  className,
  triggerClassName,
  contentClassName,
  popoverWidth = "trigger"
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  
  const selectedOption = options.find(option => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-10 px-3", triggerClassName)}
        >
          <div className="flex items-center gap-2.5 truncate">
            {selectedOption?.icon}
            <span className="truncate">{selectedOption?.label || placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "p-0", 
          popoverWidth === "content" ? "min-w-[var(--radix-popover-content-available-width)]" : "w-[var(--radix-popover-trigger-width)]",
          contentClassName
        )}
        align="start"
      >
        <Command className={className}>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} className="h-9" />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2.5 py-1.5"
                >
                  {option.icon}
                  <span>{option.label}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 