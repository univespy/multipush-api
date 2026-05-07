import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaborator } from './entities/collaborator.entity';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';

@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorsRepository: Repository<Collaborator>,
  ) {}

  create(dto: CreateCollaboratorDto): Promise<Collaborator> {
    const collaborator = this.collaboratorsRepository.create(dto);
    return this.collaboratorsRepository.save(collaborator);
  }

  findAll(): Promise<Collaborator[]> {
    return this.collaboratorsRepository.find({ where: { active: true } });
  }

  findByTeamId(teamId: string): Promise<Collaborator[]> {
    return this.collaboratorsRepository.find({ where: { active: true, teamId } });
  }

  async findOne(id: string): Promise<Collaborator> {
    const collaborator = await this.collaboratorsRepository.findOne({
      where: { id, active: true },
    });
    if (!collaborator) throw new NotFoundException('Colaborador não encontrado');
    return collaborator;
  }

  async update(id: string, dto: UpdateCollaboratorDto): Promise<Collaborator> {
    const collaborator = await this.findOne(id);
    Object.assign(collaborator, dto);
    return this.collaboratorsRepository.save(collaborator);
  }

  async remove(id: string): Promise<void> {
    const collaborator = await this.findOne(id);
    collaborator.active = false;
    await this.collaboratorsRepository.save(collaborator);
  }
}
