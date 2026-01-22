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
  BadRequestException,
} from '@nestjs/common';
import { FinancialService } from './financial.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('financial')
@ApiBearerAuth('JWT')
@Controller('financial')
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Post('contribution')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Adicionar contribuição pendente (usuário)' })
  @UseInterceptors(
    FileInterceptor('comprovante', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
          cb(new BadRequestException('Apenas jpg, png e pdf'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async createContribution(
    @Body() dto: CreateContributionDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { userId: number } },
  ) {
    const receiptPath = file ? file.filename : undefined;
    return this.financialService.createContribution(
      dto,
      req.user.userId,
      receiptPath,
    );
  }

  @Get('pendings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Listar pendências (admin)' })
  getPendings() {
    return this.financialService.getPendings();
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
}
