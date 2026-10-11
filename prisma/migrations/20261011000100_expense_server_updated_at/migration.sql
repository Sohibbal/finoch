-- DropIndex
DROP INDEX "expenses_userId_updatedAt_idx";

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "serverUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "expenses_userId_serverUpdatedAt_idx" ON "expenses"("userId", "serverUpdatedAt");

