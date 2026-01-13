-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_type ON expenses(type);
CREATE INDEX idx_users_email ON users(email);

-- Enable row level security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Create policies for expenses table
CREATE POLICY "Users can view their own expenses"
  ON expenses
  FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own expenses"
  ON expenses
  FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own expenses"
  ON expenses
  FOR UPDATE
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own expenses"
  ON expenses
  FOR DELETE
  USING (user_id::text = auth.uid()::text);
