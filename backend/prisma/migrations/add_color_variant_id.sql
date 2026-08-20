-- SQL Script to add colorVariantId to existing product color variants
-- This script generates a 6-character alphanumeric ID for each color variant

-- Function to generate random 6-character alphanumeric string
CREATE OR REPLACE FUNCTION generate_color_variant_id() 
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update all products to add colorVariantId to each color in the colors JSON array
DO $$
DECLARE
    product_record RECORD;
    colors_array JSONB;
    color_item JSONB;
    updated_colors JSONB := '[]'::JSONB;
BEGIN
    FOR product_record IN SELECT id, colors FROM "Product" LOOP
        updated_colors := '[]'::JSONB;
        
        -- Loop through each color in the colors array
        FOR color_item IN SELECT * FROM jsonb_array_elements(product_record.colors) LOOP
            -- Add colorVariantId if it doesn't exist
            IF NOT (color_item ? 'colorVariantId') THEN
                color_item := color_item || jsonb_build_object('colorVariantId', generate_color_variant_id());
            END IF;
            
            updated_colors := updated_colors || jsonb_build_array(color_item);
        END LOOP;
        
        -- Update the product with new colors array
        UPDATE "Product" 
        SET colors = updated_colors 
        WHERE id = product_record.id;
    END LOOP;
END $$;

-- Drop the function after use (optional)
DROP FUNCTION IF EXISTS generate_color_variant_id();

-- Verify the update
SELECT id, name, colors FROM "Product" LIMIT 5; 
