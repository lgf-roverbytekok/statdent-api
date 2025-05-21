import { IsString, IsUrl, Length } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiProperty({ description: 'Nombre de la empresa', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  name!: string;

  @ApiProperty({ description: 'Código de la empresa', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  code!: string;

  @ApiProperty({
    description: 'URL del logo de la empresa',
    type: String,
    format: 'url',
  })
  @IsUrl()
  logoUrl!: string;
}
