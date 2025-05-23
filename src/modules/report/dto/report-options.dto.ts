import { IsDateString, IsString, IsInt, Min, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ReportOptionsDto {
  @ApiProperty({
    description:
      'Fecha de inicio del rango de registros a consultar (ISO 8601)',
    example: '2025-01-01',
    format: 'date',
  })
  @IsDateString()
  from!: string;

  @ApiProperty({
    description: 'Fecha final del rango de registros a consultar (ISO 8601)',
    example: '2025-12-31',
    format: 'date',
  })
  @IsDateString()
  to!: string;

  @ApiProperty({
    description: 'Título que se mostrará en la cabecera del reporte PDF',
    example: 'Resumen de Actividades estomatológicas',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  pageTitle!: string;

  @ApiProperty({
    description: 'Código del formulario asociado al reporte',
    example: 'FORM-123',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  formCode!: string;

  @ApiProperty({
    description: 'Periodicidad del reporte',
    example: 'Mensual',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  periodicity!: string;

  @ApiProperty({
    description: 'Año asociado al reporte',
    example: 2025,
    minimum: 2024,
  })
  @IsInt()
  @Min(2000)
  year!: number;
}
