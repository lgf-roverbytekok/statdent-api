import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Language } from '@prisma/client';

import { LanguageValues, getLanguageKey } from 'src/core/utils/language.util';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Unique email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Contact phone number',
    required: false,
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 1, description: 'Role ID' })
  @IsInt()
  @Min(1)
  roleId: number;

  @ApiProperty({
    enum: Object.values(LanguageValues),
    example: LanguageValues.SPANISH,
    description: 'User preferred language (es-ES, en-US)',
  })
  @Transform(({ value }: { value: string }) => getLanguageKey(value))
  @IsIn(Object.keys(LanguageValues), {
    message: 'The language must be es-ES or en-US',
  })
  language: keyof typeof Language; // 'SPANISH' | 'ENGLISH'
}
