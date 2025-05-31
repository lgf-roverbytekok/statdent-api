import { Controller, Post, Body, Res, Header } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Response } from 'express';

import { ReportService } from './report.service';
import { ReportOptionsDto } from './dto/report-options.dto';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/modules/auth/enums/role.enum';

@Roles(Role.Statistician)
@Controller('report')
@ApiTags('Report')
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('generate')
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({
    summary: 'Generar reporte en PDF',
    description:
      'Genera un reporte en formato PDF en base a los parámetros recibidos. Requiere rol de especialista.',
  })
  @ApiBody({ type: ReportOptionsDto })
  @ApiResponse({
    status: 201,
    description: 'Reporte generado exitosamente (PDF)',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'No autenticado. Token no proporcionado o inválido.',
  })
  @ApiForbiddenResponse({
    description: 'Acceso denegado. El usuario no tiene el rol adecuado.',
  })
  async generate(@Body() opts: ReportOptionsDto, @Res() res: Response) {
    const buffer = await this.reportService.generateReport({
      from: new Date(opts.from),
      to: new Date(opts.to),
      pageTitle: opts.pageTitle,
      formCode: opts.formCode,
      periodicity: opts.periodicity,
      year: opts.year,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    res.send(buffer);
  }

  @Post('chart')
  @ApiOperation({ summary: 'Datos para generar reporte gráfico' })
  @ApiBody({ type: ReportOptionsDto })
  async chart(@Body() opts: ReportOptionsDto) {
    return this.reportService.getChartData({
      from: new Date(opts.from),
      to: new Date(opts.to),
      pageTitle: opts.pageTitle,
      formCode: opts.formCode,
      periodicity: opts.periodicity,
      year: opts.year,
    });
  }
}
