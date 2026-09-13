import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token não informado');
    }

    const [tipo, token] = authHeader.split(' ');

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token inválido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'segredo-temporario',
      });

      if (!Number.isInteger(payload.sub)) throw new UnauthorizedException();
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          nome: true,
          usuario: true,
          perfil: true,
          ativo: true,
        },
      });
      if (!usuario?.ativo) throw new UnauthorizedException();
      request.usuario = { ...usuario, sub: usuario.id };

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
