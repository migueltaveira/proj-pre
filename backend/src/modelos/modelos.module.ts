import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { ModelosController } from './modelos.controller.js';
import { ModelosService } from './modelos.service.js';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [
    ModelosController,
  ],
  providers: [
    ModelosService,
  ],
})
export class ModelosModule {}