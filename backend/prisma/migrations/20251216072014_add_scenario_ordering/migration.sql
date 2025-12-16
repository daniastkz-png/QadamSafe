-- AlterTable
ALTER TABLE "Scenario" ADD COLUMN     "isLegitimate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prerequisiteScenarioId" TEXT;

-- CreateIndex
CREATE INDEX "Scenario_order_idx" ON "Scenario"("order");

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_prerequisiteScenarioId_fkey" FOREIGN KEY ("prerequisiteScenarioId") REFERENCES "Scenario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
