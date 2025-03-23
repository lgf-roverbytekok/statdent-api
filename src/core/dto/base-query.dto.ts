import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseQueryDto {
  @ApiPropertyOptional({
    example: 'john',
    description: 'Full-text search across multiple fields',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 'fecha_creacion:desc',
    description: 'Sorting criteria',
  })
  @IsString()
  @IsOptional()
  sort?: string;

  /*  @ApiPropertyOptional({
    example: 'id,email',
    description: 'Comma-separated fields to include',
  })*/
  @IsString()
  @IsOptional()
  fields?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
