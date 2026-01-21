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

@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateEventDto) {
    return this.eventService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('month') month?: string) {
    return this.eventService.findAll(month);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.eventService.remove(+id);
  }

  @Post(':id/assign')
  @UseGuards(JwtAuthGuard)
  async assignSlot(
    @Param('id') eventId: string,
    @Body('slotOrder') slotOrder: number,
    @Req() req: Request & { user: { userId: number } },
  ) {
    return this.eventService.assignSlot(+eventId, slotOrder, req.user.userId);
  }

  @Post(':id/remove')
  @UseGuards(JwtAuthGuard)
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
