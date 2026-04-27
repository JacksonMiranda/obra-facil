import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { WorksModule } from '../works/works.module';
import { ProfessionalsModule } from '../professionals/professionals.module';
import { VisitsModule } from '../visits/visits.module';

@Module({
  imports: [WorksModule, ProfessionalsModule, VisitsModule],
  controllers: [ReviewsController],
  providers: [ReviewsRepository],
})
export class ReviewsModule {}
