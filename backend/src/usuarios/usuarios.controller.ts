import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('usuarios')
export class UsuariosController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: any) {
    return {
      mensagem: 'Token válido',
      usuario: request.usuario,
    };
  }
}