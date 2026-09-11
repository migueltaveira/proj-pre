import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PedidosController } from './pedidos.controller.js';
import { PedidosService } from './pedidos.service.js';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [
    PedidosController,
  ],
  providers: [
    PedidosService,
  ],
})
export class PedidosModule {}