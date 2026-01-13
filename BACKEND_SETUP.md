# Backend Setup Guide

This guide will help you complete the backend setup for the Expense Tracker app with authentication and database persistence.

## Prerequisites

1. ✅ Node.js and pnpm (already installed)
2. 🔗 Supabase account (create one at https://supabase.com)

## Step 1: Connect Supabase

### 1.1 Create a Supabase Project

1. Go to https://supabase.com and sign up or log in
2. Click "New Project"
3. Fill in the details:
   - **Name**: Expense Tracker (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose a region closest to you
4. Wait for the project to be created

### 1.2 Connect via MCP (Recommended)

1. In Builder.io, click [Open MCP popover](#open-mcp-popover)
2. Click "Connect to Supabase"
3. Authenticate with your Supabase account
4. Select your Expense Tracker project
5. Authorize the connection

## Step 2: Set Up Database Schema

### 2.1 Run SQL Setup Script

After connecting Supabase:

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"+ New query"**
3. Copy the entire contents from `SUPABASE_SETUP.sql` (in the project root)
4. Paste it into the SQL editor
5. Click **"Run"**

This creates:

- `users` table for storing user accounts
- `expenses` table for storing transactions
- Proper indexes for performance
- Row-level security policies

### 2.2 Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see `users` and `expenses` tables listed
3. Click on each table to verify the columns are correct

## Step 3: Configure Environment Variables

### 3.1 Get Supabase Credentials

1. In Supabase dashboard, click **Settings** (gear icon)
2. Go to **API**
3. Copy these values:
   - **Project URL** → This is your `SUPABASE_URL`
   - **anon public** key → This is your `SUPABASE_ANON_KEY`

### 3.2 Create .env File

1. In your project root, create or update a `.env` file with:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your-secret-key-change-in-production
```

Replace:

- `your-project-id` with your actual project ID
- `your-anon-key-here` with the anon key from Supabase
- `your-secret-key-change-in-production` with a random string (e.g., run `openssl rand -hex 32`)

## Step 4: Test the Setup

### 4.1 Start Development Server

The dev server should already be running, but you can restart it if needed:

```bash
pnpm dev
```

### 4.2 Test Authentication

1. Open the app preview
2. You should see a **Login** page
3. Click "Sign up" to create an account
4. Fill in your email and password
5. Click "Create Account"
6. You should be redirected to the Expense Tracker

### 4.3 Test Expenses API

1. Add an expense/income transaction
2. It should appear in the list immediately
3. Refresh the page - the data should persist!
4. Click the trash icon to delete a transaction
5. Log out and log back in - your data is still there

## Step 5: Environment Variables Setup (Optional but Recommended)

Use the DevServerControl to set environment variables securely:

Instead of editing `.env` file directly, you can set them via the development environment:

1. For sensitive production deployment, use:
   - Environment variable management in your deployment platform
   - Never commit `.env` files to git

## Troubleshooting

### Issue: "No token provided" error

- Make sure you're logged in before accessing the expense tracker
- Check that your JWT_SECRET is set in .env

### Issue: "Invalid email or password"

- Verify the email exists in the Supabase `users` table
- Check the password is correct

### Issue: "Failed to fetch expenses"

- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check Supabase project is active
- Verify row-level security policies are set up correctly

### Issue: Can't create account

- Check if the email is already registered
- Verify password is at least 6 characters
- Check Supabase `users` table has been created

## Security Notes

1. **JWT_SECRET**: Change this in production to a random, secure string
2. **SUPABASE_ANON_KEY**: This is safe to expose in client code (it's the anonymous key)
3. **Row-Level Security**: The SQL script enables RLS for additional security
4. **Password Hashing**: Passwords are hashed using bcryptjs with 10 salt rounds

## API Endpoints

Once set up, the following endpoints are available:

### Authentication

- `POST /api/auth/signup` - Create a new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires token)

### Expenses

- `GET /api/expenses` - List user's expenses (requires token)
- `POST /api/expenses` - Create new expense (requires token)
- `DELETE /api/expenses/:id` - Delete expense (requires token)

All expense endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Next Steps

1. ✅ Backend is now fully functional!
2. Consider adding:
   - Password reset functionality
   - Email verification
   - Expense categories/tags
   - Monthly budget limits
   - Export to CSV feature
   - Multi-user sharing

## Support

If you encounter issues:

1. Check the Supabase dashboard logs
2. Verify all environment variables are set correctly
3. Check browser console for error messages
4. Review the error responses from API calls
