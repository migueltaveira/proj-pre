import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const usuario = context.switchToHttp().getRequest().usuario;
    if (usuario?.usuario !== 'admin' || usuario?.perfil !== 'ADMIN')
      throw new ForbiddenException('Acesso exclusivo do administrador.');
    return true;
  }
}
