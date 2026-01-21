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
} from '@nestjs/common';
import { FinancialService } from './financial.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('financial')
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Post('contribution')
  @UseGuards(JwtAuthGuard)
  async createContribution(
    @Body() dto: CreateContributionDto,
    @Req() req: Request & { user: { userId: number } },
  ) {
    // receipt será tratado com multer depois
    return this.financialService.createContribution(dto, req.user.userId);
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
