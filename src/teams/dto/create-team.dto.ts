import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Equipe Delta' })
  @IsString()
  @MinLength(1)
  name: string;
}
