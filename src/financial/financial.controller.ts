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
import { FinancialService } from './financial.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';

@Controller('financial')
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Post('contribution')
  @UseGuards(JwtAuthGuard)
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
          return cb(new Error('Apenas jpg, png e pdf'), false);
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
    return this.financialService.createContribution(
      dto,
      req.user.userId,
      file?.filename,
    );
  }

  @Get('pendings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getPendings() {
    return this.financialService.getPendings();
  }

  @Patch('pendings/:id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  confirmPendency(@Param('id') id: string) {
    return this.financialService.confirmPendency(+id);
  }

  @Delete('pendings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deletePendency(@Param('id') id: string) {
    return this.financialService.deletePendency(+id);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getSummary(@Query('month') month?: string) {
    return this.financialService.getSummary(month);
  }
}
