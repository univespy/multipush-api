import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manager } from './entities/manager.entity';
import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Manager])],
  providers: [ManagersService],
  controllers: [ManagersController],
  exports: [ManagersService],
})
export class ManagersModule {}
