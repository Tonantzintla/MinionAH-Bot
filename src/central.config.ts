import NodeCache from 'node-cache';
import { PrismaClient } from '@prisma/client';

export const kv = new NodeCache({ stdTTL: 60 * 60 * 1, checkperiod: 60 * 60 });

export const prisma = new PrismaClient()
await prisma.$connect()