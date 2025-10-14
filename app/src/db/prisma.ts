// // src/server/db/prisma.ts
// import { PrismaClient } from '@prisma/client';

// declare global {
//     // Prevent TS error: 'globalThis' has no index signature
//     // eslint-disable-next-line no-var
//     var prisma: PrismaClient | undefined;
// }

// const prisma = globalThis.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== 'production') {
//     globalThis.prisma = prisma;
// }

// export default prisma;
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma