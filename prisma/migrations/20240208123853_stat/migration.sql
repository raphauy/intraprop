-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL,
    "inmo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propiedades" INTEGER NOT NULL DEFAULT 0,
    "pedidos" INTEGER NOT NULL DEFAULT 0,
    "coincidencias" INTEGER NOT NULL DEFAULT 0,
    "coincidenciasOK" INTEGER NOT NULL DEFAULT 0,
    "tasaOK" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stat_inmo_key" ON "Stat"("inmo");
