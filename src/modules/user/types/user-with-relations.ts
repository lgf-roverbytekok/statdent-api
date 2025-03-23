import { Prisma } from '@prisma/client';

export type UserWithRelations = Prisma.usuarioGetPayload<{
  include: {
    persona: true;
    rol: true;
  };
}>;
