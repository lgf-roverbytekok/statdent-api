import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
// import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('company')
@ApiTags('Company')
// @UseGuards(RolesGuard)
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
