import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import type { Profile } from '@obrafacil/shared';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  findAll(@CurrentUser() profile: Profile) {
    if (profile.role !== 'client') {
      throw new ForbiddenException('Apenas clientes têm pedidos');
    }
    return this.service.findAllByProfile(profile.id);
  }

  @Post()
  create(@CurrentUser() profile: Profile, @Body() body: unknown) {
    if (profile.role !== 'client') {
      throw new ForbiddenException('Apenas clientes podem realizar pedidos');
    }
    return this.service.create(profile.id, body);
  }
}
