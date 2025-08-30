-- Fix item_prices trigger issue
-- Remove the update trigger for item_prices table as it doesn't have an updated_at column

-- Drop the trigger that's causing the "record 'new' has no field 'updated_at'" error
drop trigger if exists update_item_prices_updated_at on item_prices;

-- Item prices don't need updated_at trigger as they use effective_from/effective_until
-- for versioning and price changes create new records rather than updating existing ones