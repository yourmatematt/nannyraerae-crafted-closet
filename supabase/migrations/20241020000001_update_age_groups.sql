-- Migration to update age group values from broad ranges to specific increments
-- From: "0-3m", "3-12m", "1-3y", "3-5y", "5-10y"
-- To: "3mths", "6mths", "9mths", "1yr", "2yrs", "3yrs", "4yrs", "5yrs"

-- Begin transaction
BEGIN;

-- 1. Update existing products table age_group values
-- Note: This assumes some products may already exist with old age values

-- Update products from old age ranges to new specific ages
-- For "0-3m" products, map to "3mths"
UPDATE products
SET age_group = '3mths'
WHERE age_group = '0-3m';

-- For "3-12m" products, distribute between "6mths" and "9mths"
-- Using modulo to alternate between the two values
UPDATE products
SET age_group = CASE
    WHEN (id::text)::bigint % 2 = 0 THEN '6mths'
    ELSE '9mths'
END
WHERE age_group = '3-12m';

-- For "1-3y" products, distribute between "1yr" and "2yrs"
UPDATE products
SET age_group = CASE
    WHEN (id::text)::bigint % 2 = 0 THEN '1yr'
    ELSE '2yrs'
END
WHERE age_group = '1-3y';

-- For "3-5y" products, distribute between "3yrs" and "4yrs"
UPDATE products
SET age_group = CASE
    WHEN (id::text)::bigint % 2 = 0 THEN '3yrs'
    ELSE '4yrs'
END
WHERE age_group = '3-5y';

-- For "5-10y" products, map to "5yrs"
UPDATE products
SET age_group = '5yrs'
WHERE age_group = '5-10y';

-- 2. Update categories table age_group arrays
-- Replace old age arrays with new specific age values

-- Onesies & Bodysuits: was ['0-3m', '3-12m'] -> now ['3mths', '6mths', '9mths']
UPDATE categories
SET age_group = ARRAY['3mths', '6mths', '9mths']
WHERE slug = 'onesies-bodysuits';

-- Dresses & Skirts: was ['3-12m', '1-3y', '3-5y', '5-10y'] -> now ['6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs']
UPDATE categories
SET age_group = ARRAY['6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs']
WHERE slug = 'dresses-skirts';

-- Tops & Shirts: was ['0-3m', '3-12m', '1-3y', '3-5y', '5-10y'] -> now all age groups
UPDATE categories
SET age_group = ARRAY['3mths', '6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs']
WHERE slug = 'tops-shirts';

-- Pants & Leggings: was ['0-3m', '3-12m', '1-3y', '3-5y', '5-10y'] -> now all age groups
UPDATE categories
SET age_group = ARRAY['3mths', '6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs']
WHERE slug = 'pants-leggings';

-- Outerwear: was ['0-3m', '3-12m', '1-3y', '3-5y', '5-10y'] -> now all age groups
UPDATE categories
SET age_group = ARRAY['3mths', '6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs']
WHERE slug = 'outerwear';

-- Sets & Outfits: was ['0-3m', '3-12m', '1-3y', '3-5y', '5-10y'] -> now all age groups
UPDATE categories
SET age_group = ARRAY['3mths', '6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs']
WHERE slug = 'sets-outfits';

-- Accessories: was ['0-3m', '3-12m', '1-3y', '3-5y', '5-10y'] -> now all age groups
UPDATE categories
SET age_group = ARRAY['3mths', '6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs']
WHERE slug = 'accessories';

-- 3. Add constraints to ensure only valid new age values are used
-- This prevents future inserts/updates with old age values

-- First, check if constraint already exists and drop it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'products_age_group_check'
    ) THEN
        ALTER TABLE products DROP CONSTRAINT products_age_group_check;
    END IF;
END $$;

-- Add new constraint with valid age values
ALTER TABLE products
ADD CONSTRAINT products_age_group_check
CHECK (age_group IN ('3mths', '6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs'));

-- 4. Verification queries (commented out - uncomment to run checks)
/*
-- Check that no old age values remain in products
SELECT age_group, COUNT(*)
FROM products
WHERE age_group IN ('0-3m', '3-12m', '1-3y', '3-5y', '5-10y')
GROUP BY age_group;

-- Should return 0 rows if migration was successful

-- Check distribution of new age values in products
SELECT age_group, COUNT(*)
FROM products
WHERE age_group IN ('3mths', '6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs')
GROUP BY age_group
ORDER BY age_group;

-- Check categories age_group arrays
SELECT name, age_group
FROM categories
ORDER BY display_order;
*/

-- Commit transaction
COMMIT;

-- Notes for manual verification after running this migration:
-- 1. Test that product filtering works with new age values
-- 2. Verify that admin product forms only accept new age values
-- 3. Check that all dropdowns show the new age options
-- 4. Test that existing products display correctly with new age mappings
-- 5. Ensure category age arrays work properly for filtering