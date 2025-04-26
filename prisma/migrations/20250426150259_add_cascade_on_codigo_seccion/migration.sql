-- DropForeignKey
ALTER TABLE "codigo" DROP CONSTRAINT "codigo_seccion_id_fkey";

-- AddForeignKey
ALTER TABLE "codigo" ADD CONSTRAINT "codigo_seccion_id_fkey" FOREIGN KEY ("seccion_id") REFERENCES "seccion"("id_seccion") ON DELETE CASCADE ON UPDATE CASCADE;
