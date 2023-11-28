/*
  Warnings:

  - You are about to drop the column `numbers` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "numbers",
ADD COLUMN     "celulares" TEXT;
