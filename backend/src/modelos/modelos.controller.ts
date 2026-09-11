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
import { ModelosService } from './modelos.service.js';
import { CreateModeloDto } from './dto/create-modelo.dto.js';
import { UpdateModeloDto } from './dto/update-modelo.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('modelos')
export class ModelosController {
  constructor(
    private readonly modelosService: ModelosService,
  ) {}

  @Post()
  criar(
    @Body() dados: CreateModeloDto,
  ) {
    return this.modelosService.criar(dados);
  }

  @Get()
  listar() {
    return this.modelosService.listar();
  }

  @Get(':id')
  buscarPorId(
    @Param('id') id: string,
  ) {
    return this.modelosService.buscarPorId(
      Number(id),
    );
  }

  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body() dados: UpdateModeloDto,
  ) {
    return this.modelosService.atualizar(
      Number(id),
      dados,
    );
  }

  @Patch(':id/inativar')
  inativar(
    @Param('id') id: string,
  ) {
    return this.modelosService.inativar(
      Number(id),
    );
  }
}