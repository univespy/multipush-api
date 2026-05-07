import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';

const mockTeam: Team = {
  id: 'uuid-t1',
  name: 'Equipe Alpha',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TeamsService', () => {
  let service: TeamsService;
  let repo: jest.Mocked<Repository<Team>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: getRepositoryToken(Team),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    repo = module.get(getRepositoryToken(Team));
  });

  describe('create', () => {
    it('should create and return a team', async () => {
      repo.create.mockReturnValue(mockTeam);
      repo.save.mockResolvedValue(mockTeam);

      const result = await service.create({ name: 'Equipe Alpha' });

      expect(result).toEqual(mockTeam);
      expect(repo.save).toHaveBeenCalledWith(mockTeam);
    });
  });

  describe('findAll', () => {
    it('should return all teams ordered by createdAt', async () => {
      repo.find.mockResolvedValue([mockTeam]);

      const result = await service.findAll();

      expect(result).toEqual([mockTeam]);
      expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'ASC' } });
    });
  });

  describe('findOne', () => {
    it('should return a team when found', async () => {
      repo.findOne.mockResolvedValue(mockTeam);

      const result = await service.findOne('uuid-t1');

      expect(result).toEqual(mockTeam);
    });

    it('should throw NotFoundException when team does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the team', async () => {
      const updated = { ...mockTeam, name: 'Equipe Beta' };
      repo.findOne.mockResolvedValue({ ...mockTeam });
      repo.save.mockResolvedValue(updated);

      const result = await service.update('uuid-t1', { name: 'Equipe Beta' });

      expect(result.name).toBe('Equipe Beta');
    });

    it('should throw NotFoundException when team does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the team', async () => {
      repo.findOne.mockResolvedValue(mockTeam);
      repo.remove.mockResolvedValue(mockTeam);

      await service.remove('uuid-t1');

      expect(repo.remove).toHaveBeenCalledWith(mockTeam);
    });

    it('should throw NotFoundException when team does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
