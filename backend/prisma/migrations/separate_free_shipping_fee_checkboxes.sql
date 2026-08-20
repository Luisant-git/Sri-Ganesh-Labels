-- Separate Delivery Fee / COD Charge waivers per free-shipping threshold field
-- Existing generic flags become the "Online Payment" field pair
-- New flags added for the "Online Payment + COD" field pair

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'AppSettings' AND column_name = 'freeShippingDeliveryFee') THEN
    ALTER TABLE "AppSettings" RENAME COLUMN "freeShippingDeliveryFee" TO "freeShippingOnlineDeliveryFee";
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'AppSettings' AND column_name = 'freeShippingOnlineDeliveryFee') THEN
    ALTER TABLE "AppSettings" ADD COLUMN "freeShippingOnlineDeliveryFee" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'AppSettings' AND column_name = 'freeShippingCodFee') THEN
    ALTER TABLE "AppSettings" RENAME COLUMN "freeShippingCodFee" TO "freeShippingOnlineCodFee";
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'AppSettings' AND column_name = 'freeShippingOnlineCodFee') THEN
    ALTER TABLE "AppSettings" ADD COLUMN "freeShippingOnlineCodFee" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

ALTER TABLE "AppSettings" ADD COLUMN IF NOT EXISTS "freeShippingCombinedDeliveryFee" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AppSettings" ADD COLUMN IF NOT EXISTS "freeShippingCombinedCodFee" BOOLEAN NOT NULL DEFAULT false;
