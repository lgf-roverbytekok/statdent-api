import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, Min } from 'class-validator';

/**
 * DTO: Respuesta de sección ordenada
 *
 * Representa la estructura de datos devuelta al cliente
 * para una sección, incluyendo su posición (order).
 */
export class SectionResponseDto {
  @ApiProperty({
    description: 'Identificador único de la sección',
    example: 1,
    type: Number,
  })
  @IsInt()
  @Min(1)
  id_seccion: number;

  @ApiProperty({
    description: 'Nombre de la sección',
    example: 'Sección A',
    type: String,
  })
  @IsString()
  nombre_seccion: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional de la sección',
    example: 'Descripción detallada de la sección A.',
    type: String,
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'Posición de la sección ordenada (1-based)',
    example: 2,
    type: Number,
  })
  @IsInt()
  @Min(1)
  order: number;
}
