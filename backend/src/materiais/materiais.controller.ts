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
import { MateriaisService } from './materiais.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('materiais')
export class MateriaisController {
  constructor(
    private readonly materiaisService: MateriaisService,
  ) {}

  @Post()
  criar(
    @Body() dados: CreateMaterialDto,
  ) {
    return this.materiaisService.criar(dados);
  }

  @Get()
  listar() {
    return this.materiaisService.listar();
  }

  @Get(':id')
  buscarPorId(
    @Param('id') id: string,
  ) {
    return this.materiaisService.buscarPorId(
      Number(id),
    );
  }

  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body() dados: UpdateMaterialDto,
  ) {
    return this.materiaisService.atualizar(
      Number(id),
      dados,
    );
  }

  @Patch(':id/inativar')
  inativar(
    @Param('id') id: string,
  ) {
    return this.materiaisService.inativar(
      Number(id),
    );
  }
}