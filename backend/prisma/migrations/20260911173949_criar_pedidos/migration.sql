-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('EM_PRODUCAO', 'CONCLUIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "numeroOP" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "modeloId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "corId" INTEGER NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'EM_PRODUCAO',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoTamanho" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "PedidoTamanho_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numeroOP_key" ON "Pedido"("numeroOP");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_corId_fkey" FOREIGN KEY ("corId") REFERENCES "Cor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoTamanho" ADD CONSTRAINT "PedidoTamanho_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
