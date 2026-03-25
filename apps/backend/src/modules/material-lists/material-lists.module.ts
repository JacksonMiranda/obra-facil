import { Module } from '@nestjs/common';
import { MaterialListsController } from './material-lists.controller';
import { MaterialListsService } from './material-lists.service';
import { MaterialListsRepository } from './material-lists.repository';
import { StoreOffersRepository } from './store-offers.repository';

@Module({
  controllers: [MaterialListsController],
  providers: [MaterialListsService, MaterialListsRepository, StoreOffersRepository],
})
export class MaterialListsModule {}
