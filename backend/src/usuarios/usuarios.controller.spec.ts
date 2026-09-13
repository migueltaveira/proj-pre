import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { UsuariosController } from './usuarios.controller.js';

describe('Rotas de usuários', () => {
  it.each(['listar', 'criar', 'atualizar'] as const)(
    'protege %s com autenticação e autorização de admin',
    (method) => {
      expect(
        Reflect.getMetadata(
          GUARDS_METADATA,
          UsuariosController.prototype[method],
        ),
      ).toEqual([JwtAuthGuard, AdminGuard]);
    },
  );
  it('permite consultar a própria sessão com autenticação', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, UsuariosController.prototype.me),
    ).toEqual([JwtAuthGuard]);
  });
});
