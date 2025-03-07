import dotenv from 'dotenv';
import NodeCache from 'node-cache';
dotenv.config();

export const kv = new NodeCache({ stdTTL: 60 * 60 * 1, checkperiod: 60 * 60 });