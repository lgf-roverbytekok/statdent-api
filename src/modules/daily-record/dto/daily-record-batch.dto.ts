import { ApiProperty } from '@nestjs/swagger';

export class EntryResultDto {
  @ApiProperty() id_registro: number;
  @ApiProperty() id_codigo: number;
  @ApiProperty({ required: false }) id_grupo_edad?: number;
  @ApiProperty() cantidad: number;
}

export class DailyRecordBatchDto {
  @ApiProperty() id: number;
  @ApiProperty() fecha: string;
  @ApiProperty() id_operador: number;
  @ApiProperty({ type: [EntryResultDto] }) entries: EntryResultDto[];
}
