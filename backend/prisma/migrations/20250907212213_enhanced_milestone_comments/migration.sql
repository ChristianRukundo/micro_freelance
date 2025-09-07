/*
  Warnings:

  - You are about to drop the column `comments` on the `Milestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "comments",
ADD COLUMN     "revisionNotes" TEXT,
ADD COLUMN     "submissionNotes" TEXT;

-- AlterTable
ALTER TABLE "MilestoneAttachment" ADD COLUMN     "comments" TEXT;
