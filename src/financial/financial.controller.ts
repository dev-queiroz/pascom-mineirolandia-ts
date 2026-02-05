import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { FinancialService } from './financial.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateExpenseDto } from './dto/create-expense.dto';

@ApiTags('financial')
@ApiBearerAuth('JWT')
@Controller('financial')
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Post('contribution')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Adicionar contribuição com comprovante na nuvem' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { type: 'number', example: 50 },
        date: { type: 'string', format: 'date', example: '2026-01-27' },
        note: { type: 'string', example: 'Oferta da missa' },
        comprovante: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('comprovante'))
  async createContribution(
    @Body() dto: CreateContributionDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { userId: number } },
  ) {
    return this.financialService.createContribution(dto, req.user.userId, file);
  }

  @Get('pendings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Listar pendências (admin)' })
  getPendings(@Req() req) {
    return this.financialService.getPendings(req.user);
  }

  @Patch('pendings/:id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Confirmar pendência (admin)' })
  confirmPendency(@Param('id') id: string) {
    return this.financialService.confirmPendency(+id);
  }

  @Delete('pendings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Deletar pendência (admin)' })
  deletePendency(@Param('id') id: string) {
    return this.financialService.deletePendency(+id);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obter resumo financeiro (admin)' })
  getSummary(@Query('month') month?: string) {
    return this.financialService.getSummary(month);
  }

  @Post('expense')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Registrar uma saída (despesa) sem comprovante' })
  async createExpense(
    @Body() dto: CreateExpenseDto,
    @Req() req: Request & { user: { userId: number } },
  ) {
    return this.financialService.createExpense(dto, req.user.userId);
  }
}
