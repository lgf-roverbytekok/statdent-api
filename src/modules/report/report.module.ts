import { Module } from '@nestjs/common';

import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PdfService } from './pdf/pdf.service';
import { CompanyService } from '../company/company.service';

@Module({
  controllers: [ReportController],
  providers: [ReportService, PdfService, CompanyService],
})
export class ReportModule {}
