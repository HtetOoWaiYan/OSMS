-- Migration for Telegram Mini-App Extensions
-- This adds the necessary fields and tables for the mini-app functionality

-- 1. Add payment methods configuration to projects table
ALTER TABLE projects ADD COLUMN payment_methods JSONB DEFAULT '{}';

-- 2. Add Telegram fields to user_roles table  
ALTER TABLE user_roles ADD COLUMN telegram_username VARCHAR(255);
ALTER TABLE user_roles ADD COLUMN telegram_user_id BIGINT;

-- 3. Add created_via field to customers table for tracking creation source
ALTER TABLE customers ADD COLUMN created_via TEXT DEFAULT 'manual' CHECK (created_via IN ('manual', 'telegram'));

-- 4. Add additional fields to orders table for mini-app support
ALTER TABLE orders ADD COLUMN telegram_user_id BIGINT;
ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(255);
ALTER TABLE orders ADD COLUMN delivery_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN customer_phone_secondary VARCHAR(20);

-- 5. Create QR Code Storage table
CREATE TABLE payment_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL, -- 'kbz_pay', 'cb_pay', 'aya_pay'
  phone_number VARCHAR(20) NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new table
ALTER TABLE payment_qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policy for QR codes - users can manage their project's QR codes
CREATE POLICY "Users can manage their project's QR codes" ON payment_qr_codes
  FOR ALL USING (
    project_id IN (
      SELECT project_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Create function for auto-creating customers from Telegram
CREATE OR REPLACE FUNCTION create_customer_from_telegram(
  p_project_id UUID,
  p_telegram_id BIGINT,
  p_telegram_username VARCHAR DEFAULT NULL,
  p_first_name VARCHAR DEFAULT NULL,
  p_last_name VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  customer_id UUID;
BEGIN
  INSERT INTO customers (
    project_id,
    telegram_user_id,
    telegram_username,
    first_name,
    last_name,
    created_via
  ) VALUES (
    p_project_id,
    p_telegram_id,
    p_telegram_username,
    COALESCE(p_first_name, 'Telegram User'),
    p_last_name,
    'telegram'
  )
  ON CONFLICT (project_id, telegram_user_id) 
  DO UPDATE SET 
    telegram_username = EXCLUDED.telegram_username,
    first_name = COALESCE(EXCLUDED.first_name, customers.first_name),
    last_name = COALESCE(EXCLUDED.last_name, customers.last_name),
    updated_at = now()
  RETURNING id INTO customer_id;
  
  RETURN customer_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Add unique constraint for telegram users per project
CREATE UNIQUE INDEX IF NOT EXISTS customers_project_telegram_unique 
ON customers(project_id, telegram_user_id) 
WHERE telegram_user_id IS NOT NULL;

-- 8. Add indexes for better performance
CREATE INDEX IF NOT EXISTS orders_telegram_user_id_idx ON orders(telegram_user_id);
CREATE INDEX IF NOT EXISTS payment_qr_codes_project_id_idx ON payment_qr_codes(project_id);
CREATE INDEX IF NOT EXISTS customers_created_via_idx ON customers(created_via);

-- Grant permissions for service role
GRANT ALL ON payment_qr_codes TO service_role;