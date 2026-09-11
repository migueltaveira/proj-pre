-- CreateTable
CREATE TABLE "Modelo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "referencia" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modelo_pkey" PRIMARY KEY ("id")
);
