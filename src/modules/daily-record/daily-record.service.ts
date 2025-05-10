import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';

import { CreateDailyRecordDto } from './dto/create-daily-record.dto';
import { PatchRecordCellDto } from './dto/patch-record-cell.dto';

@Injectable()
export class DailyRecordService {
  constructor(private prisma: PrismaService) {}

  async findMonthlyBatch(
    id_operador: number,
    year: number,
    month: number,
    codeId: number,
  ) {
    /**
     * La lógica para calcular las fechas `firstDay` y `lastDay` utiliza el constructor de `Date` con UTC.
     * Esto se hace para evitar problemas relacionados con zonas horarias, ya que las fechas deben ser
     * consistentes independientemente de la ubicación del servidor o del cliente.
     *
     * - `firstDay`: Se calcula como el primer día del mes especificado (`year` y `month`).
     *   Se utiliza `month - 1` porque los meses en JavaScript son indexados desde 0 (enero = 0).
     *   La hora se establece en 00:00:00 para garantizar que se incluya todo el día.
     *
     * - `lastDay`: Se calcula como el último día del mes especificado. Para lograr esto, se pasa
     *   `month` directamente al constructor de `Date`, lo que representa el mes siguiente, y se
     *   establece el día en 0. JavaScript interpreta el día 0 como el último día del mes anterior.
     *   La hora se establece en 23:59:59 para incluir todo el día.
     *
     * Ejemplo:
     * - Si `year = 2023` y `month = 5` (mayo):
     *   - `firstDay` será `2023-05-01T00:00:00.000Z`.
     *   - `lastDay` será `2023-05-31T23:59:59.000Z`.
     *
     * Este enfoque asegura que las consultas a la base de datos incluyan todos los registros
     * dentro del rango del mes, sin importar la zona horaria.
     */
    const firstDay = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)); // UTC para evitar problemas de zona horaria
    const lastDay = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const batches = await this.prisma.registro_diario.findMany({
      where: {
        id_operador,
        fecha: { gte: firstDay, lte: lastDay },
      },
      include: {
        entries: {
          where: { id_codigo: codeId }, // ✅ Aquí se filtran solo las entries relevantes
        },
      },
      orderBy: { fecha: 'asc' }, // opcional, pero útil para UI ordenada
    });

    /*if (!batches || batches.length === 0) {
      throw new NotFoundException(
        `No daily-records found for operator ${id_operador} and code ${codeId} in ${year}-${month}`,
      );
    }*/

    return batches;
  }

  async findBatch(id_operador: number, fecha: string) {
    const date = new Date(fecha);
    const batch = await this.prisma.registro_diario.findUnique({
      where: { fecha_id_operador: { fecha: date, id_operador } },
      include: { entries: true },
    });

    if (!batch) {
      throw new NotFoundException(
        `No se ha encontrado ningún registro diario del operador ${id_operador} el ${fecha}`,
      );
    }

    return batch;
  }

  async upsertSingleCell(params: PatchRecordCellDto) {
    const { fecha, id_operador, id_codigo, id_grupo_edad, cantidad } = params;
    const date = new Date(fecha);

    return this.prisma.$transaction(async (tx) => {
      // upsert the batch header (if it doesn't exist yet)
      const batch = await tx.registro_diario.upsert({
        where: {
          fecha_id_operador: { fecha: date, id_operador },
        },
        create: { fecha: date, id_operador },
        update: {},
        include: { entries: true },
      });

      // upsert the specific entry
      const existingEntry = await tx.registro.findFirst({
        where: {
          id_registro_diario: batch.id,
          id_codigo,
          id_grupo_edad: id_grupo_edad ?? null,
        },
      });

      if (existingEntry) {
        await tx.registro.update({
          where: { id_registro: existingEntry.id_registro },
          data: { cantidad },
        });
      } else {
        await tx.registro.create({
          data: {
            id_registro_diario: batch.id,
            id_codigo,
            id_grupo_edad: id_grupo_edad ?? null,
            cantidad,
          },
        });
      }

      // return updated batch
      return tx.registro_diario.findUniqueOrThrow({
        where: { id: batch.id },
        include: { entries: true },
      });
    });
  }

  async upsertBatch(dto: CreateDailyRecordDto) {
    const date = new Date(dto.fecha);
    return this.prisma.$transaction(async (tx) => {
      // upsert batch header
      const batch = await tx.registro_diario.upsert({
        where: {
          fecha_id_operador: { fecha: date, id_operador: dto.id_operador },
        },
        create: { fecha: date, id_operador: dto.id_operador },
        update: {},
        include: { entries: true },
      });
      // delete existing entries for this batch
      await tx.registro.deleteMany({ where: { id_registro_diario: batch.id } });
      // insert new entries
      const creates = dto.entries.map((e) =>
        tx.registro.create({
          data: {
            id_registro_diario: batch.id,
            id_codigo: e.id_codigo,
            id_grupo_edad: e.id_grupo_edad,
            cantidad: e.cantidad,
          },
        }),
      );
      await Promise.all(creates);
      return batch;
    });
  }
}
