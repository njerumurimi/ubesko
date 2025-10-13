import type { Car } from '@wasp/entities'
import { HttpError } from 'wasp/server';
import type {
    GetCarByHandle,
    GetCars
} from 'wasp/server/operations';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';
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

    return context.entities.Car.findUnique({
        where: { handle },
    })
}