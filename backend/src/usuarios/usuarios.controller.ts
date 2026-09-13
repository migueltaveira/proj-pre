import {
  Controller,
  Get,
  Req,
  UseGuards,
  Body,
  Post,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  listar() {
    return this.usuarios.listar();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  criar(@Body() body: unknown) {
    return this.usuarios.criar(body);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    return this.usuarios.atualizar(id, body);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: any) {
    return {
      mensagem: 'Token válido',
      usuario: request.usuario,
    };
  }
}
