import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOperatorDto {
  @ApiProperty({ description: 'Nombre' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Apellido' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ description: 'Dirección de correo electrónico' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Número de teléfono' })
  @IsPhoneNumber()
  @IsOptional()
  telefono?: string;
}
