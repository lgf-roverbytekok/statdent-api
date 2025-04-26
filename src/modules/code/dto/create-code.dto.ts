import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCodeDto {
  @ApiProperty({
    description: 'Nombre del código',
    example: 'Embarazadas',
  })
  @IsString()
  @IsNotEmpty()
  nombre_codigo: string;

  @ApiPropertyOptional({
    description: 'Descripción adicional del código',
    example: 'Grupo priorizado de embarazadas para atención estomatológica',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'ID de la sección asociada',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  seccion_id: number;

  @ApiPropertyOptional({
    description: 'ID del código padre (para jerarquía)',
    example: 2,
  })
  @IsInt()
  @IsOptional()
  parent_id?: number;
}
