import { differenceInDays, isValid } from "date-fns"
import {
    useQuery,
    getCarByHandle,
    generateCarRentalCheckoutSession
} from 'wasp/client/operations';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom'
import { SearchParams } from "../../lib/types"
import { Separator } from "../../components/ui/separator"
import { ChevronLeftIcon } from "../../components/icons/chevron-left"
import { LogoLink } from "../../components/logoLink"
import { Button } from "../../components/ui/button"
import { BackButton } from "./components/back-button"
import { BookDetails } from "./components/book-details"
import { CarDetails } from "./components/car-details"
import { PriceDetails } from "./components/price-details"
import { useAuth } from 'wasp/client/auth';
import { AuthSection } from "./components/auth-section"
import { useNavigate } from 'react-router-dom';

export default function CarReservationPage() {
    const { data: user, isLoading, error } = useAuth(); // Returns AuthUser | null

    const { slug } = useParams<{ slug: string }>()
    const [searchParams] = useSearchParams()
    const checkin = searchParams.get(SearchParams.CHECKIN)
    const checkout = searchParams.get(SearchParams.CHECKOUT)

    const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        data: car,
        isLoading: isCarLoading,
        error: carError,
    } = useQuery(getCarByHandle, { handle: slug! })

    // Validate required fields
    if (!car) {
        throw new Error("Car is missing")
    }


    if (!checkin || !checkout) {
        throw new Error("Missing check-in or check-out dates")
    }

    // Validate date fields
    if (!isValid(new Date(checkin)) || !isValid(new Date(checkout))) {
        throw new Error("Invalid dates")
    }

    const checkinDate = new Date(checkin)
    const checkoutDate = new Date(checkout)

    const days = differenceInDays(checkoutDate, checkinDate)

    if (days <= 0) {
        throw new Error("Invalid date range selected")
    }

    const subtotal = Number(car.pricePerDay) * days
    const taxes = subtotal * 0.16
    const currency = car.currency

    const navigate = useNavigate();

    async function handleRentNowClick() {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!car) {
            setErrorMessage("Car details not available");
            return;
        }

        try {
            setIsPaymentLoading(true);

            const checkoutResults = await generateCarRentalCheckoutSession({
                carId: car.id,
                carName: car.name,
                dailyRate: Number(car.pricePerDay),
                durationDays: days,
                currency: car.currency,
            });

            if (checkoutResults?.sessionUrl) {
                window.open(checkoutResults.sessionUrl, '_self');
            } else {
                throw new Error('Error generating checkout session URL');
            }
        } catch (error: unknown) {
            console.error(error);
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('Error processing payment. Please try again later.');
            }
            setIsPaymentLoading(false); // We only set this to false here and not in the try block because we redirect to the checkout url within the same window
        }
    }

    return (
        <>
            {/* Phone and Tablets */}
            <div className="md:hidden">
                <div className="flex size-full flex-col">
                    {/* header */}
                    <header className="sticky top-0 z-40 border-b border-black/10 bg-white">
                        <div className="px-5">
                            <div className="relative flex h-[var(--site-header-height)] items-center">
                                <BackButton className="z-40 -ml-2">
                                    <ChevronLeftIcon className="size-5 shrink-0" />
                                </BackButton>
                                <div className="absolute inset-0 flex items-center justify-center self-center ">
                                    <h1 className="text-center text-base font-semibold">
                                        Confirm and pay
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </header>
                    {/* main */}
                    <main>
                        <div className="pb-10 pt-2">
                            <div className="px-5 py-3">
                                <CarDetails car={car} />
                            </div>
                            <Separator className="my-3 h-[6px]" />
                            <div className="px-5 py-3">
                                <BookDetails
                                    checkinDate={checkinDate}
                                    checkoutDate={checkoutDate}
                                />
                            </div>
                            <Separator className="my-3 h-[6px]" />
                            <div className="px-5 py-3">
                                <PriceDetails
                                    days={days}
                                    currency={currency}
                                    subtotal={subtotal}
                                    taxes={taxes}
                                />
                            </div>
                            <Separator className="my-3 h-[6px]" />
                            <div className="px-5 py-3">
                                {!user ? (
                                    <AuthSection />
                                ) : (
                                    <Button
                                        onClick={handleRentNowClick}
                                        disabled={isPaymentLoading}
                                        className="w-full py-3 text-lg font-semibold"
                                    >
                                        Pay KES {subtotal + taxes}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
                <header className="h-[var(--site-header-height)] w-full border-b border-black/10">
                    <div className="flex h-full items-center px-5">
                        <LogoLink />
                    </div>
                </header>
                <main>
                    <div className="px-5 py-16">
                        <div className="mx-auto sm:max-w-[90%] sm:px-0 xl:max-w-6xl">
                            <div className="flex items-center">
                                <BackButton className="-ml-12 mr-2">
                                    <ChevronLeftIcon className="size-5 shrink-0" />
                                </BackButton>
                                <h1 className="text-balance text-3xl font-semibold">
                                    Confirm and pay
                                </h1>
                            </div>
                            <div className="py-12">
                                <div className="grid grid-cols-[minmax(400px,560px)_minmax(285px,465px)] items-start justify-between gap-x-14">
                                    <div>
                                        <BookDetails
                                            checkinDate={checkinDate}
                                            checkoutDate={checkoutDate}
                                        />
                                        <Separator className="my-7" />
                                        {!user ? (
                                            <AuthSection />
                                        ) : (
                                            <Button
                                                onClick={handleRentNowClick}
                                                disabled={isPaymentLoading}
                                                className="w-full py-3 text-lg font-semibold"
                                            >
                                                Pay KES {subtotal + taxes}
                                            </Button>
                                        )}
                                    </div>
                                    <aside className="sticky top-[var(--site-header-height)] rounded-xl border">
                                        <div className="p-6">
                                            <CarDetails car={car} />
                                            <Separator className="my-7" />
                                            <div className="hidden md:block">
                                                <PriceDetails
                                                    days={days}
                                                    currency={currency}
                                                    subtotal={subtotal}
                                                    taxes={taxes}
                                                />
                                            </div>
                                        </div>
                                    </aside>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}