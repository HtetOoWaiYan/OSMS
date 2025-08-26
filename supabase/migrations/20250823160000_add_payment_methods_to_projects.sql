-- Add payment_methods field to projects table
-- This field will store JSON configuration for various payment methods (COD, KBZPay, CBPay, AYAPay)

alter table projects add column payment_methods jsonb default '{}';

-- Add comment for documentation
comment on column projects.payment_methods is 'JSON configuration for payment methods available in the mini-app (COD, KBZPay, CBPay, AYAPay, etc.)';