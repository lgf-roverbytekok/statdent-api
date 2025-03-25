import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import type { UserWithRelations } from 'src/modules/user/types/user-with-relations';
import { AppConfigService } from 'src/app-config/app-config.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedResponseDto } from 'src/core/dto/paginated-response.dto';
import { BaseQueryDto } from 'src/core/dto/base-query.dto';
import { UsersQueryBuilder } from './query/users-query-builder';
import {
  PaginationBuilderService,
  PrismaModelDelegate,
} from 'src/core/builders/pagination-builder.service';

@Injectable()
export class UserService {
  // Instantiate the query builder for users
  private readonly queryBuilder = new UsersQueryBuilder();

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly prisma: PrismaService,
    private readonly paginationBuilder: PaginationBuilderService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      Number(this.appConfigService.bcryptSaltRounds),
    );

    return this.prisma.$transaction(async (prisma) => {
      // Create the "persona" record first.
      const persona = await prisma.persona.create({
        data: {
          nombre: createUserDto.firstName,
          apellido: createUserDto.lastName,
          email: createUserDto.email,
          telefono: createUserDto.phone,
        },
      });

      // Create the "usuario" record and connect it with the persona and role.
      const usuario: UserWithRelations = await prisma.usuario.create({
        data: {
          contrasena: hashedPassword,
          language: createUserDto.language,
          persona: {
            connect: { id_persona: persona.id_persona },
          },
          rol: {
            connect: { id_rol: createUserDto.roleId },
          },
        },
        include: {
          persona: true,
          rol: true,
        },
      });

      return new UserResponseDto(usuario);
    });
  }

  async findAll(
    query: BaseQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    // Build dynamic query clauses using the QueryBuilder
    const where: Prisma.usuarioWhereInput = this.queryBuilder.buildWhere(
      query.search,
    );
    const orderBy: Prisma.usuarioOrderByWithRelationInput =
      this.queryBuilder.buildOrderBy(query.sort);
    let select: Prisma.usuarioSelect = this.queryBuilder.buildSelect(
      query.fields,
    );
    // Ensure that 'person' and 'role' are included if necessary
    select = {
      ...select,
      persona: select.persona || true,
      rol: select.rol || true,
    };

    // Cast the Prisma delegate to our generic PrismaModelDelegate
    const userDelegate = this.prisma
      .usuario as unknown as PrismaModelDelegate<UserWithRelations>;

    // Use the generic PaginationBuilderService to paginate the results.
    // The transform function converts each raw user (of type UserWithRelations)
    // into an instance of UserResponseDto.
    return this.paginationBuilder.buildPaginatedResponse<
      UserWithRelations,
      UserResponseDto
    >(
      userDelegate, // the Prisma model delegate for 'usuario'
      {
        where,
        orderBy,
        select,
        page: query.page!,
        limit: query.limit!,
        transform: (user: UserWithRelations) => new UserResponseDto(user),
      },
    );
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: {
        persona: true,
        rol: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserWithRelations> {
    try {
      const user = await this.prisma.usuario.findFirst({
        where: {
          persona: {
            email: {
              equals: email.toLowerCase().trim(),
              mode: 'insensitive', // For PostgreSQL
            },
          },
        },
        include: {
          persona: true,
          rol: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`Usuario con email ${email} no encontrado`);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.usuario.findUnique({
        where: { id_usuario: id },
        include: { persona: true },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const updateData: any = {};

      if (
        updateUserDto.firstName ||
        updateUserDto.lastName ||
        updateUserDto.phone
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        updateData.persona = {
          update: {
            ...(updateUserDto.firstName && { nombre: updateUserDto.firstName }),
            ...(updateUserDto.lastName && { apellido: updateUserDto.lastName }),
            ...(updateUserDto.phone && { telefono: updateUserDto.phone }),
          },
        };
      }

      if (updateUserDto.roleId) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        updateData.id_rol = updateUserDto.roleId;
      }

      if (updateUserDto.language) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        updateData.language = updateUserDto.language;
      }

      const updatedUser = await prisma.usuario.update({
        where: { id_usuario: id },
        data: updateData,
        include: {
          persona: true,
          rol: true,
        },
      });

      return new UserResponseDto(updatedUser);
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.usuario.delete({ where: { id_usuario: id } }),
      this.prisma.persona.delete({ where: { id_persona: id } }),
    ]);
  }
}
