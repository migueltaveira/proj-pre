import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dados: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        usuario: dados.usuario,
      },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const senhaCorreta = await bcrypt.compare(
      dados.senha,
      usuario.senha,
    );

    if (!senhaCorreta) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const payload = {
      sub: usuario.id,
      usuario: usuario.usuario,
      perfil: usuario.perfil,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        usuario: usuario.usuario,
        perfil: usuario.perfil,
      },
    };
  }
}