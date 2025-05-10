import {
  IsISO8601,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordEntryDto {
  @ApiProperty({ description: 'ID del Código que se está registrando' })
  @IsInt()
  id_codigo: number;

  @ApiPropertyOptional({
    description:
      'ID del grupo de edad; Omitir si el código no tiene ningún grupo de edad',
  })
  @IsOptional()
  @IsInt()
  id_grupo_edad?: number;

  @ApiProperty({ description: 'Cantidad para este código (y grupo de edad)' })
  @IsInt()
  @Min(0)
  cantidad: number;
}

export class CreateDailyRecordDto {
  @ApiProperty({ description: 'Fecha de Batch en formato ISO (YYYY‑MM‑DD)' })
  @IsISO8601()
  fecha: string;

  @ApiProperty({
    description:
      'ID del operador (especialista) cuyas actividades se están registrando',
  })
  @IsInt()
  id_operador: number;

  @ApiProperty({
    type: [RecordEntryDto],
    description: 'Conjunto de entradas individuales de código/grupo de edad',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordEntryDto)
  entries: RecordEntryDto[];
}
