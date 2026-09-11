import 'dotenv/config';
import bcrypt from 'bcrypt';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não encontrada no arquivo .env');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 10);

  const usuario = await prisma.usuario.upsert({
    where: {
      usuario: 'admin',
    },

    update: {},

    create: {
      nome: 'Administrador',
      usuario: 'admin',
      senha: senhaHash,
      perfil: 'ADMIN',
      ativo: true,
    },
  });

  console.log('Usuário administrador criado com sucesso!');
  console.log({
    id: usuario.id,
    nome: usuario.nome,
    usuario: usuario.usuario,
    perfil: usuario.perfil,
  });
}

main()
  .catch((erro) => {
    console.error('Erro ao criar usuário:');
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });