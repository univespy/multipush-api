import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationStatus } from './entities/notification.entity';

const mockNotification: Notification = {
  id: 'uuid-n1',
  scheduleId: 'uuid-s1',
  collaboratorId: 'uuid-c1',
  message: 'Olá Carlos!',
  phone: '+5511999999999',
  status: NotificationStatus.PENDING,
  twilioSid: null,
  sentAt: null,
  createdAt: new Date(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: jest.Mocked<Repository<Notification>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repo = module.get(getRepositoryToken(Notification));
  });

  describe('createPending', () => {
    it('should create a notification with PENDING status', async () => {
      repo.create.mockReturnValue(mockNotification);
      repo.save.mockResolvedValue(mockNotification);

      const result = await service.createPending('uuid-s1', 'uuid-c1', '+5511999999999', 'Olá Carlos!');

      expect(result.status).toBe(NotificationStatus.PENDING);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: NotificationStatus.PENDING }),
      );
    });
  });

  describe('markSent', () => {
    it('should update status to SENT with twilioSid and sentAt', async () => {
      repo.update.mockResolvedValue(undefined as any);

      await service.markSent('uuid-n1', 'SM123');

      expect(repo.update).toHaveBeenCalledWith(
        'uuid-n1',
        expect.objectContaining({ status: NotificationStatus.SENT, twilioSid: 'SM123' }),
      );
    });
  });

  describe('markFailed', () => {
    it('should update status to FAILED', async () => {
      repo.update.mockResolvedValue(undefined as any);

      await service.markFailed('uuid-n1');

      expect(repo.update).toHaveBeenCalledWith('uuid-n1', { status: NotificationStatus.FAILED });
    });
  });

  describe('findAll', () => {
    it('should return all notifications ordered by createdAt DESC', async () => {
      repo.find.mockResolvedValue([mockNotification]);

      const result = await service.findAll();

      expect(result).toEqual([mockNotification]);
      expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    });
  });

  describe('findOne', () => {
    it('should return a notification when found', async () => {
      repo.findOne.mockResolvedValue(mockNotification);

      const result = await service.findOne('uuid-n1');

      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException when notification does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
