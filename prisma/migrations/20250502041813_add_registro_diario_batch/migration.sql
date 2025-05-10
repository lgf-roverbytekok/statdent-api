/*
  Warnings:

  - You are about to drop the column `fecha_registro` on the `registro` table. All the data in the column will be lost.
  - You are about to drop the column `id_operador` on the `registro` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `registro` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_registro_diario,id_codigo,id_grupo_edad]` on the table `registro` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_registro_diario` to the `registro` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "registro" DROP CONSTRAINT "registro_id_codigo_fkey";

-- DropForeignKey
ALTER TABLE "registro" DROP CONSTRAINT "registro_id_grupo_edad_fkey";

-- DropForeignKey
ALTER TABLE "registro" DROP CONSTRAINT "registro_id_operador_fkey";

-- DropForeignKey
ALTER TABLE "registro" DROP CONSTRAINT "registro_id_usuario_fkey";

-- AlterTable
ALTER TABLE "registro" DROP COLUMN "fecha_registro",
DROP COLUMN "id_operador",
DROP COLUMN "id_usuario",
ADD COLUMN     "id_registro_diario" INTEGER NOT NULL,
ALTER COLUMN "id_grupo_edad" DROP NOT NULL;

-- CreateTable
CREATE TABLE "registro_diario" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_operador" INTEGER NOT NULL,

    CONSTRAINT "registro_diario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registro_diario_fecha_id_operador_idx" ON "registro_diario"("fecha", "id_operador");

-- CreateIndex
CREATE UNIQUE INDEX "registro_diario_fecha_id_operador_key" ON "registro_diario"("fecha", "id_operador");

-- CreateIndex
CREATE INDEX "registro_id_registro_diario_idx" ON "registro"("id_registro_diario");

-- CreateIndex
CREATE UNIQUE INDEX "registro_id_registro_diario_id_codigo_id_grupo_edad_key" ON "registro"("id_registro_diario", "id_codigo", "id_grupo_edad");

-- AddForeignKey
ALTER TABLE "registro_diario" ADD CONSTRAINT "registro_diario_id_operador_fkey" FOREIGN KEY ("id_operador") REFERENCES "operador"("id_operador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro" ADD CONSTRAINT "registro_id_registro_diario_fkey" FOREIGN KEY ("id_registro_diario") REFERENCES "registro_diario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro" ADD CONSTRAINT "registro_id_codigo_fkey" FOREIGN KEY ("id_codigo") REFERENCES "codigo"("id_codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro" ADD CONSTRAINT "registro_id_grupo_edad_fkey" FOREIGN KEY ("id_grupo_edad") REFERENCES "grupo_edad"("id_grupo_edad") ON DELETE CASCADE ON UPDATE CASCADE;
