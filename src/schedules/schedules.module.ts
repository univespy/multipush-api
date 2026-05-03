import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { TwilioModule } from '../twilio/twilio.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CollaboratorsModule } from '../collaborators/collaborators.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule]),
    TwilioModule,
    NotificationsModule,
    CollaboratorsModule,
  ],
  providers: [SchedulesService],
  controllers: [SchedulesController],
})
export class SchedulesModule {}
