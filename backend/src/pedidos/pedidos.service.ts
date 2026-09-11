import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto.js';

@Injectable()
export class PedidosService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async criar(dados: CreatePedidoDto) {
    const tamanhosValidos = (dados.tamanhos || []).filter(
      (item) =>
        Number(item.tamanho) > 0 &&
        Number(item.quantidade) > 0,
    );

    if (tamanhosValidos.length === 0) {
      throw new BadRequestException(
        'Informe pelo menos um tamanho com quantidade válida',
      );
    }

    const ultimoPedido = await this.prisma.pedido.findFirst({
      orderBy: {
        numeroOP: 'desc',
      },
    });

    const proximaOP = ultimoPedido
      ? ultimoPedido.numeroOP + 1
      : 1;

    return this.prisma.pedido.create({
      data: {
        numeroOP: proximaOP,

        clienteId: dados.clienteId,
        modeloId: dados.modeloId,
        materialId: dados.materialId,
        corId: dados.corId,

        status: 'EM_PRODUCAO',

        observacoes: dados.observacoes,

        tamanhos: {
          create: tamanhosValidos.map((item) => ({
            tamanho: Number(item.tamanho),
            quantidade: Number(item.quantidade),
          })),
        },
      },

      include: {
        cliente: true,
        modelo: true,
        material: true,
        cor: true,

        tamanhos: {
          orderBy: {
            tamanho: 'asc',
          },
        },
      },
    });
  }

  async listar() {
    return this.prisma.pedido.findMany({
      orderBy: {
        numeroOP: 'desc',
      },

      include: {
        cliente: true,
        modelo: true,
        material: true,
        cor: true,

        tamanhos: {
          orderBy: {
            tamanho: 'asc',
          },
        },
      },
    });
  }

  async resumo() {
    const [
      total,
      emProducao,
      concluidos,
      cancelados,
      ultimosPedidos,
    ] = await Promise.all([
      this.prisma.pedido.count(),

      this.prisma.pedido.count({
        where: {
          status: 'EM_PRODUCAO',
        },
      }),

      this.prisma.pedido.count({
        where: {
          status: 'CONCLUIDO',
        },
      }),

      this.prisma.pedido.count({
        where: {
          status: 'CANCELADO',
        },
      }),

      this.prisma.pedido.findMany({
        take: 5,

        orderBy: {
          numeroOP: 'desc',
        },

        include: {
          cliente: true,
          modelo: true,
        },
      }),
    ]);

    return {
      total,
      emProducao,
      concluidos,
      cancelados,
      ultimosPedidos,
    };
  }

  async buscarPorId(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: {
        id,
      },

      include: {
        cliente: true,
        modelo: true,
        material: true,
        cor: true,

        tamanhos: {
          orderBy: {
            tamanho: 'asc',
          },
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException(
        'Pedido não encontrado',
      );
    }

    return pedido;
  }

  async atualizarStatus(
    id: number,
    dados: UpdateStatusPedidoDto,
  ) {
    await this.buscarPorId(id);

    const statusPermitidos = [
      'EM_PRODUCAO',
      'CONCLUIDO',
      'CANCELADO',
    ];

    if (!statusPermitidos.includes(dados.status)) {
      throw new BadRequestException(
        'Status inválido',
      );
    }

    return this.prisma.pedido.update({
      where: {
        id,
      },

      data: {
        status: dados.status,
      },

      include: {
        cliente: true,
        modelo: true,
        material: true,
        cor: true,

        tamanhos: {
          orderBy: {
            tamanho: 'asc',
          },
        },
      },
    });
  }
}