import { IsString, Matches, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollaboratorDto {
  @ApiProperty({ example: 'Carlos Pereira' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+5511999999999', description: 'Número no formato E.164' })
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Telefone deve estar no formato E.164 (ex: +5511999999999)' })
  phone: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}
