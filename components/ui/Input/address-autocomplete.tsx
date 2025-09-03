"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

interface AddressAutocompleteProps {
  value?: string
  onChange: (address: string, coords?: { lat: number; lon: number }) => void
  placeholder?: string
}

type GeoapifyFeature = {
  properties: {
    formatted: string
    lon?: number
    lat?: number
  }
}

export function AddressAutocomplete({
  value = "",
  onChange,
  placeholder = "Search address",
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const [selected, setSelected] = useState(value)
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([])
  const [loading, setLoading] = useState(false)

  // Keep internal query/selection in sync when value prop changes
useEffect(() => {
    setSelected(value || "")
    setQuery(value || "")
}, [value])


  // Debounced fetch for suggestions
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/geocode?text=${encodeURIComponent(query.trim())}&limit=8`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        })
        if (!res.ok) throw new Error("Failed to fetch suggestions")
        const data = await res.json()
        setSuggestions((data?.features as GeoapifyFeature[]) || [])
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          // swallow network errors; UX continues
          // console.error("[v0] Geoapify error:", err);
        }
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

const handleSelect = (address: string) => {
    const match = suggestions.find((s) => s.properties.formatted === address)
    setSelected(address)
    setQuery(address) // update query immediately
    setOpen(false)
    onChange(address, {
      lat: match?.properties.lat,
      lon: match?.properties.lon,
    })
}


  const hasSelection = !!selected && selected.length > 0

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", !hasSelection && "text-muted-foreground")}
          >
            <span className="truncate text-pretty text-left">{hasSelection ? selected : placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command shouldFilter={false}>
            <div className="flex items-center gap-2 px-2 pt-2">
              <CommandInput placeholder="Type to search..." value={query} onValueChange={setQuery} />
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            <CommandList>
              {!loading && suggestions.length === 0 ? <CommandEmpty>No addresses found.</CommandEmpty> : null}

              <CommandGroup>
                {suggestions.map((s, idx) => {
                  const address = s.properties.formatted
                  const isActive = selected === address
                  return (
                    <CommandItem
                      key={`${address}-${idx}`}
                      value={address}
                      onSelect={() => handleSelect(address)}
                      className="flex items-center gap-2"
                    >
                      <Check className={cn("h-4 w-4", isActive ? "opacity-100" : "opacity-0")} />
                      <span className="truncate">{address}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
