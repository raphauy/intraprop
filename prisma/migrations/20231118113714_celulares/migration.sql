/*
  Warnings:

  - You are about to drop the column `whatsappEndpoint` on the `Inmobiliaria` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Inmobiliaria" DROP COLUMN "whatsappEndpoint",
ADD COLUMN     "celulares" TEXT;
