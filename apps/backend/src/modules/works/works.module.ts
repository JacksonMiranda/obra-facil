import { Module } from '@nestjs/common';
import { WorksController } from './works.controller';
import { WorksRepository } from './works.repository';

@Module({
  controllers: [WorksController],
  providers: [WorksRepository],
})
export class WorksModule {}
