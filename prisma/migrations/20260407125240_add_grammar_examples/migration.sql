/*
  Warnings:

  - You are about to drop the column `example` on the `GrammarItem` table. All the data in the column will be lost.
  - You are about to drop the column `exampleTrans` on the `GrammarItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GrammarItem" DROP COLUMN "example",
DROP COLUMN "exampleTrans",
ADD COLUMN     "examples" JSONB;
