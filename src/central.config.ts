import { PrismaClient } from '$generated/prisma';
import NodeCache from 'node-cache';

export const kv = new NodeCache({ stdTTL: 60 * 60 * 1, checkperiod: 60 * 60 });

export const prisma = new PrismaClient()
await prisma.$connect()