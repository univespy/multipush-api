import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  createPending(
    scheduleId: string,
    collaboratorId: string,
    phone: string,
    message: string,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      scheduleId,
      collaboratorId,
      phone,
      message,
      status: NotificationStatus.PENDING,
    });
    return this.notificationsRepository.save(notification);
  }

  async markSent(id: string, twilioSid: string): Promise<void> {
    await this.notificationsRepository.update(id, {
      status: NotificationStatus.SENT,
      twilioSid,
      sentAt: new Date(),
    });
  }

  async markFailed(id: string): Promise<void> {
    await this.notificationsRepository.update(id, {
      status: NotificationStatus.FAILED,
    });
  }

  findAll(): Promise<Notification[]> {
    return this.notificationsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notificação não encontrada');
    return notification;
  }
}
