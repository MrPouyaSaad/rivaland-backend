/*
  Warnings:

  - You are about to drop the column `description` on the `Content` table. All the data in the column will be lost.
  - Made the column `image` on table `Content` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Content" DROP COLUMN "description",
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "image" SET NOT NULL;
