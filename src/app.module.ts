import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from 'nestjs-prisma';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './app-config/app-config.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { SectionModule } from './modules/section/section.module';
import { CodeModule } from './modules/code/code.module';
import { AgeGroupModule } from './modules/age-group/age-group.module';
import { OperatorModule } from './modules/operator/operator.module';
import { DailyRecordModule } from './modules/daily-record/daily-record.module';
import { CompanyModule } from './modules/company/company.module';
import { ReportModule } from './modules/report/report.module';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    AuthModule,
    UserModule,
    SectionModule,
    CodeModule,
    AgeGroupModule,
    OperatorModule,
    DailyRecordModule,
    CompanyModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // ¡RolesGuard aplicado globalmente!
    },
  ],
})
export class AppModule {}
