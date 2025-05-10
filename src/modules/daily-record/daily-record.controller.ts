import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { DailyRecordService } from './daily-record.service';
import { CreateDailyRecordDto } from './dto/create-daily-record.dto';
import {
  DailyRecordBatchDto,
  EntryResultDto,
} from './dto/daily-record-batch.dto';
import { PatchRecordCellDto } from './dto/patch-record-cell.dto';

@ApiBearerAuth()
@ApiTags('Daily Record')
@Controller('daily-record')
export class DailyRecordController {
  constructor(private dailyRecordService: DailyRecordService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Crear o actualizar un lote (batch) de registro diario y sus entradas individuales',
  })
  @ApiBody({
    description:
      'Cabecera de lote (batch) más matriz (array) de entradas. Cada entrada especifica el código, el grupo de edad opcional y la cantidad.',
    type: CreateDailyRecordDto,
    examples: {
      standard: {
        summary: 'Entradas del 3 de mayo para el operador #1',
        value: {
          fecha: '2025-05-03',
          id_operador: 1,
          entries: [
            { id_codigo: 2, id_grupo_edad: 1, cantidad: 5 },
            { id_codigo: 2, id_grupo_edad: 2, cantidad: 3 },
            { id_codigo: 5, cantidad: 7 }, // code 5 has no age‑group
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Lote (Batch) creado o actualizado correctamente',
    type: DailyRecordBatchDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validación fallida (entrada incorrecta)',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async create(
    @Body() dto: CreateDailyRecordDto,
  ): Promise<DailyRecordBatchDto> {
    const batch = await this.dailyRecordService.upsertBatch(dto);
    return this.toDto(batch);
  }

  @Get()
  @ApiOperation({
    summary:
      'Obtener un lote (batch) diario de registros de actividad de un operador',
  })
  @ApiQuery({
    name: 'id_operador',
    type: Number,
    required: true,
    description: 'ID de operador (especialista)',
  })
  @ApiQuery({
    name: 'fecha',
    type: String,
    required: true,
    description: 'Fecha del lote (batch) en formato YYYY‑MM‑DD',
  })
  @ApiResponse({
    status: 200,
    description: 'El lote (batch) solicitado y sus entradas',
    type: DailyRecordBatchDto,
  })
  @ApiResponse({
    status: 404,
    description:
      'No se ha encontrado ningún lote (batch) para ese operador+fecha',
  })
  async find(
    @Query('id_operador', ParseIntPipe) id_operador: number,
    @Query('fecha') fecha: string,
  ): Promise<DailyRecordBatchDto> {
    const batch = await this.dailyRecordService.findBatch(id_operador, fecha);
    return this.toDto(batch);
  }

  @Get('monthly')
  @ApiOperation({
    summary:
      'Obtener los registros diarios de un mes filtrados por operador y código',
    description:
      'Devuelve la lista de registros diarios del operador y código especificados dentro del mes dado.',
  })
  @ApiQuery({
    name: 'id_operador',
    type: Number,
    required: true,
    description: 'ID del operador',
  })
  @ApiQuery({
    name: 'year',
    type: Number,
    required: true,
    description: 'Año (por ejemplo, 2025)',
  })
  @ApiQuery({
    name: 'month',
    type: Number,
    required: true,
    description: 'Número de mes (1-12)',
  })
  @ApiQuery({
    name: 'code_id',
    type: Number,
    required: true,
    description: 'ID del código para filtrar las entradas',
  })
  @ApiResponse({
    status: 200,
    description: 'Registros diarios recuperados correctamente',
    type: [DailyRecordBatchDto],
  })
  @ApiResponse({
    status: 404,
    description:
      'No se han encontrado registros diarios para los criterios indicados',
  })
  async getMonthlyBatch(
    @Query('id_operador', ParseIntPipe) id_operador: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('code_id', ParseIntPipe) codeId: number,
  ): Promise<DailyRecordBatchDto[]> {
    const batch = await this.dailyRecordService.findMonthlyBatch(
      id_operador,
      year,
      month,
      codeId,
    );

    return batch.map((b) => this.toDto(b));
  }

  // PATCH /daily-record/cell
  @Patch('cell')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Actualizar/insertar una única entrada (celda) en un lote (batch) de registro diario',
  })
  @ApiBody({
    description: 'Información para identificar y fijar una entrada única',
    examples: {
      example1: {
        summary:
          'Actualizar una celda para el operador #1, fecha 2025-05-03, código 2, grupo 1',
        value: {
          fecha: '2025-05-03',
          id_operador: 1,
          id_codigo: 2,
          id_grupo_edad: 1,
          cantidad: 10,
        },
      },
    },
    type: PatchRecordCellDto,
  })
  @ApiResponse({
    status: 200,
    description: 'El lote (batch) actualizado tras el cambio de la celda',
    type: PatchRecordCellDto,
  })
  async upsertCell(
    @Body() dto: PatchRecordCellDto,
  ): Promise<DailyRecordBatchDto> {
    const batch = await this.dailyRecordService.upsertSingleCell(dto);
    return this.toDto(batch);
  }

  private toDto(batch: {
    id: number;
    fecha: Date;
    id_operador: number;
    entries: Array<{
      id_registro: number;
      id_codigo: number;
      id_grupo_edad?: number | null;
      cantidad: number;
    }>;
  }): DailyRecordBatchDto {
    return {
      id: batch.id,
      fecha: batch.fecha.toISOString().substring(0, 10),
      id_operador: batch.id_operador,
      entries: batch.entries.map(
        (e) =>
          ({
            id_registro: e.id_registro,
            id_codigo: e.id_codigo,
            id_grupo_edad: e.id_grupo_edad ?? undefined,
            cantidad: e.cantidad,
          }) as EntryResultDto,
      ),
    };
  }
}
