-- Remove Brand and SubCategory tables, and drop subcategory/brand/bundle/tags/colors columns from Product
-- Removes: subCategoryId, brandId, bundleOffers, tags, colors from Product
-- Removes: Brand table, SubCategory table, Category.subCategories, WhatsappSession.subCategoryId
-- Removes: WishlistItem, WhatsappMessage, WhatsappSession tables

ALTER TABLE "Product" DROP COLUMN IF EXISTS "subCategoryId";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "brandId";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "bundleOffers";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "tags";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "colors";

DROP INDEX IF EXISTS "Product_subCategoryId_idx";
DROP INDEX IF EXISTS "Product_brandId_idx";

DROP TABLE IF EXISTS "SubCategory";
DROP TABLE IF EXISTS "Brand";
DROP TABLE IF EXISTS "WishlistItem";
DROP TABLE IF EXISTS "WhatsappMessage";
DROP TABLE IF EXISTS "WhatsappSession";

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "gstPercentage" DECIMAL DEFAULT 18;