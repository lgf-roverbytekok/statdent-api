import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token JWT válido',
    required: true,
  })
  @Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/]*$/, {
    message: 'Formato de token inválido',
  })
  @IsString({ message: 'El refresh token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  refreshToken: string;
}
