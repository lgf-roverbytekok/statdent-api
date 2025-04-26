import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';

import { CreateAgeGroupDto } from './dto/create-age-group.dto';
import { UpdateAgeGroupDto } from './dto/update-age-group.dto';

@Injectable()
export class AgeGroupService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAgeGroupDto) {
    return this.prisma.grupo_edad.create({ data: dto });
  }

  findAll() {
    return this.prisma.grupo_edad.findMany();
  }

  async findOne(id: number) {
    const ge = await this.prisma.grupo_edad.findUnique({
      where: { id_grupo_edad: id },
    });
    if (!ge) throw new NotFoundException(`Grupo de edad ${id} no encontrado`);
    return ge;
  }

  async update(id: number, dto: UpdateAgeGroupDto) {
    await this.findOne(id);
    return this.prisma.grupo_edad.update({
      where: { id_grupo_edad: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.grupo_edad.delete({ where: { id_grupo_edad: id } });
  }
}
