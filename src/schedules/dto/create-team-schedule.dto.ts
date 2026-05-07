import { IsUUID, IsDateString, IsString, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamScheduleDto {
  @ApiProperty({ example: 'uuid-da-equipe' })
  @IsUUID()
  teamId: string;

  @ApiProperty({ example: '2026-05-10' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime deve estar no formato HH:MM' })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime deve estar no formato HH:MM' })
  endTime: string;

  @ApiProperty({ example: 'Av. Paulista, 1000 - São Paulo' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: 'Levar EPI completo' })
  @IsOptional()
  @IsString()
  notes?: string;
}
