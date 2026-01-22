import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ExtrasService } from './extras.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('extras')
@ApiBearerAuth('JWT')
@Controller('extras')
export class ExtrasController {
  constructor(private extrasService: ExtrasService) {}

  @Get('ics/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Gerar arquivo ICS para evento' })
  async generateICS(@Param('eventId') eventId: string, @Res() res: Response) {
    const icsContent = await this.extrasService.generateICS(+eventId);
    res.set('Content-Type', 'text/calendar');
    res.set('Content-Disposition', 'attachment; filename="escala.ics"');
    res.send(icsContent);
  }

  @Get('whatsapp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Gerar links WhatsApp por mês' })
  async generateWhatsAppLinks(@Query('month') month: string) {
    return this.extrasService.generateWhatsAppLinks(month);
  }
}
