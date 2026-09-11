import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto.js';
import { PedidosService } from './pedidos.service.js';

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
  ) {}

  @Post()
  criar(
    @Body() dados: CreatePedidoDto,
  ) {
    return this.pedidosService.criar(dados);
  }

  @Get()
  listar() {
    return this.pedidosService.listar();
  }

  @Get('resumo/dashboard')
  resumo() {
    return this.pedidosService.resumo();
  }

  @Get(':id')
  buscarPorId(
    @Param('id') id: string,
  ) {
    return this.pedidosService.buscarPorId(
      Number(id),
    );
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id') id: string,
    @Body() dados: UpdateStatusPedidoDto,
  ) {
    return this.pedidosService.atualizarStatus(
      Number(id),
      dados,
    );
  }
}