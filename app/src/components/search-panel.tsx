"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import type { Location } from 'wasp/entities'
import { addDays, format, isBefore } from "date-fns"

import { SearchParams } from "../lib/types"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"
import { Separator } from "./ui/separator"
import { CheckIcon } from "./icons/check"
import { SearchIcon } from "./icons/search"
import { SelectorIcon } from "./icons/selector"
import * as React from "react"

import { cn, constructUrlWithParams } from "../lib/utils"

export function SearchPanel({ locations }: { locations: Location[] }) {
  const navigate = useNavigate()  // replaces `const { push } = useRouter()`
  const [searchParams, setSearchParams] = useSearchParams()

  const [openPickup, setOpenPickup] = useState(false)
  const [openDropoff, setOpenDropoff] = useState(false)

  const [pickup, setPickup] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [pickupDate, setPickupDate] = useState<Date>()

  const pickupRef = useRef<HTMLInputElement | null>(null)
  const dropoffRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // const initAutocomplete = () => {
    const initAutocomplete = (ref: React.RefObject<HTMLInputElement>, setFn: any, closeFn: any) => {
      // const input = document.getElementById('product-location') as HTMLInputElement;
      const google = (window as any).google;

      // if (input && google?.maps) {
      if (!google?.maps?.places || !ref.current) return

      const autocomplete = new google.maps.places.Autocomplete(ref.current, {
        fields: ['geometry', 'formatted_address', 'address_components'],
        // types: ['geocode'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        console.log('Place:', place);

        if (!place.geometry?.location || !place.formatted_address) {
          console.warn('Incomplete place data');
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address;

        setFn({ address, lat, lng })
        closeFn(false)
      });
      // }
    };

    const interval = setInterval(() => {
      const google = (window as any).google;
      if (google?.maps?.places) {
        clearInterval(interval);
        initAutocomplete(pickupRef, setPickup, setOpenPickup)
        initAutocomplete(dropoffRef, setDropoff, setOpenDropoff)
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);


  // ✅ Sync with URL params
  useEffect(() => {
    const pickupParam = searchParams.get(SearchParams.PICKUP)
    const dropoffParam = searchParams.get(SearchParams.DROPOFF)
    const dateParam = searchParams.get(SearchParams.DATE)

    if (pickupParam) {
      setPickup(prev => prev ? { ...prev, address: pickupParam } : { address: pickupParam, lat: 0, lng: 0 })
    }
    if (dropoffParam) {
      setDropoff(prev => prev ? { ...prev, address: dropoffParam } : { address: dropoffParam, lat: 0, lng: 0 })
    }
    if (dateParam) setPickupDate(new Date(dateParam))
  }, [searchParams])

  function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!pickup && !dropoff && !pickupDate) return

    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete(SearchParams.PICKUP)
    newParams.delete(SearchParams.DROPOFF)
    newParams.delete(SearchParams.DATE)

    if (pickup?.address) {
      newParams.set(SearchParams.PICKUP, pickup.address)
      newParams.set(SearchParams.PICKUP_LAT, pickup.lat.toString())
      newParams.set(SearchParams.PICKUP_LNG, pickup.lng.toString())
    }

    if (dropoff?.address) {
      newParams.set(SearchParams.DROPOFF, dropoff.address)
      newParams.set(SearchParams.DROPOFF_LAT, dropoff.lat.toString())
      newParams.set(SearchParams.DROPOFF_LNG, dropoff.lng.toString())
    }

    const pickupDateISOString = pickupDate?.toISOString()

    if (pickupDateISOString) newParams.set(SearchParams.DATE, pickupDateISOString)

    navigate(constructUrlWithParams("/deliveries", newParams))
  }

  return (
    <form onSubmit={submitForm} className="w-full">
      <div className="whitespace-nowrap rounded-full border border-black/10 bg-white text-black shadow-lg shadow-neutral-900/5 transition-shadow hover:shadow hover:shadow-neutral-900/5">
        <div className="relative grid h-[var(--search-panel-height)] w-full grid-cols-1 items-center">
          <div className="grid h-full grid-cols-[33.333333%_33.333333%_33.333333%] items-center justify-center">
            <div className="relative h-full">
              <Separator
                orientation="vertical"
                className="absolute inset-y-0 right-0 m-auto h-6 shrink-0"
              />
              <div className="flex size-full items-center justify-center px-0">
                <Popover open={openPickup} onOpenChange={setOpenPickup}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      role="combobox"
                      aria-expanded={openPickup}
                      className="size-full flex-col overflow-hidden rounded-full border-none px-5 py-0 focus-visible:z-10"
                    >
                      <div className="flex size-full items-center justify-between">
                        <div className="flex size-full flex-col items-start justify-center truncate">
                          <div className="text-[13px] font-bold">
                            Pick-up location
                          </div>
                          {pickup?.address ? (
                            <p className="truncate font-semibold text-neutral-800">
                              {pickup.address}
                            </p>
                          ) : (
                            <div className="text-neutral-500">
                              Select pick-up location
                            </div>
                          )}
                        </div>
                        <SelectorIcon className="-mr-2 ml-2  size-5 shrink-0 opacity-50" />
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput ref={pickupRef} placeholder="Enter a pick-up location..." />
                      <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        {/* <CommandGroup>
                          {locations.map((loc) => (
                            <CommandItem
                              key={loc.id}
                              value={loc.handle}
                              onSelect={(currentValue) => {
                                setPickupLocation(
                                  currentValue === pickupLocation ? "" : currentValue
                                )
                                setOpenPickup(false)
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 size-4 shrink-0",
                                  pickupLocation === loc.handle
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {loc.name}
                            </CommandItem>
                          ))}
                        </CommandGroup> */}
                        <CommandItem disabled>Suggestions powered by Google</CommandItem>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="relative h-full">
              <Separator
                orientation="vertical"
                className="absolute inset-y-0 right-0 m-auto h-6 shrink-0"
              />
              <div className="flex size-full items-center justify-center px-0">
                <Popover open={openDropoff} onOpenChange={setOpenDropoff}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      role="combobox"
                      aria-expanded={openDropoff}
                      className="size-full flex-col overflow-hidden rounded-full border-none px-5 py-0 focus-visible:z-10"
                    >
                      <div className="flex size-full items-center justify-between">
                        <div className="flex size-full flex-col items-start justify-center truncate">
                          <div className="text-[13px] font-bold">
                            Drop-off location
                          </div>
                          {dropoff?.address ? (
                            <p className="truncate font-semibold text-neutral-800">
                              {dropoff.address}
                            </p>
                          ) : (
                            <div className="text-neutral-500">
                              Select drop-off location
                            </div>
                          )}
                        </div>
                        <SelectorIcon className="-mr-2 ml-2  size-5 shrink-0 opacity-50" />
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput ref={dropoffRef} placeholder="Enter a drop-off location..." />
                      <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        {/* <CommandGroup>
                          {locations.map((loc) => (
                            <CommandItem
                              key={loc.id}
                              value={loc.handle}
                              onSelect={(currentValue) => {
                                setDropoffLocation(
                                  currentValue === dropoffLocation ? "" : currentValue
                                )
                                setOpenDropoff(false)
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 size-4 shrink-0",
                                  dropoffLocation === loc.handle
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {loc.name}
                            </CommandItem>
                          ))}
                        </CommandGroup> */}
                        <CommandItem disabled>Suggestions powered by Google</CommandItem>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="relative h-full">
              <Separator
                orientation="vertical"
                className="absolute inset-y-0 right-0 m-auto h-6 shrink-0"
              />
              <div className="flex size-full items-center justify-center px-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"ghost"}
                      className="size-full flex-col overflow-hidden rounded-full border-none px-5 py-0 focus-visible:z-10"
                    >
                      <div className="flex size-full flex-col items-start justify-center truncate">
                        <div className="text-[13px] font-bold">Pick-up Date</div>
                        {pickupDate ? (
                          <div className="font-semibold text-neutral-800">
                            {format(pickupDate, "LLL dd, y")}
                          </div>
                        ) : (
                          <div className="truncate text-neutral-500">
                            a date
                          </div>
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={pickupDate}
                      onSelect={setPickupDate}
                      initialFocus
                      disabled={(date) => date <= addDays(new Date(), 1)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="absolute right-2 z-20">
            <Button
              type="submit"
              className="flex size-[calc(var(--search-panel-height)_-_1.25rem)] shrink-0 items-center justify-center rounded-full bg-black text-white"
            >
              <span className="sr-only">Search</span>
              <SearchIcon className="size-[calc((var(--search-panel-height)_-_1.25rem)/2.66)] shrink-0 [stroke-width:3px]" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
