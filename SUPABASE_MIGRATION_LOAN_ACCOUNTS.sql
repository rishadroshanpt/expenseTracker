-- Create loan_accounts table to store loans given and loans taken
CREATE TABLE IF NOT EXISTS loan_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('loan-given', 'loan-taken', 'credit-card')),
  name VARCHAR(255) NOT NULL,
  initial_amount DECIMAL(12, 2) NOT NULL,
  amount_received DECIMAL(12, 2) DEFAULT 0,
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user and type
CREATE INDEX IF NOT EXISTS idx_loan_accounts_user_id ON loan_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_accounts_account_type ON loan_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_loan_accounts_user_type ON loan_accounts(user_id, account_type);

-- Enable RLS (Row Level Security)
ALTER TABLE loan_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own loan accounts
CREATE POLICY "Users can view their own loan accounts"
  ON loan_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own loan accounts
CREATE POLICY "Users can insert their own loan accounts"
  ON loan_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own loan accounts
CREATE POLICY "Users can update their own loan accounts"
  ON loan_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own loan accounts
CREATE POLICY "Users can delete their own loan accounts"
  ON loan_accounts FOR DELETE
  USING (auth.uid() = user_id);
