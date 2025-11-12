"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/utils/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import * as LucideIcons from "lucide-react"

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
}

export function IconPicker({ value, onChange, onBlur }: IconPickerProps) {
  const [open, setOpen] = useState(false)

  // Get all icon names from Lucide
  const iconNames = Object.keys(LucideIcons)
    .filter((name) => name !== "createLucideIcon" && name !== "default" && !name.startsWith("Lucide"))
    .sort()

  // Get the actual icon component
  const IconComponent = value ? (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[value] : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onClick={() => onBlur()}
        >
          <div className="flex items-center gap-2">
            {IconComponent && <IconComponent className="h-4 w-4" />}
            <span>{value || "Select an icon"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search icons..." />
          <CommandList>
            <CommandEmpty>No icon found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {iconNames.map((iconName) => {
                const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[iconName]
                return (
                  <CommandItem
                    key={iconName}
                    value={iconName}
                    onSelect={() => {
                      onChange(iconName)
                      setOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{iconName}</span>
                    </div>
                    <Check className={cn("ml-auto h-4 w-4", value === iconName ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
