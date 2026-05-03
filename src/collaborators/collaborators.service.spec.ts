import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CollaboratorsService } from './collaborators.service';
import { Collaborator } from './entities/collaborator.entity';

const mockCollaborator: Collaborator = {
  id: 'uuid-1',
  name: 'Carlos Pereira',
  phone: '+5511999999999',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CollaboratorsService', () => {
  let service: CollaboratorsService;
  let repo: jest.Mocked<Repository<Collaborator>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaboratorsService,
        {
          provide: getRepositoryToken(Collaborator),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CollaboratorsService>(CollaboratorsService);
    repo = module.get(getRepositoryToken(Collaborator));
  });

  describe('create', () => {
    it('should create and return a collaborator', async () => {
      repo.create.mockReturnValue(mockCollaborator);
      repo.save.mockResolvedValue(mockCollaborator);

      const result = await service.create({ name: 'Carlos Pereira', phone: '+5511999999999' });

      expect(result).toEqual(mockCollaborator);
      expect(repo.create).toHaveBeenCalledWith({ name: 'Carlos Pereira', phone: '+5511999999999' });
    });
  });

  describe('findAll', () => {
    it('should return only active collaborators', async () => {
      repo.find.mockResolvedValue([mockCollaborator]);

      const result = await service.findAll();

      expect(result).toEqual([mockCollaborator]);
      expect(repo.find).toHaveBeenCalledWith({ where: { active: true } });
    });
  });

  describe('findOne', () => {
    it('should return a collaborator when found', async () => {
      repo.findOne.mockResolvedValue(mockCollaborator);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(mockCollaborator);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1', active: true } });
    });

    it('should throw NotFoundException when collaborator does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the collaborator', async () => {
      const updated = { ...mockCollaborator, phone: '+5511888888888' };
      repo.findOne.mockResolvedValue(mockCollaborator);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { phone: '+5511888888888' });

      expect(result.phone).toBe('+5511888888888');
    });
  });

  describe('remove', () => {
    it('should set active to false (soft-delete)', async () => {
      repo.findOne.mockResolvedValue({ ...mockCollaborator });
      repo.save.mockResolvedValue({ ...mockCollaborator, active: false });

      await service.remove('uuid-1');

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
    });

    it('should throw NotFoundException when collaborator does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
