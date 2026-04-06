/*
  Warnings:

  - The `usage` column on the `GrammarItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "GrammarItem" DROP COLUMN "usage",
ADD COLUMN     "usage" JSONB;
