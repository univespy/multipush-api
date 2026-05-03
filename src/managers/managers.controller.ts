import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ManagersService } from './managers.service';

@ApiTags('managers')
@ApiBearerAuth()
@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @ApiOperation({ summary: 'Retorna o perfil do gestor autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil do gestor' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @Get('me')
  getMe(@Request() req: { user: { id: string } }) {
    return this.managersService.findById(req.user.id);
  }
}
