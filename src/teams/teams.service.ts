import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamsRepository: Repository<Team>,
  ) {}

  create(dto: CreateTeamDto): Promise<Team> {
    return this.teamsRepository.save(this.teamsRepository.create(dto));
  }

  findAll(): Promise<Team[]> {
    return this.teamsRepository.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamsRepository.findOne({ where: { id } });
    if (!team) throw new NotFoundException('Equipe não encontrada');
    return team;
  }

  async update(id: string, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);
    Object.assign(team, dto);
    return this.teamsRepository.save(team);
  }

  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);
    await this.teamsRepository.remove(team);
  }
}
