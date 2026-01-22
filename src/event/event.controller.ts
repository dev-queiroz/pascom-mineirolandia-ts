import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('events')
@ApiBearerAuth('JWT')
@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Criar novo evento (admin)' })
  create(@Body() dto: CreateEventDto) {
    return this.eventService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar eventos (opcional filtro por mês)' })
  findAll(@Query('month') month?: string) {
    return this.eventService.findAll(month);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obter detalhes de um evento pelo ID' })
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar evento (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Remover evento (admin)' })
  remove(@Param('id') id: string) {
    return this.eventService.remove(+id);
  }

  @Post(':id/assign')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atribuir slot de evento ao usuário autenticado' })
  async assignSlot(
    @Param('id') eventId: string,
    @Body('slotOrder') slotOrder: number,
    @Req() req: Request & { user: { userId: number } },
  ) {
    return this.eventService.assignSlot(+eventId, slotOrder, req.user.userId);
  }

  @Post(':id/remove')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remover slot de evento do usuário autenticado' })
  async removeSlot(
    @Param('id') eventId: string,
    @Body() body: { slotOrder: number; justification: string },
    @Req() req: Request & { user: { userId: number } },
  ) {
    return this.eventService.removeSlot(
      +eventId,
      body.slotOrder,
      req.user.userId,
      body.justification,
    );
  }
}
