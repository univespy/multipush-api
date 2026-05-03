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
import { CollaboratorsService } from './collaborators.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';

@ApiTags('collaborators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @ApiOperation({ summary: 'Criar colaborador' })
  @ApiResponse({ status: 201, description: 'Colaborador criado' })
  @Post()
  create(@Body() dto: CreateCollaboratorDto) {
    return this.collaboratorsService.create(dto);
  }

  @ApiOperation({ summary: 'Listar colaboradores ativos' })
  @ApiResponse({ status: 200, description: 'Lista de colaboradores' })
  @Get()
  findAll() {
    return this.collaboratorsService.findAll();
  }

  @ApiOperation({ summary: 'Buscar colaborador por ID' })
  @ApiResponse({ status: 200, description: 'Colaborador encontrado' })
  @ApiResponse({ status: 404, description: 'Colaborador não encontrado' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.collaboratorsService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar colaborador' })
  @ApiResponse({ status: 200, description: 'Colaborador atualizado' })
  @ApiResponse({ status: 404, description: 'Colaborador não encontrado' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollaboratorDto,
  ) {
    return this.collaboratorsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remover colaborador (soft-delete)' })
  @ApiResponse({ status: 204, description: 'Colaborador desativado' })
  @ApiResponse({ status: 404, description: 'Colaborador não encontrado' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.collaboratorsService.remove(id);
  }
}
