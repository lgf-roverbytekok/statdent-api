/*
  Warnings:

  - You are about to drop the `seccion_codigo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `seccion_id` to the `codigo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "seccion_codigo" DROP CONSTRAINT "seccion_codigo_id_codigo_fkey";

-- DropForeignKey
ALTER TABLE "seccion_codigo" DROP CONSTRAINT "seccion_codigo_id_seccion_fkey";

-- AlterTable
ALTER TABLE "codigo" ADD COLUMN     "parent_id" INTEGER,
ADD COLUMN     "seccion_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "seccion_codigo";

-- AddForeignKey
ALTER TABLE "codigo" ADD CONSTRAINT "codigo_seccion_id_fkey" FOREIGN KEY ("seccion_id") REFERENCES "seccion"("id_seccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codigo" ADD CONSTRAINT "codigo_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "codigo"("id_codigo") ON DELETE SET NULL ON UPDATE CASCADE;
