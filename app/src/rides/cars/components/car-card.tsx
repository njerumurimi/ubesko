import { Car } from 'wasp/entities'
import { formatAmountForDisplay } from "../../../lib/utils"
import { AutomaticGearboxIcon } from "../../../components/icons/automatic-gearbox"
import { BatteryAutomotiveIcon } from "../../../components/icons/battery-automotive"
import { EngineIcon } from "../../../components/icons/engine"
import { FilledStarIcon } from "../../../components/icons/filled-star"
import { ManualGearboxIcon } from "../../../components/icons/manual-gearbox"
import { CarDetailsButton } from "./car-details-button"
import { useEffect, useState } from 'react'
import { getCarImage, getDownloadFileSignedURL } from 'wasp/client/operations'

interface CarCardProps {
    car: Car
}

export function CarCard({ car }: CarCardProps) {
    if (!car) {
        return null
    }

    const [imageKeys, setImageKeys] = useState<{ [uploadUrl: string]: string }>({})
    const [imageUrlsMap, setImageUrlsMap] = useState<{ [uploadUrl: string]: string }>({})

    const fetchImageKeys = async (uploadUrls: string[]) => {
        try {
            const keyPromises = uploadUrls.map(async (uploadUrl) => {
                const { images } = await getCarImage({ imageUrl: uploadUrl }) // server query: find File by uploadUrl
                return images.length > 0 ? { uploadUrl, key: images[0].key } : null
            })

            const results = await Promise.allSettled(keyPromises)
            const keyArray = results
                .filter((r): r is PromiseFulfilledResult<{ uploadUrl: string; key: string }> => r.status === 'fulfilled' && r.value !== null)
                .map((r) => r.value)

            setImageKeys((prev) => ({
                ...prev,
                ...Object.fromEntries(keyArray.map(({ uploadUrl, key }) => [uploadUrl, key])),
            }))

            // Now fetch signed URLs
            fetchSignedUrls(keyArray)
        } catch (err) {
            console.error('Error resolving image keys', err)
        }
    }

    const fetchSignedUrls = async (keyArray: { uploadUrl: string; key: string }[]) => {
        try {
            const urlPromises = keyArray.map(async ({ uploadUrl, key }) => {
                const signedUrl = await getDownloadFileSignedURL({ key })
                return { uploadUrl, url: signedUrl }
            })

            const results = await Promise.allSettled(urlPromises)
            const urlArray = results
                .filter((r): r is PromiseFulfilledResult<{ uploadUrl: string; url: string }> => r.status === 'fulfilled')
                .map((r) => r.value)

            setImageUrlsMap((prev) => ({
                ...prev,
                ...Object.fromEntries(urlArray.map(({ uploadUrl, url }) => [uploadUrl, url])),
            }))
        } catch (err) {
            console.error('Error fetching signed URLs', err)
        }
    }

    // Trigger when products change
    useEffect(() => {

        if (!car?.imageUrl) return

        const uploadUrls = [car.imageUrl].filter(
            (u: string): u is string => !!u && !imageKeys[u]
        )

        if (uploadUrls.length > 0) {
            fetchImageKeys(uploadUrls)
        }
    }, [car?.imageUrl])

    const signedUrl = car.imageUrl ? imageUrlsMap[car.imageUrl] : null

    return (
        <article className="overflow-hidden rounded-[10px] border border-black/[0.08] bg-white text-sm shadow-sm">
            <div className="relative aspect-video h-40 w-full">
                <img
                    src={signedUrl ?? ''}
                    alt={car.name}
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col gap-1.5 p-5">
                <div className="flex items-center justify-between gap-1">
                    <span className="truncate font-semibold">{car.name}</span>
                    <div className="inline-flex shrink-0 items-center justify-center gap-x-1">
                        <FilledStarIcon className="inline size-3 shrink-0 " />
                        <span className="leading-none">
                            <span className="font-medium">{Number(car.rating).toFixed(1)}</span>{" "}
                            <span className="text-neutral-600">
                                {Number(car.reviewCount) > 0 && `(${car.reviewCount})`}
                            </span>
                        </span>
                    </div>
                </div>
                <div className="capitalize text-neutral-600">
                    <div className="flex items-center">
                        {car.powertrain.toLowerCase() === "electric" ? (
                            <BatteryAutomotiveIcon className="mr-1.5 inline size-[14px] shrink-0" />
                        ) : (
                            <EngineIcon className="mr-1.5 inline size-[14px] shrink-0" />
                        )}
                        <span>{car.powertrain}</span>
                    </div>
                    <div className="flex items-center">
                        {car.transmission.toLowerCase() === "automatic" ? (
                            <AutomaticGearboxIcon className="mr-1.5 inline size-[14px] shrink-0" />
                        ) : (
                            <ManualGearboxIcon className="mr-1.5 inline size-[14px] shrink-0" />
                        )}
                        <span>{car.transmission}</span>
                    </div>
                </div>
                <div className="pt-1">
                    <span className="text-[15px] font-semibold tabular-nums leading-none">
                        {formatAmountForDisplay(
                            Math.round(Number(car.pricePerDay)),
                            car.currency,
                            true
                        )}
                    </span>
                    <span className="ml-1 leading-none text-neutral-900">day</span>
                </div>
                <div className="pt-4">
                    <CarDetailsButton carSlug={car.handle} />
                </div>
            </div>
        </article>
    )
}