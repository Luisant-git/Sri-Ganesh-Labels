-- Add codAvailable column to ShippingRule table
ALTER TABLE "ShippingRule" ADD COLUMN "codAvailable" BOOLEAN NOT NULL DEFAULT true;
