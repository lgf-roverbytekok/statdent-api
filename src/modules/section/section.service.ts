import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionResponseDto } from './dto/section-response.dto';

@Injectable()
export class SectionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSectionDto) {
    return this.prisma.seccion.create({
      data: dto,
    });
  }

  /**
   * Devuelve todas las secciones, ordenadas según el
   * criterio de min(nombre_codigo) y solo con `order`.
   */
  async findAll(): Promise<SectionResponseDto[]> {
    // 1) Traer secciones con sus códigos ordenados internamente
    const secciones = await this.prisma.seccion.findMany({
      include: {
        codigos: { orderBy: { nombre_codigo: 'asc' } },
      },
    });

    // 2) Calcular minCodigo por sección
    const withMin = secciones.map((sec) => ({
      id_seccion: sec.id_seccion,
      nombre_seccion: sec.nombre_seccion,
      descripcion: sec.descripcion ?? undefined,
      minCodigo: sec.codigos[0]?.nombre_codigo ?? '',
    }));

    // 3) Ordenar las secciones por minCodigo
    withMin.sort((a, b) =>
      a.minCodigo.localeCompare(b.minCodigo, undefined, { numeric: true }),
    );

    // 4) Mapear al DTO final, asignando `order` 1-based
    return withMin.map((sec, idx) => ({
      id_seccion: sec.id_seccion,
      nombre_seccion: sec.nombre_seccion,
      descripcion: sec.descripcion,
      order: idx + 1,
    }));
  }

  async findOne(id: number) {
    const seccion = await this.prisma.seccion.findUnique({
      where: { id_seccion: id },
      include: { codigos: true },
    });

    if (!seccion) throw new NotFoundException(`Section #${id} not found`);
    return seccion;
  }

  async update(id: number, dto: UpdateSectionDto) {
    await this.findOne(id); // Para lanzar NotFound si no existe

    return this.prisma.seccion.update({
      where: { id_seccion: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Para lanzar NotFound si no existe

    return this.prisma.seccion.delete({
      where: { id_seccion: id },
    });
  }
}
