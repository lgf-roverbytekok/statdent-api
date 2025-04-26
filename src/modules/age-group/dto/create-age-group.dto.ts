import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgeGroupDto {
  @ApiProperty({ description: 'Name of the age group' })
  @IsString()
  @IsNotEmpty()
  nombre_grupo_edad: string;

  @ApiProperty({ description: 'Optional description', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Minimum age (inclusive)',
    required: false,
    example: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  edad_minima?: number;

  @ApiProperty({
    description: 'Maximum age (inclusive)',
    required: false,
    example: 4,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  edad_maxima?: number;
}
