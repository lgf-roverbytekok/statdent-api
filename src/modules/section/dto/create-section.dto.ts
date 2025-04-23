import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({
    description: 'Nombre de la sección',
    example: 'Estomatología',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción adicional de la sección',
    example: 'Sección enfocada en salud bucal y odontología preventiva',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
