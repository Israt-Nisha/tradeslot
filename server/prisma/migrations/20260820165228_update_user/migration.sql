/*
  Warnings:

  - You are about to alter the column `bookingFee` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `platformFee` on the `payments` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[stripeChargeId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeTransferId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeAccountId]` on the table `trader_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobDurationMinutes` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversationId` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `applicationFee` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_customerId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_traderId_fkey";

-- DropIndex
DROP INDEX "messages_customerId_idx";

-- DropIndex
DROP INDEX "messages_senderId_channel_idx";

-- DropIndex
DROP INDEX "messages_traderId_idx";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "conversationId" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GBP',
ADD COLUMN     "jobDurationMinutes" INTEGER NOT NULL,
ALTER COLUMN "bookingFee" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "conversationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "platformFee",
ADD COLUMN     "applicationFee" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "stripeChargeId" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "currency" SET DEFAULT 'GBP';

-- AlterTable
ALTER TABLE "trader_profiles" ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "defaultJobDurationMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "defaultTravelBufferMinutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "externalId" TEXT,
    "traderId" TEXT NOT NULL,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversations_traderId_idx" ON "conversations"("traderId");

-- CreateIndex
CREATE INDEX "conversations_customerId_idx" ON "conversations"("customerId");

-- CreateIndex
CREATE INDEX "conversations_channel_idx" ON "conversations"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_channel_externalId_key" ON "conversations"("channel", "externalId");

-- CreateIndex
CREATE INDEX "bookings_traderId_scheduledEnd_idx" ON "bookings"("traderId", "scheduledEnd");

-- CreateIndex
CREATE INDEX "bookings_conversationId_idx" ON "bookings"("conversationId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_channel_senderId_idx" ON "messages"("channel", "senderId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeChargeId_key" ON "payments"("stripeChargeId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeTransferId_key" ON "payments"("stripeTransferId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "trader_profiles_stripeAccountId_key" ON "trader_profiles"("stripeAccountId");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "trader_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "trader_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
