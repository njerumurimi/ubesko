import type { Car } from '@wasp/entities'
import { HttpError } from 'wasp/server';
import type {
    GetCarByHandle,
    GetCars
} from 'wasp/server/operations';

export const getCars: GetCars<void, Car[]> = async (_args, context) => {
    if (!context.user) {
        throw new HttpError(401)
    }

    return context.entities.Car.findMany()
}

type GetCarByHandleArgs = { handle: string }

export const getCarByHandle: GetCarByHandle<GetCarByHandleArgs, Car | null> = async ({ handle }, context) => {
    if (!context.user) {
        throw new HttpError(401)
    }

    return context.entities.Car.findUnique({
        where: { handle },
    })
}