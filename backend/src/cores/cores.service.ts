import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCorDto } from './dto/create-cor.dto.js';
import { UpdateCorDto } from './dto/update-cor.dto.js';

@Injectable()
export class CoresService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async criar(dados: CreateCorDto) {
    return this.prisma.cor.create({
      data: {
        nome: dados.nome,
      },
    });
  }

  async listar() {
    return this.prisma.cor.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async buscarPorId(id: number) {
    const cor = await this.prisma.cor.findUnique({
      where: {
        id,
      },
    });

    if (!cor) {
      throw new NotFoundException('Cor não encontrada');
    }

    return cor;
  }

  async atualizar(
    id: number,
    dados: UpdateCorDto,
  ) {
    await this.buscarPorId(id);

    return this.prisma.cor.update({
      where: {
        id,
      },
      data: dados,
    });
  }

  async inativar(id: number) {
    await this.buscarPorId(id);

    return this.prisma.cor.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}