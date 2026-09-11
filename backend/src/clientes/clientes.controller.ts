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
import { ClientesService } from './clientes.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
  ) {}

  @Post()
  criar(@Body() dados: CreateClienteDto) {
    return this.clientesService.criar(dados);
  }

  @Get()
  listar() {
    return this.clientesService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.clientesService.buscarPorId(Number(id));
  }

  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body() dados: UpdateClienteDto,
  ) {
    return this.clientesService.atualizar(
      Number(id),
      dados,
    );
  }

  @Patch(':id/inativar')
  inativar(@Param('id') id: string) {
    return this.clientesService.remover(Number(id));
  }
}