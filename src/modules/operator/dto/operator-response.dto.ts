import { ApiProperty } from '@nestjs/swagger';

export class OperatorResponseDto {
  @ApiProperty() id_operador: number;
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
  @ApiProperty() email: string;
  @ApiProperty({ required: false }) telefono?: string;
}
