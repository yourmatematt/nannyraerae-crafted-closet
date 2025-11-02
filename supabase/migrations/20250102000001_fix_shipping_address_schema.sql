-- Fix shipping address schema to use separate columns
-- This migration updates the orders table to match the current database structure

-- First, let's check if the separate columns already exist and add them if they don't
DO $$
BEGIN
    -- Add shipping address columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_address_line1') THEN
        ALTER TABLE orders ADD COLUMN shipping_address_line1 TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_address_line2') THEN
        ALTER TABLE orders ADD COLUMN shipping_address_line2 TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_city') THEN
        ALTER TABLE orders ADD COLUMN shipping_city TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_state') THEN
        ALTER TABLE orders ADD COLUMN shipping_state TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_postcode') THEN
        ALTER TABLE orders ADD COLUMN shipping_postcode TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_country') THEN
        ALTER TABLE orders ADD COLUMN shipping_country TEXT DEFAULT 'AU';
    END IF;
END $$;

-- Migrate data from JSONB shipping_address to separate columns if the JSONB column exists and has data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
        -- Migrate existing data from JSONB to separate columns
        UPDATE orders
        SET
            shipping_address_line1 = shipping_address->>'line1',
            shipping_address_line2 = shipping_address->>'line2',
            shipping_city = shipping_address->>'city',
            shipping_state = shipping_address->>'state',
            shipping_postcode = shipping_address->>'postal_code',
            shipping_country = COALESCE(shipping_address->>'country', 'AU')
        WHERE shipping_address IS NOT NULL
        AND (shipping_address_line1 IS NULL OR shipping_address_line1 = '');

        -- Drop the old JSONB column
        ALTER TABLE orders DROP COLUMN IF EXISTS shipping_address;
    END IF;
END $$;

-- Similarly for billing_address if needed
DO $$
BEGIN
    -- Add billing address columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'billing_address_line1') THEN
        ALTER TABLE orders ADD COLUMN billing_address_line1 TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'billing_address_line2') THEN
        ALTER TABLE orders ADD COLUMN billing_address_line2 TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'billing_city') THEN
        ALTER TABLE orders ADD COLUMN billing_city TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'billing_state') THEN
        ALTER TABLE orders ADD COLUMN billing_state TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'billing_postcode') THEN
        ALTER TABLE orders ADD COLUMN billing_postcode TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'billing_country') THEN
        ALTER TABLE orders ADD COLUMN billing_country TEXT DEFAULT 'AU';
    END IF;
END $$;

-- Migrate billing address data if JSONB column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'billing_address') THEN
        -- Migrate existing data from JSONB to separate columns
        UPDATE orders
        SET
            billing_address_line1 = billing_address->>'line1',
            billing_address_line2 = billing_address->>'line2',
            billing_city = billing_address->>'city',
            billing_state = billing_address->>'state',
            billing_postcode = billing_address->>'postal_code',
            billing_country = COALESCE(billing_address->>'country', 'AU')
        WHERE billing_address IS NOT NULL
        AND (billing_address_line1 IS NULL OR billing_address_line1 = '');

        -- Drop the old JSONB column
        ALTER TABLE orders DROP COLUMN IF EXISTS billing_address;
    END IF;
END $$;