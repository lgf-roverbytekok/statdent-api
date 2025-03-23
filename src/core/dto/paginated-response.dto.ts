import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';

export class PaginationMeta {
  @ApiProperty({
    example: 100,
    description: 'Total number of items',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  limit: number;

  @ApiProperty({
    example: 10,
    description: 'Total number of pages',
  })
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of paginated items',
    type: [Object],
  })
  @Type(() => Object)
  data: T[];

  @ApiProperty()
  pagination: PaginationMeta;

  constructor(data: T[], meta: PaginationMeta) {
    this.data = data;
    this.pagination = meta;
  }
}
