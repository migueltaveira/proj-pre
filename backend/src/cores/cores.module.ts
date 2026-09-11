import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { CoresController } from './cores.controller.js';
import { CoresService } from './cores.service.js';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [
    CoresController,
  ],
  providers: [
    CoresService,
  ],
})
export class CoresModule {}