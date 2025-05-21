import { Injectable } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';

import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig() {
    // Asumimos único registro con id=1
    return this.prisma.company.findUnique({ where: { id: 1 } });
  }

  async upsertConfig(dto: UpdateCompanyDto) {
    return this.prisma.company.upsert({
      where: { id: 1 },
      create: { ...dto },
      update: { ...dto },
    });
  }
}
