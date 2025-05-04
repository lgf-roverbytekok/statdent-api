import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';

import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { OperatorResponseDto } from './dto/operator-response.dto';

@Injectable()
export class OperatorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOperatorDto): Promise<OperatorResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const persona = await tx.persona.create({
        data: {
          nombre: dto.nombre,
          apellido: dto.apellido,
          email: dto.email,
          telefono: dto.telefono,
        },
      });
      const operador = await tx.operador.create({
        data: { id_operador: persona.id_persona },
      });
      return { id_operador: operador.id_operador, ...dto };
    });
  }

  async findAll(): Promise<OperatorResponseDto[]> {
    const rows = await this.prisma.operador.findMany({
      include: { persona: true },
    });
    return rows.map((o) => ({
      id_operador: o.id_operador,
      nombre: o.persona.nombre,
      apellido: o.persona.apellido,
      email: o.persona.email,
      telefono: o.persona.telefono ?? undefined,
    }));
  }

  async findOne(id: number): Promise<OperatorResponseDto> {
    const o = await this.prisma.operador.findUnique({
      where: { id_operador: id },
      include: { persona: true },
    });
    if (!o) throw new NotFoundException(`Operador ${id} no encontrado`);
    return {
      id_operador: o.id_operador,
      nombre: o.persona.nombre,
      apellido: o.persona.apellido,
      email: o.persona.email,
      telefono: o.persona.telefono ?? undefined,
    };
  }

  async update(
    id: number,
    dto: UpdateOperatorDto,
  ): Promise<OperatorResponseDto> {
    const o = await this.prisma.operador.findUnique({
      where: { id_operador: id },
      include: { persona: true },
    });
    if (!o) throw new NotFoundException(`Operador ${id} no encontrado`);

    const persona = await this.prisma.persona.update({
      where: { id_persona: id },
      data: { ...dto },
    });

    return {
      id_operador: id,
      nombre: persona.nombre,
      apellido: persona.apellido,
      email: persona.email,
      telefono: persona.telefono ?? undefined,
    };
  }

  async remove(id: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.operador.delete({ where: { id_operador: id } }),
      this.prisma.persona.delete({ where: { id_persona: id } }),
    ]);
  }
}
