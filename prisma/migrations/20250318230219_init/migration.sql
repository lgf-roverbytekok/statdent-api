-- CreateTable
CREATE TABLE "codigo" (
    "id_codigo" SERIAL NOT NULL,
    "nombre_codigo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "codigo_pkey" PRIMARY KEY ("id_codigo")
);

-- CreateTable
CREATE TABLE "grupo_edad" (
    "id_grupo_edad" SERIAL NOT NULL,
    "nombre_grupo_edad" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "edad_minima" INTEGER,
    "edad_maxima" INTEGER,

    CONSTRAINT "grupo_edad_pkey" PRIMARY KEY ("id_grupo_edad")
);

-- CreateTable
CREATE TABLE "operador" (
    "id_operador" INTEGER NOT NULL,

    CONSTRAINT "operador_pkey" PRIMARY KEY ("id_operador")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id_permiso" SERIAL NOT NULL,
    "nombre_permiso" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id_permiso")
);

-- CreateTable
CREATE TABLE "persona" (
    "id_persona" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "apellido" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),

    CONSTRAINT "persona_pkey" PRIMARY KEY ("id_persona")
);

-- CreateTable
CREATE TABLE "registro" (
    "id_registro" SERIAL NOT NULL,
    "fecha_registro" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "cantidad" INTEGER NOT NULL,
    "id_grupo_edad" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_operador" INTEGER NOT NULL,
    "id_codigo" INTEGER NOT NULL,

    CONSTRAINT "registro_pkey" PRIMARY KEY ("id_registro")
);

-- CreateTable
CREATE TABLE "rol" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "id_rol" INTEGER NOT NULL,
    "id_permiso" INTEGER NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("id_rol","id_permiso")
);

-- CreateTable
CREATE TABLE "seccion" (
    "id_seccion" SERIAL NOT NULL,
    "nombre_seccion" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "seccion_pkey" PRIMARY KEY ("id_seccion")
);

-- CreateTable
CREATE TABLE "seccion_codigo" (
    "id_seccion" INTEGER NOT NULL,
    "id_codigo" INTEGER NOT NULL,

    CONSTRAINT "seccion_codigo_pkey" PRIMARY KEY ("id_seccion","id_codigo")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" INTEGER NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "persona_email_key" ON "persona"("email");

-- AddForeignKey
ALTER TABLE "operador" ADD CONSTRAINT "operador_id_operador_fkey" FOREIGN KEY ("id_operador") REFERENCES "persona"("id_persona") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro" ADD CONSTRAINT "registro_id_codigo_fkey" FOREIGN KEY ("id_codigo") REFERENCES "codigo"("id_codigo") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro" ADD CONSTRAINT "registro_id_grupo_edad_fkey" FOREIGN KEY ("id_grupo_edad") REFERENCES "grupo_edad"("id_grupo_edad") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro" ADD CONSTRAINT "registro_id_operador_fkey" FOREIGN KEY ("id_operador") REFERENCES "operador"("id_operador") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro" ADD CONSTRAINT "registro_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "permiso"("id_permiso") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seccion_codigo" ADD CONSTRAINT "seccion_codigo_id_codigo_fkey" FOREIGN KEY ("id_codigo") REFERENCES "codigo"("id_codigo") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seccion_codigo" ADD CONSTRAINT "seccion_codigo_id_seccion_fkey" FOREIGN KEY ("id_seccion") REFERENCES "seccion"("id_seccion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "persona"("id_persona") ON DELETE CASCADE ON UPDATE NO ACTION;
