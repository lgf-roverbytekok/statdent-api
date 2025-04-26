import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSectionDto) {
    return this.prisma.seccion.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.seccion.findMany(/*{
      include: { codigos: true }, // Si quieres ver los códigos
    }*/);
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
