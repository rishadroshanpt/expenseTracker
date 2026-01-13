-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row-Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can only read their own data" ON users
  FOR SELECT USING (
    auth.uid() = id OR auth.jwt() ->> 'sub' = id::text
  );

CREATE POLICY "Users can only update their own data" ON users
  FOR UPDATE USING (
    auth.uid() = id OR auth.jwt() ->> 'sub' = id::text
  );

-- Create RLS policies for expenses table
CREATE POLICY "Users can only see their own expenses" ON expenses
  FOR SELECT USING (
    auth.uid() = user_id OR auth.jwt() ->> 'sub' = user_id::text
  );

CREATE POLICY "Users can only create their own expenses" ON expenses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR auth.jwt() ->> 'sub' = user_id::text
  );

CREATE POLICY "Users can only update their own expenses" ON expenses
  FOR UPDATE USING (
    auth.uid() = user_id OR auth.jwt() ->> 'sub' = user_id::text
  );

CREATE POLICY "Users can only delete their own expenses" ON expenses
  FOR DELETE USING (
    auth.uid() = user_id OR auth.jwt() ->> 'sub' = user_id::text
  );
