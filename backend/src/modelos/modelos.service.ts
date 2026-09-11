import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateModeloDto } from './dto/create-modelo.dto.js';
import { UpdateModeloDto } from './dto/update-modelo.dto.js';

@Injectable()
export class ModelosService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async criar(dados: CreateModeloDto) {
    return this.prisma.modelo.create({
      data: {
        nome: dados.nome,
        referencia: dados.referencia,
      },
    });
  }

  async listar() {
    return this.prisma.modelo.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async buscarPorId(id: number) {
    const modelo = await this.prisma.modelo.findUnique({
      where: {
        id,
      },
    });

    if (!modelo) {
      throw new NotFoundException(
        'Modelo não encontrado',
      );
    }

    return modelo;
  }

  async atualizar(
    id: number,
    dados: UpdateModeloDto,
  ) {
    await this.buscarPorId(id);

    return this.prisma.modelo.update({
      where: {
        id,
      },
      data: dados,
    });
  }

  async inativar(id: number) {
    await this.buscarPorId(id);

    return this.prisma.modelo.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}