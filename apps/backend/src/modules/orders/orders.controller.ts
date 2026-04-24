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
import { CurrentAccount } from '../../core/decorators/current-account.decorator';
import { OrdersService } from './orders.service';
import type { AccountContext } from '@obrafacil/shared';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  findAll(@CurrentAccount() account: AccountContext) {
    if (account.actingAs !== 'client') {
      throw new ForbiddenException('Apenas clientes têm pedidos');
    }
    return this.service.findAllByProfile(account.profile.id);
  }

  @Post()
  create(@CurrentAccount() account: AccountContext, @Body() body: unknown) {
    if (account.actingAs !== 'client') {
      throw new ForbiddenException('Apenas clientes podem realizar pedidos');
    }
    return this.service.create(account.profile.id, body);
  }
}
