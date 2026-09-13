import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdminGuard } from './admin.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('Autorização administrativa', () => {
  const guard = new AdminGuard();
  const context = (usuario: unknown) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ usuario }) }),
    }) as ExecutionContext;
  it('autoriza somente login admin com perfil ADMIN', () => {
    expect(
      guard.canActivate(context({ usuario: 'admin', perfil: 'ADMIN' })),
    ).toBe(true);
  });
  it.each([
    null,
    { usuario: 'operador', perfil: 'USUARIO' },
    { usuario: 'outro', perfil: 'ADMIN' },
    { usuario: 'admin', perfil: 'USUARIO' },
  ])('nega acesso para %j', (usuario) => {
    expect(() => guard.canActivate(context(usuario))).toThrow(
      ForbiddenException,
    );
  });
});

describe('Sessões e situação atual no banco', () => {
  const jwt = { verifyAsync: vi.fn() };
  const db = { usuario: { findUnique: vi.fn() } };
  const guard = new JwtAuthGuard(
    jwt as unknown as JwtService,
    db as unknown as PrismaService,
  );
  const request: { headers: { authorization: string }; usuario?: unknown } = {
    headers: { authorization: 'Bearer token' },
  };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
  beforeEach(() => {
    vi.resetAllMocks();
    jwt.verifyAsync.mockResolvedValue({
      sub: 2,
      usuario: 'admin',
      perfil: 'ADMIN',
    });
  });
  it.each([null, { id: 2, ativo: false }])(
    'nega sessão de conta inexistente ou inativa',
    async (usuario) => {
      db.usuario.findUnique.mockResolvedValue(usuario);
      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    },
  );
  it('usa perfil e login atuais, não permissões antigas do token', async () => {
    db.usuario.findUnique.mockResolvedValue({
      id: 2,
      usuario: 'operador',
      perfil: 'USUARIO',
      ativo: true,
    });
    expect(await guard.canActivate(context)).toBe(true);
    expect(request.usuario).toMatchObject({
      usuario: 'operador',
      perfil: 'USUARIO',
    });
    expect(() => new AdminGuard().canActivate(context)).toThrow(
      ForbiddenException,
    );
  });
});
