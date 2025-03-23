import { persona, Prisma, usuario } from '@prisma/client';

import { QueryBuilder } from 'src/core/builders/query.builder';

export class UsersQueryBuilder extends QueryBuilder<
  usuario & persona,
  Prisma.usuarioWhereInput,
  Prisma.usuarioOrderByWithRelationInput,
  Prisma.usuarioSelect
> {
  protected searchableFields: (keyof (usuario & persona))[] = [
    'nombre',
    'apellido',
    'email',
    'telefono',
  ];
  protected defaultSort: Prisma.usuarioOrderByWithRelationInput = {
    id_usuario: 'asc',
  };
  // By assigning an empty object to defaultSelect, we instruct Prisma that if no specific fields
  // are provided in the query, all available fields of the model should be returned.
  // This leverages Prisma's default behavior in find operations where the absence of a "select" clause
  // implies that all fields are selected.
  protected defaultSelect: Prisma.usuarioSelect = {
    id_usuario: true,
    contrasena: true,
    fecha_creacion: true,
    language: true,
    id_rol: true,
    // For relationships, true is indicated so that all of their fields are returned
    persona: true,
    rol: true,
  } as Prisma.usuarioSelect;

  buildWhere(search?: string): Prisma.usuarioWhereInput {
    if (!search) return {} as Prisma.usuarioWhereInput;

    // Apply the search criteria on the nested persona relation
    return {
      persona: {
        OR: this.searchableFields.map((field) => ({
          [field]: { contains: search, mode: 'insensitive' },
        })),
      },
    } as Prisma.usuarioWhereInput;
  }
}
