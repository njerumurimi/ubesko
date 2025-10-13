import { ReactNode } from "react"
import {
    useQuery,
    getCars
} from 'wasp/client/operations';
import { FiltersButton } from "./filters-button"

interface FiltersProps {
    trigger?: ReactNode
}

export default function Filters({ trigger }: FiltersProps) {
    const { data: cars, isLoading, error } = useQuery(getCars)

    const { MIN_PRICE, MAX_PRICE } = (cars ?? []).reduce(
        (acc, car) => {
            acc.MIN_PRICE = Math.min(acc.MIN_PRICE, Number(car.pricePerDay))
            acc.MAX_PRICE = Math.max(acc.MAX_PRICE, Number(car.pricePerDay))
            return acc
        },
        { MIN_PRICE: Infinity, MAX_PRICE: -Infinity }
    )

    return (
        <FiltersButton
            initialMinPrice={Math.round(MIN_PRICE)}
            initialMaxPrice={Math.round(MAX_PRICE)}
            trigger={trigger}
        />
    )
}