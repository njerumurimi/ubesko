import type { Location } from 'wasp/entities'
import { HttpError } from 'wasp/server';
import type {
    GetLocations
} from 'wasp/server/operations';

export const getLocations: GetLocations<void, Location[]> = async (_args, context) => {
    if (!context.user) {
        throw new HttpError(401)
    }

    return context.entities.Location.findMany()
}