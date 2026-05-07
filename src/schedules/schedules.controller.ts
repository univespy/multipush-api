import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateTeamScheduleDto } from './dto/create-team-schedule.dto';

@ApiTags('schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @ApiOperation({ summary: 'Criar agendamento e disparar SMS ao colaborador' })
  @ApiResponse({ status: 201, description: 'Agendamento criado' })
  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @ApiOperation({ summary: 'Criar agendamentos para toda a equipe e disparar SMS a cada membro' })
  @ApiResponse({ status: 201, description: 'Agendamentos criados para a equipe' })
  @Post('team')
  createForTeam(@Body() dto: CreateTeamScheduleDto) {
    return this.schedulesService.createForTeam(dto);
  }

  @ApiOperation({ summary: 'Listar todos os agendamentos' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos' })
  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  @ApiResponse({ status: 200, description: 'Agendamento encontrado' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar agendamento e notificar colaborador' })
  @ApiResponse({ status: 200, description: 'Agendamento atualizado' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remover agendamento' })
  @ApiResponse({ status: 204, description: 'Agendamento removido' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.remove(id);
  }
}
