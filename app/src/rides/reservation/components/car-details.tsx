import {
    getCarImage,
    getDownloadFileSignedURL
} from 'wasp/client/operations';
import { Car } from 'wasp/entities'
import { FilledStarIcon } from "../../../components/icons/filled-star"
import { useEffect, useState } from 'react'

interface CarCardProps {
    car: Car
}

export function CarDetails({ car }: CarCardProps) {
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
        <div className="grid grid-cols-1 gap-5 min-[360px]:flex">
            <div className="relative aspect-square w-[100px] shrink-0">
                <img
                    src={signedUrl ?? ''}
                    alt={car.name}
                    className="rounded-xl object-cover absolute inset-0 w-full h-full"
                />
            </div>
            <div className="flex flex-col gap-1 text-balance capitalize">
                <strong className="font-medium leading-5">{car.name}</strong>
                <span className="text-[14px] leading-5">{car.transmission}</span>
                <span className="text-[14px] leading-5">{car.powertrain}</span>
                <div className="flex flex-row items-center gap-0.5 text-[15px]">
                    <FilledStarIcon className="size-3 shrink-0" />
                    <strong className="font-medium">{Number(car.rating).toFixed(1)}</strong>
                    <span className="text-[14px]">({car.reviewCount} reviews)</span>
                </div>
            </div>
        </div>
    )
}