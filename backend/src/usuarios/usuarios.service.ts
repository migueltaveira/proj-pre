import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

const publicFields = {
  id: true,
  nome: true,
  usuario: true,
  perfil: true,
  ativo: true,
} as const;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.usuario.findMany({
      select: publicFields,
      orderBy: { nome: 'asc' },
    });
  }

  private validar(body: unknown, novo: boolean) {
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new BadRequestException('Dados do usuário inválidos.');
    const data = body as Record<string, unknown>;
    if (
      Object.keys(data).some(
        (key) => !['nome', 'usuario', 'senha', 'ativo'].includes(key),
      )
    )
      throw new BadRequestException('Campo não permitido.');
    if (
      typeof data.nome !== 'string' ||
      !data.nome.trim() ||
      data.nome.trim().length > 100
    )
      throw new BadRequestException('Informe um nome com até 100 caracteres.');
    if (
      typeof data.usuario !== 'string' ||
      !/^[a-zA-Z0-9._-]{3,50}$/.test(data.usuario.trim())
    )
      throw new BadRequestException(
        'O login deve ter de 3 a 50 letras, números, pontos, traços ou sublinhados.',
      );
    if (
      (novo || (data.senha !== undefined && data.senha !== '')) &&
      (typeof data.senha !== 'string' ||
        data.senha.length < 8 ||
        Buffer.byteLength(data.senha, 'utf8') > 72)
    )
      throw new BadRequestException(
        'A senha deve ter pelo menos 8 caracteres e no máximo 72 bytes.',
      );
    if (data.ativo !== undefined && typeof data.ativo !== 'boolean')
      throw new BadRequestException('Situação do usuário inválida.');
    return {
      nome: data.nome.trim(),
      usuario: data.usuario.trim().toLowerCase(),
      senha: data.senha as string | undefined,
      ativo: data.ativo as boolean | undefined,
    };
  }

  private tratarErro(error: unknown): never {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    )
      throw new ConflictException('Este login já está em uso. Escolha outro.');
    throw error;
  }

  async criar(body: unknown) {
    const data = this.validar(body, true);
    if (data.usuario === 'admin')
      throw new ConflictException(
        'O login admin é reservado ao administrador.',
      );
    try {
      return await this.prisma.usuario.create({
        data: {
          ...data,
          senha: await bcrypt.hash(data.senha!, 10),
          perfil: 'USUARIO',
        },
        select: publicFields,
      });
    } catch (error) {
      this.tratarErro(error);
    }
  }

  async atualizar(id: number, body: unknown) {
    const data = this.validar(body, false);
    const atual = await this.prisma.usuario.findUnique({
      where: { id },
      select: publicFields,
    });
    if (!atual) throw new NotFoundException('Usuário não encontrado.');
    if (
      atual.usuario === 'admin' &&
      (data.usuario !== 'admin' || data.ativo === false)
    )
      throw new BadRequestException(
        'O login admin não pode ser alterado ou inativado.',
      );
    if (atual.usuario !== 'admin' && data.usuario === 'admin')
      throw new ConflictException(
        'O login admin é reservado ao administrador.',
      );
    try {
      return await this.prisma.usuario.update({
        where: { id },
        data: {
          nome: data.nome,
          usuario: data.usuario,
          ativo: data.ativo,
          ...(data.senha ? { senha: await bcrypt.hash(data.senha, 10) } : {}),
        },
        select: publicFields,
      });
    } catch (error) {
      this.tratarErro(error);
    }
  }
}
