import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { MateriaisController } from './materiais.controller.js';
import { MateriaisService } from './materiais.service.js';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [
    MateriaisController,
  ],
  providers: [
    MateriaisService,
  ],
})
export class MateriaisModule {}