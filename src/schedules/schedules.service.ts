import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly schedulesRepository: Repository<Schedule>,
  ) {}

  create(dto: CreateScheduleDto): Promise<Schedule> {
    const schedule = this.schedulesRepository.create(dto);
    return this.schedulesRepository.save(schedule);
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
    return this.schedulesRepository.save(schedule);
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.findOne(id);
    await this.schedulesRepository.remove(schedule);
  }
}
