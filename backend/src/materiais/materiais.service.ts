import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';

@Injectable()
export class MateriaisService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async criar(dados: CreateMaterialDto) {
    return this.prisma.material.create({
      data: {
        nome: dados.nome,
      },
    });
  }

  async listar() {
    return this.prisma.material.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async buscarPorId(id: number) {
    const material = await this.prisma.material.findUnique({
      where: {
        id,
      },
    });

    if (!material) {
      throw new NotFoundException(
        'Material não encontrado',
      );
    }

    return material;
  }

  async atualizar(
    id: number,
    dados: UpdateMaterialDto,
  ) {
    await this.buscarPorId(id);

    return this.prisma.material.update({
      where: {
        id,
      },
      data: dados,
    });
  }

  async inativar(id: number) {
    await this.buscarPorId(id);

    return this.prisma.material.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}