-- Migration to add CHECK constraint for product_type field
-- This ensures only valid product types can be stored in the database

-- Begin transaction
BEGIN;

-- Drop existing constraint if it exists (in case this migration is re-run)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'products_product_type_check'
        AND table_name = 'products'
    ) THEN
        ALTER TABLE products DROP CONSTRAINT products_product_type_check;
    END IF;
END $$;

-- Add CHECK constraint to ensure only valid product types are allowed
-- This includes existing types and new types: "Shorts", "Shirts", "Sets"
ALTER TABLE products
ADD CONSTRAINT products_product_type_check
CHECK (product_type IN (
    'Accessories',
    'Dress',
    'Jacket',
    'Other',
    'Overalls',
    'Pants',
    'Romper',
    'Sets',
    'Shirts',
    'Shorts',
    'Top'
));

-- Verification queries (commented out - uncomment to run checks)
/*
-- Check if any existing products have invalid product_type values
SELECT product_type, COUNT(*)
FROM products
WHERE product_type IS NOT NULL
  AND product_type NOT IN (
    'Accessories', 'Dress', 'Jacket', 'Other', 'Overalls',
    'Pants', 'Romper', 'Sets', 'Shirts', 'Shorts', 'Top'
  )
GROUP BY product_type;

-- Should return 0 rows if all existing product types are valid

-- Check distribution of product types
SELECT product_type, COUNT(*)
FROM products
WHERE product_type IS NOT NULL
GROUP BY product_type
ORDER BY product_type;
*/

-- Commit transaction
COMMIT;

-- Notes:
-- 1. This migration adds a CHECK constraint to ensure data integrity
-- 2. New product types "Sets", "Shirts", "Shorts" are now supported
-- 3. All product types are listed alphabetically in the constraint
-- 4. The constraint allows NULL values (products can have no type temporarily)
-- 5. This will prevent invalid product types from being inserted in the future
-- 6. Frontend components that fetch product types dynamically will automatically
--    show the new types when products are created with them