"use client"

import { Link, useSearchParams } from 'react-router-dom'
import { SearchParams } from "../../../lib/types"
import { Button } from "../../../components/ui/button"

export function CarDetailsButton({ carSlug }: { carSlug: string }) {
    const [searchParams] = useSearchParams()
    const newParams = new URLSearchParams(searchParams.toString())

    const location = searchParams.get(SearchParams.LOCATION)
    const checkin = searchParams.get(SearchParams.CHECKIN)
    const checkout = searchParams.get(SearchParams.CHECKOUT)

    if (location) newParams.set(SearchParams.LOCATION, location)
    if (checkin) newParams.set(SearchParams.CHECKIN, checkin)
    if (checkout) newParams.set(SearchParams.CHECKOUT, checkout)

    const href = `/cars/${carSlug}${newParams.toString() ? `?${newParams.toString()}` : ''}`

    return (
        <Button
            variant={"outline"}
            className="h-9 w-full hover:border-transparent hover:bg-neutral-900 hover:text-white"
            asChild
        >
            <Link to={href}>View Details</Link>
        </Button>
    )
}