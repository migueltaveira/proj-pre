import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { CoresModule } from './cores/cores.module.js';
import { MateriaisModule } from './materiais/materiais.module.js';
import { ModelosModule } from './modelos/modelos.module.js';
import { PedidosModule } from './pedidos/pedidos.module.js';


@Module({
  imports: [
    UsuariosModule,
    AuthModule,
    PrismaModule,
    ClientesModule,
    CoresModule,
    MateriaisModule,
    ModelosModule,
    PedidosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}