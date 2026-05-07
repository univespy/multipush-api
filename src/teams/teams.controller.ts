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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@ApiTags('teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @ApiOperation({ summary: 'Criar equipe' })
  @ApiResponse({ status: 201, description: 'Equipe criada' })
  @Post()
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @ApiOperation({ summary: 'Listar equipes' })
  @ApiResponse({ status: 200, description: 'Lista de equipes' })
  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @ApiOperation({ summary: 'Buscar equipe por ID' })
  @ApiResponse({ status: 200, description: 'Equipe encontrada' })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar equipe' })
  @ApiResponse({ status: 200, description: 'Equipe atualizada' })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Excluir equipe' })
  @ApiResponse({ status: 204, description: 'Equipe excluída' })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.remove(id);
  }
}
