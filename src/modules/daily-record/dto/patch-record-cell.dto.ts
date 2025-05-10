import { IsInt, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatchRecordCellDto {
  @ApiProperty({ description: 'ID del operador (especialista)' })
  @IsInt()
  id_operador: number;

  @ApiProperty({
    description: 'Fecha completa en formato YYYY-MM-DD',
    example: '2025-05-14',
  })
  @IsDateString()
  fecha: string;

  @ApiProperty({ description: 'ID del código al que pertenece la celda' })
  @IsInt()
  id_codigo: number;

  @ApiPropertyOptional({
    description: 'ID del grupo de edad (opcional si el código no usa grupos)',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  id_grupo_edad?: number;

  @ApiProperty({ description: 'Cantidad registrada (entero ≥ 0)' })
  @IsInt()
  @Min(0)
  cantidad: number;
}
