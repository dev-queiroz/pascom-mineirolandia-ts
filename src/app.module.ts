import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { FinancialModule } from './financial/financial.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaService } from './prisma/prisma.service';
import { PdfService } from './pdf/pdf.service';
import { PdfController } from './pdf/pdf.controller';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    EventModule,
    FinancialModule,
    DashboardModule,
    PdfModule,
  ],
  providers: [PrismaService, PdfService],
  controllers: [PdfController],
})
export class AppModule {}
