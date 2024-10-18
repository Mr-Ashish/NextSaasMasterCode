-- AlterTable
ALTER TABLE "EmailTemplates" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "content" DROP NOT NULL;
