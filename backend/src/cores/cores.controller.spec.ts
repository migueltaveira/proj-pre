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
import { CoresService } from './cores.service.js';
import { CreateCorDto } from './dto/create-cor.dto.js';
import { UpdateCorDto } from './dto/update-cor.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('cores')
export class CoresController {
  constructor(
    private readonly coresService: CoresService,
  ) {}

  @Post()
  criar(@Body() dados: CreateCorDto) {
    return this.coresService.criar(dados);
  }

  @Get()
  listar() {
    return this.coresService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.coresService.buscarPorId(Number(id));
  }

  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body() dados: UpdateCorDto,
  ) {
    return this.coresService.atualizar(Number(id), dados);
  }

  @Patch(':id/inativar')
  inativar(@Param('id') id: string) {
    return this.coresService.inativar(Number(id));
  }
}