-- CreateEnum
CREATE TYPE "Language" AS ENUM ('es-ES', 'en-US');

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'es-ES';
