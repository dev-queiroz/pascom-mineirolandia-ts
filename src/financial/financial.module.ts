import { Module } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { CloudinaryProvider } from '../common/cloudinary/cloudinary.provider';

@Module({
  controllers: [FinancialController],
  providers: [
    FinancialService,
    PrismaService,
    CloudinaryService,
    CloudinaryProvider,
  ],
})
export class FinancialModule {}
