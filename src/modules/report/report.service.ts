import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';

import { PdfService } from './pdf/pdf.service';
import { CompanyService } from '../company/company.service';

interface ReportParams {
  from: Date;
  to: Date;
  pageTitle: string;
  formCode: string;
  periodicity: string;
  year: number;
}

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly companyService: CompanyService,
  ) {}

  async generateReport(params: ReportParams): Promise<Buffer> {
    const { from, to, pageTitle, formCode, periodicity, year } = params;

    if (from > to) {
      throw new BadRequestException(`'from' debe ser anterior o igual a 'to'`);
    }

    // 1) Obtener todos los grupos de edad ordenados
    const ageEntities = await this.prisma.grupo_edad.findMany({
      orderBy: { edad_minima: 'asc' },
      select: {
        nombre_grupo_edad: true,
        edad_minima: true,
        edad_maxima: true,
      },
    });

    const ageGroupLabels: string[] = ageEntities.map((group) => {
      const { edad_minima, edad_maxima } = group;
      return edad_maxima !== null
        ? `${edad_minima}-${edad_maxima}`
        : `${edad_minima}+`;
    });

    const ageLabelMap: Record<string, string> = {};
    ageEntities.forEach((group, index) => {
      const label = ageGroupLabels[index];
      ageLabelMap[group.nombre_grupo_edad] = label;
    });

    // 2) Obtener todas las secciones y códigos
    const secciones = await this.prisma.seccion.findMany({
      include: {
        codigos: true,
      },
    });
    // Ordenar secciones por el mínimo nombre_codigo de cada sección
    const seccionesOrdenadas = secciones
      .map((seccion) => {
        const codigosOrdenados = seccion.codigos.sort((a, b) =>
          a.nombre_codigo.localeCompare(b.nombre_codigo, undefined, {
            numeric: true,
          }),
        );

        return {
          ...seccion,
          codigos: codigosOrdenados,
          minCodigo: codigosOrdenados[0]?.nombre_codigo ?? '',
        };
      })
      .sort((a, b) =>
        a.minCodigo.localeCompare(b.minCodigo, undefined, { numeric: true }),
      );

    // 3) Obtener los registros entre fechas
    const registros = await this.prisma.registro.findMany({
      where: {
        registro_diario: { fecha: { gte: from, lte: to } },
      },
      include: {
        codigo: { include: { seccion: true } },
        grupo_edad: true,
      },
    });

    // 4) Agrupar registros por sección, código y grupo de edad
    const grouped = new Map<string, Map<string, Map<string, number>>>();
    for (const r of registros) {
      const sec = r.codigo.seccion.nombre_seccion;
      const cod = r.codigo.descripcion
        ? r.codigo.nombre_codigo + ' ' + r.codigo.descripcion
        : r.codigo.nombre_codigo;
      const grp = r.grupo_edad?.nombre_grupo_edad ?? 'Sin grupo';
      if (!grouped.has(sec)) grouped.set(sec, new Map());
      if (!grouped.get(sec)!.has(cod)) grouped.get(sec)!.set(cod, new Map());
      const m = grouped.get(sec)!.get(cod)!;
      m.set(grp, (m.get(grp) || 0) + r.cantidad);
    }

    // 5) Construir todas las secciones (incluso las sin datos)
    let globalRowNumber = 1;

    const sections = seccionesOrdenadas.map((seccion) => {
      const title = seccion.nombre_seccion;
      const codMap = grouped.get(title) ?? new Map();

      const rows = seccion.codigos.map((codigo) => {
        const description = codigo.descripcion
          ? `${codigo.nombre_codigo} ${codigo.descripcion}`
          : codigo.nombre_codigo;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const edades = codMap.get(description) ?? new Map<string, number>();
        let total = 0;
        const values: Record<string, number> = {};

        for (const originalGroupName of Object.keys(ageLabelMap)) {
          const label = ageLabelMap[originalGroupName];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          const v = edades.get(originalGroupName) || 0;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          values[label] = v;
          total += v;
        }

        return {
          description,
          rowNumber: globalRowNumber++,
          values,
          total,
        };
      });

      return {
        title,
        rows,
      };
    });

    // 6) Información de empresa (mocked por ahora)
    const companyConfig = await this.companyService.getConfig();
    const companyName = companyConfig?.name ?? '';
    const companyCode = companyConfig?.code ?? '';
    const logoUrl = companyConfig?.logoUrl ?? '';

    // 7) Construir payload de PDF
    const data = {
      pageTitle,
      formCode,
      periodicity,
      companyName,
      companyCode,
      year,
      unitOfMeasure: 'Uno',
      logo: logoUrl,
      ageGroups: Object.values(ageLabelMap),
      sections,
    };

    // 8) Generar y devolver PDF
    return this.pdfService.generatePdf(data);
  }

  async getChartData(params: ReportParams) {
    const { from, to } = params;

    // Grupos de edad
    const ageEntities = await this.prisma.grupo_edad.findMany({
      orderBy: { edad_minima: 'asc' },
    });
    const ageLabelMap: Record<string, string> = {};
    ageEntities.forEach(({ nombre_grupo_edad, edad_minima, edad_maxima }) => {
      ageLabelMap[nombre_grupo_edad] =
        edad_maxima !== null
          ? `${edad_minima}-${edad_maxima}`
          : `${edad_minima}+`;
    });

    // Registros filtrados
    const registros = await this.prisma.registro.findMany({
      where: { registro_diario: { fecha: { gte: from, lte: to } } },
      include: { codigo: { include: { seccion: true } }, grupo_edad: true },
    });

    // Agrupación por sección > código > grupo
    const dataMap = new Map<string, Map<string, Record<string, number>>>();
    for (const r of registros) {
      const section = r.codigo.seccion.nombre_seccion;
      const code = r.codigo.descripcion
        ? `${r.codigo.nombre_codigo} ${r.codigo.descripcion}`
        : r.codigo.nombre_codigo;
      const group = r.grupo_edad?.nombre_grupo_edad ?? 'Sin grupo';
      const label = ageLabelMap[group] ?? 'Sin grupo';

      if (!dataMap.has(section)) dataMap.set(section, new Map());
      if (!dataMap.get(section)!.has(code)) dataMap.get(section)!.set(code, {});

      const ageGroupMap = dataMap.get(section)!.get(code)!;
      ageGroupMap[label] = (ageGroupMap[label] ?? 0) + r.cantidad;
    }

    // Serializar
    const result = Array.from(dataMap.entries()).map(([section, codes]) => ({
      section,
      codes: Array.from(codes.entries()).map(([code, ageGroups]) => ({
        code,
        data: ageGroups,
        total: Object.values(ageGroups).reduce((a, b) => a + b, 0),
      })),
    }));

    return {
      ageGroups: Object.values(ageLabelMap),
      sections: result,
    };
  }
}
