import { Controller, Get, Put, Body } from '@nestjs/common';

import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/modules/auth/enums/role.enum';

@Roles(Role.Admin)
@Controller('company')
@ApiTags('Company')
@ApiBearerAuth()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * Obtiene la configuración de la empresa.
   */
  @Get()
  @ApiOperation({ summary: 'Obtener configuración de la empresa' })
  @ApiOkResponse({
    description: 'Configuración actual de la empresa',
    schema: {
      example: {
        name: 'Mi Empresa',
        code: 'EMP123',
        logoUrl: 'https://ejemplo.com/logo.png',
      },
    },
  })
  async get(): Promise<{ name: string; code: string; logoUrl: string } | null> {
    return this.companyService.getConfig();
  }

  /**
   * Actualiza la configuración de la empresa.
   */
  @Put()
  @ApiOperation({ summary: 'Actualizar configuración de la empresa' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiOkResponse({
    description: 'Configuración de la empresa actualizada',
    schema: {
      example: {
        name: 'Mi Empresa',
        code: 'EMP123',
        logoUrl: 'https://ejemplo.com/logo.png',
      },
    },
  })
  async update(@Body() dto: UpdateCompanyDto) {
    return this.companyService.upsertConfig(dto);
  }
}
