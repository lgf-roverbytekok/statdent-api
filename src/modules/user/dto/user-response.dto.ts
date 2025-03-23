import { ApiProperty } from '@nestjs/swagger';

import type { UserWithRelations } from 'src/modules/user/types/user-with-relations';
import { getLanguageValue, LanguageValues } from 'src/core/utils/language.util';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string | null;

  @ApiProperty()
  role: string;

  @ApiProperty({
    enum: Object.values(LanguageValues),
    example: LanguageValues.SPANISH,
  })
  language: string;

  @ApiProperty()
  createdAt: Date;

  constructor(user: UserWithRelations) {
    this.id = user.id_usuario;
    this.fullName = `${user.persona.nombre} ${user.persona.apellido}`;
    this.email = user.persona.email;
    this.phone = user.persona.telefono;
    this.role = user.rol.nombre_rol;
    this.language = getLanguageValue(user.language);
    this.createdAt = user.fecha_creacion;
  }
}
