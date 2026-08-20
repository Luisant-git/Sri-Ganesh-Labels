-- Add freeShippingCodThreshold column to AppSettings table
-- Free shipping threshold that applies to both Online and COD payments
ALTER TABLE "AppSettings" ADD COLUMN IF NOT EXISTS "freeShippingCodThreshold" DOUBLE PRECISION DEFAULT 0;
