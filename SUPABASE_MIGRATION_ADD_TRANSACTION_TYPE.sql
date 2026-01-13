-- Migration: Add transaction_type column to expenses table
-- Run this script if you already have the expenses table created

-- Check if the column exists before adding it
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS transaction_type TEXT;

-- Add an index for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_transaction_type ON expenses(transaction_type);

-- Verify the column was added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'expenses' ORDER BY ordinal_position;
