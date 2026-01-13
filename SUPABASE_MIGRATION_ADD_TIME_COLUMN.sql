-- Migration: Add time column to expenses table
-- Run this SQL in your Supabase SQL Editor if you already have the expenses table

-- Add time column if it doesn't exist
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS time TEXT;

-- Optional: Add comment to describe the column
COMMENT ON COLUMN expenses.time IS 'Time in HH:MM format (Asia/Kolkata timezone)';
