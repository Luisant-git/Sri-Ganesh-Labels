-- Add sizeVariantId column to CartItem table
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "sizeVariantId" TEXT;

-- Add sizeVariantId column to OrderItem table
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "sizeVariantId" TEXT;

-- Optional: Remove old colorVariantId columns if they exist
-- ALTER TABLE "CartItem" DROP COLUMN IF EXISTS "colorVariantId";
-- ALTER TABLE "OrderItem" DROP COLUMN IF EXISTS "colorVariantId";
