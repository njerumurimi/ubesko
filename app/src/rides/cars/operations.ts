import type { Car, File } from 'wasp/entities'
import { HttpError } from 'wasp/server';
import type {
    GetCarByHandle,
    GetCars,
    GetCarImage
} from 'wasp/server/operations';
import { ensureArgsSchemaOrThrowHttpError } from '../../server/validation';
import * as z from 'zod';

export const getCars: GetCars<void, Car[]> = async (_args, context) => {
    if (!context.user) {
        throw new HttpError(401)
    }

    return context.entities.Car.findMany()
}

const getCarByHandleInputSchema = z.object({
    handle: z.string().nonempty(),
});

type GetCarByHandleInput = z.infer<typeof getCarByHandleInputSchema>;

export const getCarByHandle: GetCarByHandle<GetCarByHandleInput, Car> = async (rawArgs, context) => {
    if (!context.user) {
        throw new HttpError(401)
    }

    const { handle } = ensureArgsSchemaOrThrowHttpError(getCarByHandleInputSchema, rawArgs);

    const car = await context.entities.Car.findUnique({
        where: { handle },
    })

    if (!car) {
        throw new HttpError(404, `Car with handle "${handle}" not found.`)
    }

    return car
}

const getCarImageInputSchema = z.object({
    imageUrl: z.string().url('Image URL must be a valid URL'),
});

type GetCarImageInput = z.infer<typeof getCarImageInputSchema>;

type GetCarImageOutput = {
    images: Pick<
        File,
        "id" | "name" | "key" | "uploadUrl" | "createdAt"
    >[];
};

export const getCarImage: GetCarImage<
    GetCarImageInput,
    GetCarImageOutput
> = async (rawArgs, context) => {
    if (!context.user) {
        throw new HttpError(401, 'Unauthorized');
    }

    // Check if the user has the necessary permissions (e.g., if they're an admin)
    if (!context.user.isAdmin) {
        throw new HttpError(403, 'Unauthorized');
    }

    // Validate the input
    const { imageUrl } = ensureArgsSchemaOrThrowHttpError(
        getCarImageInputSchema,
        rawArgs
    );

    // Filter for product images with the exact imageUrl
    const filters = {
        name: {
            startsWith: "car_image_", // Adjust prefix as needed
        },
        uploadUrl: imageUrl, // Match the provided imageUrl
    };

    const queryResults = await context.entities.File.findMany({
        where: filters,
        select: {
            id: true,
            name: true,
            key: true,
            uploadUrl: true,
            createdAt: true,
        },
    });

    return {
        images: queryResults,
    };
};
