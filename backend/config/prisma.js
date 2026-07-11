import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

export default prisma;
