import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manager } from './entities/manager.entity';

@Injectable()
export class ManagersService {
  constructor(
    @InjectRepository(Manager)
    private readonly managersRepository: Repository<Manager>,
  ) {}

  async create(name: string, email: string, hashedPassword: string): Promise<Manager> {
    const manager = this.managersRepository.create({ name, email, password: hashedPassword });
    return this.managersRepository.save(manager);
  }

  async findByEmail(email: string): Promise<Manager | null> {
    return this.managersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Omit<Manager, 'password'>> {
    const manager = await this.managersRepository.findOne({ where: { id } });
    if (!manager) throw new NotFoundException('Gestor não encontrado');
    const { password, ...result } = manager;
    return result;
  }
}
