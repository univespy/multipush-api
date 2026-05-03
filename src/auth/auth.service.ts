import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ManagersService } from '../managers/managers.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly managersService: ManagersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const manager = await this.managersService.findByEmail(dto.email);
    if (!manager) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, manager.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const payload: JwtPayload = { sub: manager.id, email: manager.email };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(dto: RegisterDto) {
    const existing = await this.managersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const manager = await this.managersService.create(dto.name, dto.email, hash);
    const { password, ...result } = manager;
    return result;
  }
}
