-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "shippingCost" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "shippingMethod" TEXT,
ADD COLUMN     "shippingTrackingCode" TEXT;
