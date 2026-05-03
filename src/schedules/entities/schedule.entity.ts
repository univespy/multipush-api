import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Collaborator } from '../../collaborators/entities/collaborator.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Collaborator, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collaboratorId' })
  collaborator: Collaborator;

  @Column()
  collaboratorId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ length: 5 })
  startTime: string;

  @Column({ length: 5 })
  endTime: string;

  @Column()
  location: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
