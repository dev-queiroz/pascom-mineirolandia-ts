import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('pdf')
export class PdfController {
  constructor(private pdfService: PdfService) {}

  @Get('scale')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async generateScale(@Query('month') month: string, @Res() res: Response) {
    if (!month) throw new BadRequestException('Mês obrigatório (YYYY-MM)');

    const filePath = await this.pdfService.generateMonthlyScalePDF(month);
    res.download(filePath);
  }
}
