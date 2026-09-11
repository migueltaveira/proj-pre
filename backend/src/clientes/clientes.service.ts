import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClientesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async criar(dados: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: {
        nome: dados.nome,
        documento: dados.documento,
        telefone: dados.telefone,
        observacoes: dados.observacoes,
      },
    });
  }

  async listar() {
    return this.prisma.cliente.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async buscarPorId(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: {
        id,
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return cliente;
  }

  async atualizar(
    id: number,
    dados: UpdateClienteDto,
  ) {
    await this.buscarPorId(id);

    return this.prisma.cliente.update({
      where: {
        id,
      },
      data: dados,
    });
  }

  async remover(id: number) {
    await this.buscarPorId(id);

    return this.prisma.cliente.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}