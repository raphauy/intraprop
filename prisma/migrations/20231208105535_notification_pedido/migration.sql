-- CreateTable
CREATE TABLE "NotificationPedido" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "celulares" TEXT,
    "json" TEXT,
    "pedidoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoincidenceToNotificationPedido" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CoincidenceToNotificationPedido_AB_unique" ON "_CoincidenceToNotificationPedido"("A", "B");

-- CreateIndex
CREATE INDEX "_CoincidenceToNotificationPedido_B_index" ON "_CoincidenceToNotificationPedido"("B");

-- AddForeignKey
ALTER TABLE "NotificationPedido" ADD CONSTRAINT "NotificationPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoincidenceToNotificationPedido" ADD CONSTRAINT "_CoincidenceToNotificationPedido_A_fkey" FOREIGN KEY ("A") REFERENCES "Coincidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoincidenceToNotificationPedido" ADD CONSTRAINT "_CoincidenceToNotificationPedido_B_fkey" FOREIGN KEY ("B") REFERENCES "NotificationPedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
