# Fix: Supabase Insert Error - Missing transaction_type Column

## Problem
You're getting this error when trying to add a transaction:
```
Supabase insert error: [object Object]
Add expense error
```

## Root Cause
The `expenses` table in Supabase is missing the `transaction_type` column that the app is trying to insert.

## Solution

### Option A: Run Migration Script (Recommended for existing databases)

1. **Go to Supabase Dashboard**
   - Log in to https://supabase.com
   - Select your Expense Tracker project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy Migration Script**
   - Open `SUPABASE_MIGRATION_ADD_TRANSACTION_TYPE.sql` from your project root
   - Copy the entire contents

4. **Paste and Run**
   - Paste into the Supabase SQL editor
   - Click "Run" button
   - You should see a success message

5. **Verify the Column**
   - Go to "Table Editor" in Supabase
   - Click on the "expenses" table
   - You should see a new "transaction_type" column (TEXT type, nullable)

### Option B: Recreate Database from Scratch (If starting fresh)

1. **Delete existing tables** (if comfortable doing so)
   - In Supabase SQL Editor, run:
   ```sql
   DROP TABLE IF EXISTS expenses CASCADE;
   DROP TABLE IF EXISTS profiles CASCADE;
   ```

2. **Run Full Setup Script**
   - Open `SUPABASE_SETUP.sql` from your project root
   - Copy all contents
   - Paste into Supabase SQL editor
   - Click "Run"

3. **Verify the Setup**
   - Go to "Table Editor"
   - You should see both `profiles` and `expenses` tables
   - The `expenses` table should have the `transaction_type` column

## Testing

After running the migration:

1. **Refresh your app** (the dev server will auto-reload)
2. **Try adding a transaction**
   - Click the + button
   - Fill in the form (Amount, Description, Payment Method, Date)
   - Click "Income" or "Expense"
3. **It should work!** The transaction should appear in your list

## What Changed

We added a new column to track payment methods:
- **Column Name**: `transaction_type`
- **Type**: TEXT (accepts values like "Cash", "GPay", "Card", "Bank")
- **Nullable**: Yes (old transactions won't have a value)

## Need Help?

If you're still getting errors:

1. **Check the browser console** for detailed error messages
2. **Check Supabase logs**:
   - In Supabase dashboard, click "Logs" in the left sidebar
   - Look for any SQL errors
3. **Verify RLS Policies**:
   - Go to "Authentication" → "Policies" in Supabase
   - Make sure the INSERT policy exists for your user role

## Updated Files

The following files have been updated to support transaction_type:

✅ `SUPABASE_SETUP.sql` - Main setup script (updated)
✅ `SUPABASE_MIGRATION_ADD_TRANSACTION_TYPE.sql` - New migration script  
✅ `shared/api.ts` - Type definitions (supports transaction_type)
✅ `client/hooks/useExpenses.ts` - API functions (sends transaction_type)
✅ `client/components/AddTransactionModal.tsx` - Form (collects transaction_type)
✅ `client/pages/Home.tsx` - Display (shows transaction_type)
✅ `client/pages/Ledger.tsx` - Filtering (filters by transaction_type)

All the code is ready and working. You just need to add the column to Supabase!
