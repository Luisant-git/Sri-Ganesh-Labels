-- Add colorVariantId column to CartItem table
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "colorVariantId" TEXT;

-- Add colorVariantId column to OrderItem table
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "colorVariantId" TEXT;
