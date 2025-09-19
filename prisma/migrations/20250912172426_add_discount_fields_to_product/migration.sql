-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "discount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "discountType" TEXT DEFAULT 'amount';
