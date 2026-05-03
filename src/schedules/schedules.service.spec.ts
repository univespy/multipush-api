import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SchedulesService } from './schedules.service';
import { Schedule } from './entities/schedule.entity';
import { TwilioService } from '../twilio/twilio.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { Collaborator } from '../collaborators/entities/collaborator.entity';
import { Notification, NotificationStatus } from '../notifications/entities/notification.entity';

const mockCollaborator: Collaborator = {
  id: 'uuid-c1',
  name: 'Carlos Pereira',
  phone: '+5511999999999',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSchedule: Schedule = {
  id: 'uuid-s1',
  collaboratorId: 'uuid-c1',
  collaborator: mockCollaborator,
  date: '2026-05-10',
  startTime: '08:00',
  endTime: '17:00',
  location: 'Av. Paulista, 1000',
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockNotification: Notification = {
  id: 'uuid-n1',
  scheduleId: 'uuid-s1',
  collaboratorId: 'uuid-c1',
  message: 'Olá Carlos Pereira!...',
  phone: '+5511999999999',
  status: NotificationStatus.PENDING,
  twilioSid: null,
  sentAt: null,
  createdAt: new Date(),
};

describe('SchedulesService', () => {
  let service: SchedulesService;
  let repo: jest.Mocked<Repository<Schedule>>;
  let twilioService: jest.Mocked<TwilioService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let collaboratorsService: jest.Mocked<CollaboratorsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesService,
        {
          provide: getRepositoryToken(Schedule),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: TwilioService,
          useValue: { sendSms: jest.fn() },
        },
        {
          provide: NotificationsService,
          useValue: {
            createPending: jest.fn(),
            markSent: jest.fn(),
            markFailed: jest.fn(),
          },
        },
        {
          provide: CollaboratorsService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
    repo = module.get(getRepositoryToken(Schedule));
    twilioService = module.get(TwilioService);
    notificationsService = module.get(NotificationsService);
    collaboratorsService = module.get(CollaboratorsService);
  });

  describe('create', () => {
    it('should save the schedule and send SMS on success', async () => {
      repo.create.mockReturnValue(mockSchedule);
      repo.save.mockResolvedValue(mockSchedule);
      collaboratorsService.findOne.mockResolvedValue(mockCollaborator);
      notificationsService.createPending.mockResolvedValue(mockNotification);
      twilioService.sendSms.mockResolvedValue({ sid: 'SM123' });

      const result = await service.create({
        collaboratorId: 'uuid-c1',
        date: '2026-05-10',
        startTime: '08:00',
        endTime: '17:00',
        location: 'Av. Paulista, 1000',
      });

      expect(result).toEqual(mockSchedule);
      expect(twilioService.sendSms).toHaveBeenCalledWith(
        mockCollaborator.phone,
        expect.stringContaining(mockCollaborator.name),
      );
      expect(notificationsService.markSent).toHaveBeenCalledWith(mockNotification.id, 'SM123');
    });

    it('should still return the schedule when SMS sending fails', async () => {
      repo.create.mockReturnValue(mockSchedule);
      repo.save.mockResolvedValue(mockSchedule);
      collaboratorsService.findOne.mockResolvedValue(mockCollaborator);
      notificationsService.createPending.mockResolvedValue(mockNotification);
      twilioService.sendSms.mockRejectedValue(new Error('Twilio error'));

      const result = await service.create({
        collaboratorId: 'uuid-c1',
        date: '2026-05-10',
        startTime: '08:00',
        endTime: '17:00',
        location: 'Av. Paulista, 1000',
      });

      expect(result).toEqual(mockSchedule);
      expect(notificationsService.markFailed).toHaveBeenCalledWith(mockNotification.id);
    });
  });

  describe('findOne', () => {
    it('should return a schedule when found', async () => {
      repo.findOne.mockResolvedValue(mockSchedule);

      const result = await service.findOne('uuid-s1');

      expect(result).toEqual(mockSchedule);
    });

    it('should throw NotFoundException when schedule does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update the schedule and send a new SMS', async () => {
      const updated = { ...mockSchedule, location: 'Rua Nova, 5' };
      repo.findOne.mockResolvedValue(mockSchedule);
      repo.save.mockResolvedValue(updated);
      collaboratorsService.findOne.mockResolvedValue(mockCollaborator);
      notificationsService.createPending.mockResolvedValue(mockNotification);
      twilioService.sendSms.mockResolvedValue({ sid: 'SM456' });

      const result = await service.update('uuid-s1', { location: 'Rua Nova, 5' });

      expect(result.location).toBe('Rua Nova, 5');
      expect(twilioService.sendSms).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove the schedule', async () => {
      repo.findOne.mockResolvedValue(mockSchedule);
      repo.remove.mockResolvedValue(mockSchedule);

      await service.remove('uuid-s1');

      expect(repo.remove).toHaveBeenCalledWith(mockSchedule);
    });

    it('should throw NotFoundException when schedule does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
