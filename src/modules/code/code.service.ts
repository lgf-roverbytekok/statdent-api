import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';

import { CreateCodeDto } from './dto/create-code.dto';
import { UpdateCodeDto } from './dto/update-code.dto';

@Injectable()
export class CodeService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCodeDto) {
    return this.prisma.codigo.create({ data: dto });
  }

  findAll(sectionId?: number) {
    return this.prisma.codigo.findMany({
      where: sectionId ? { seccion_id: sectionId } : {},
      include: {
        seccion: true,
        parent: true,
        children: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.codigo.findUnique({
      where: { id_codigo: id },
      include: {
        seccion: true,
        parent: true,
        children: true,
      },
    });
  }

  async update(id: number, dto: UpdateCodeDto) {
    await this.ensureExists(id);
    return this.prisma.codigo.update({
      where: { id_codigo: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.codigo.delete({
      where: { id_codigo: id },
    });
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.codigo.findUnique({
      where: { id_codigo: id },
    });
    if (!exists) throw new NotFoundException(`Código ${id} no encontrado`);
  }
}
