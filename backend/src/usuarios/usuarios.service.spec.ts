import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsuariosService } from './usuarios.service.js';

describe('Gestão de usuários', () => {
  const db = {
    usuario: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
  const service = new UsuariosService(db as unknown as PrismaService);
  const input = {
    nome: 'Operador',
    usuario: 'operador',
    senha: 'senha-teste-123',
  };
  beforeEach(() => vi.resetAllMocks());

  it('cria somente usuário comum, normaliza login e armazena hash', async () => {
    await service.criar({ ...input, usuario: 'Operador' });
    const args = db.usuario.create.mock.calls[0][0];
    expect(args.data.perfil).toBe('USUARIO');
    expect(args.data.usuario).toBe('operador');
    expect(await bcrypt.compare(input.senha, args.data.senha)).toBe(true);
    expect(args.select.senha).toBeUndefined();
  });

  it('não seleciona senhas na listagem', async () => {
    await service.listar();
    expect(db.usuario.findMany.mock.calls[0][0].select.senha).toBeUndefined();
  });

  it.each([
    null,
    {},
    { ...input, perfil: 'ADMIN' },
    { ...input, senha: '123' },
    { ...input, senha: 'á'.repeat(40) },
    { ...input, ativo: 'true' },
    { ...input, usuario: 'login com espaço' },
  ])(
    'rejeita dados inválidos ou tentativa de elevar perfil: %j',
    async (body) => {
      await expect(service.criar(body)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(db.usuario.create).not.toHaveBeenCalled();
    },
  );

  it('explica login duplicado', async () => {
    db.usuario.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.criar(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it.each([{ usuario: 'outro' }, { ativo: false }])(
    'protege login e situação do admin',
    async (changes) => {
      db.usuario.findUnique.mockResolvedValue({ id: 1, usuario: 'admin' });
      await expect(
        service.atualizar(1, { nome: 'Admin', usuario: 'admin', ...changes }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(db.usuario.update).not.toHaveBeenCalled();
    },
  );

  it('mantém a senha quando deixada em branco e permite inativar usuário comum', async () => {
    db.usuario.findUnique.mockResolvedValue({ id: 2, usuario: 'operador' });
    await service.atualizar(2, {
      nome: 'Novo nome',
      usuario: 'operador',
      senha: '',
      ativo: false,
    });
    expect(db.usuario.update.mock.calls[0][0].data).toEqual({
      nome: 'Novo nome',
      usuario: 'operador',
      ativo: false,
    });
  });

  it('redefine senha com hash e não retorna o hash', async () => {
    db.usuario.findUnique.mockResolvedValue({ id: 2, usuario: 'operador' });
    await service.atualizar(2, input);
    const args = db.usuario.update.mock.calls[0][0];
    expect(await bcrypt.compare(input.senha, args.data.senha)).toBe(true);
    expect(args.select.senha).toBeUndefined();
  });

  it('retorna erro para usuário inexistente', async () => {
    db.usuario.findUnique.mockResolvedValue(null);
    await expect(service.atualizar(999, input)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
