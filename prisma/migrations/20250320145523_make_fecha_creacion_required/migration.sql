/*
  Warnings:

  - Made the column `fecha_creacion` on table `usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "usuario" ALTER COLUMN "fecha_creacion" SET NOT NULL;
