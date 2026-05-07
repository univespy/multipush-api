import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateTeamScheduleDto } from './dto/create-team-schedule.dto';
import { TwilioService } from '../twilio/twilio.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    @InjectRepository(Schedule)
    private readonly schedulesRepository: Repository<Schedule>,
    private readonly twilioService: TwilioService,
    private readonly notificationsService: NotificationsService,
    private readonly collaboratorsService: CollaboratorsService,
  ) {}

  async createForTeam(dto: CreateTeamScheduleDto): Promise<Schedule[]> {
    const collaborators = await this.collaboratorsService.findByTeamId(dto.teamId);
    const results: Schedule[] = [];
    for (const c of collaborators) {
      const schedule = await this.create({
        collaboratorId: c.id,
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        location: dto.location,
        notes: dto.notes,
      });
      results.push(schedule);
    }
    return results;
  }

  async create(dto: CreateScheduleDto): Promise<Schedule> {
    const schedule = this.schedulesRepository.create(dto);
    const saved = await this.schedulesRepository.save(schedule);
    await this.sendScheduleNotification(saved);
    return saved;
  }

  findAll(): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      relations: ['collaborator'],
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id },
      relations: ['collaborator'],
    });
    if (!schedule) throw new NotFoundException('Agendamento não encontrado');
    return schedule;
  }

  async update(id: string, dto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.findOne(id);
    Object.assign(schedule, dto);
    const saved = await this.schedulesRepository.save(schedule);
    await this.sendScheduleNotification(saved);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.findOne(id);
    await this.schedulesRepository.remove(schedule);
  }

  private async sendScheduleNotification(schedule: Schedule): Promise<void> {
    const collaborator = await this.collaboratorsService.findOne(schedule.collaboratorId);

    const notesLine = schedule.notes ? ` Obs: ${schedule.notes}` : '';
    const message =
      `Olá ${collaborator.name}! ` +
      `Você tem um agendamento em ${schedule.date} ` +
      `das ${schedule.startTime} às ${schedule.endTime} ` +
      `em ${schedule.location}.${notesLine}`;

    const notification = await this.notificationsService.createPending(
      schedule.id,
      collaborator.id,
      collaborator.phone,
      message,
    );

    try {
      const { sid } = await this.twilioService.sendSms(collaborator.phone, message);
      await this.notificationsService.markSent(notification.id, sid);
    } catch (error) {
      this.logger.error(
        `Falha ao enviar SMS para agendamento ${schedule.id}: ${(error as Error).message}`,
      );
      await this.notificationsService.markFailed(notification.id);
      // SMS failure does not roll back the schedule save
    }
  }
}
