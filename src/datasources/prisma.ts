import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var __prisma: typeof extended;
}

const baseClient = new PrismaClient({
  log: ['warn', 'error', 'query'],
});

const extended = baseClient.$extends(
  pagination({
    pages: { limit: 20, includePageCount: true },
  })
);

export const prisma: typeof extended = global.__prisma ?? extended;

// Preserve the client across module reloads in development
if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
