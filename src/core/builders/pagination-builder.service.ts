import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

import { PaginatedResponseDto } from 'src/core/dto/paginated-response.dto';

export interface PrismaModelDelegate<T> {
  count(args: { where?: any }): Promise<number>;
  findMany(args: {
    where?: Prisma.Args<T, 'findMany'>['where'];
    skip?: number;
    take?: number;
    orderBy?: Prisma.Args<T, 'findMany'>['orderBy'];
    select?: Prisma.Args<T, 'findMany'>['select'];
  }): Promise<T[]>;
}

@Injectable()
export class PaginationBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async buildPaginatedResponse<T, K = T>(
    model: PrismaModelDelegate<T>,
    queryConfig: {
      where?: Prisma.Args<T, 'findMany'>['where'];
      orderBy?: Prisma.Args<T, 'findMany'>['orderBy'];
      select?: Prisma.Args<T, 'findMany'>['select'];
      page: number;
      limit: number;
      transform?: (item: T) => K;
    },
  ): Promise<PaginatedResponseDto<K>> {
    const findManyArgs: {
      where?: Prisma.Args<T, 'findMany'>['where'];
      skip: number;
      take: number;
      orderBy?: Prisma.Args<T, 'findMany'>['orderBy'];
      select?: Prisma.Args<T, 'findMany'>['select'];
    } = {
      where: queryConfig.where,
      skip: (queryConfig.page - 1) * queryConfig.limit,
      take: queryConfig.limit,
      orderBy: queryConfig.orderBy,
    };

    // Only include "select" if it has a property defined
    if (queryConfig.select && Object.keys(queryConfig.select).length > 0) {
      findManyArgs.select = queryConfig.select;
    }

    const [total, data] = await Promise.all([
      model.count({ where: queryConfig.where }),
      model.findMany(findManyArgs),
    ]);

    // If transform is provided, data will be mapped to K[].
    // Otherwise, since K defaults to T, data is already of type T[] (which is K[]).
    const transformedData = queryConfig.transform
      ? data.map(queryConfig.transform)
      : (data as unknown as K[]);

    return {
      data: transformedData,
      pagination: {
        total,
        page: queryConfig.page,
        limit: queryConfig.limit,
        totalPages: Math.ceil(total / queryConfig.limit),
      },
    };
  }
}
