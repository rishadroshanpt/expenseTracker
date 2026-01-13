# Deploying to Vercel

This guide will help you deploy the Expense Tracker application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your Supabase project set up with the database schema
3. Supabase credentials (Project URL and Anon Key)

## Step 1: Set Up Supabase Database

Before deploying, make sure your Supabase database is properly configured:

1. Go to your Supabase project at https://supabase.com
2. Open the **SQL Editor**
3. Click **"+ New query"**
4. Copy the entire contents from the `SUPABASE_SETUP.sql` file in this project root
5. Paste it into the SQL editor
6. Click **"Run"**

This creates the necessary tables and security policies for your app.

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy the project**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Confirm the project name
   - Select "." as the project root
   - Skip creating a monorepo setup

5. **Add environment variables** in Vercel dashboard:
   - Go to your project settings → Environment Variables
   - Add the following variables:
     ```
     VITE_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase
     VITE_PUBLIC_BUILDER_KEY=your-builder-key (optional)
     ```

6. **Redeploy** to apply environment variables:
   ```bash
   vercel --prod
   ```

### Option B: Using GitHub Integration

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Click "Import"

3. **Configure the project**:
   - Framework: Vite (auto-detected)
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Root Directory: `.`

4. **Add Environment Variables**:
   - In the "Environment Variables" section, add:
     ```
     VITE_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     VITE_PUBLIC_BUILDER_KEY=your-builder-key (optional)
     ```

5. **Click "Deploy"**

## Step 3: Verify Your Deployment

1. Once deployment is complete, Vercel will give you a live URL
2. Visit your URL and test the following:
   - Create a new account (sign up)
   - Log in with your credentials
   - Add income and expense transactions
   - Verify the balance calculation is correct
   - Delete a transaction
   - Log out and log back in (verify data persists)

## Environment Variables Reference

- **VITE_PUBLIC_SUPABASE_URL**: Your Supabase project URL
  - Found in: Supabase Dashboard → Settings → API → Project URL
  
- **VITE_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anon key
  - Found in: Supabase Dashboard → Settings → API → anon public key
  
- **VITE_PUBLIC_BUILDER_KEY**: Builder.io API key (optional)
  - Only needed if using Builder.io features

## How Balance is Calculated

The balance is calculated automatically on the client side:
- **Total Income**: Sum of all 'credit' type transactions
- **Total Expenses**: Sum of all 'debit' type transactions
- **Balance**: Total Income - Total Expenses

Alternatively, you can view the `user_balance` view in your Supabase SQL Editor for server-side calculations.

## Troubleshooting

### "Supabase connection failed"
- Verify `VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is active
- Ensure your Supabase credentials are pasted exactly as they appear

### "Invalid email or password" on login
- Make sure you created an account using the Sign Up page first
- Check that your email and password match what you signed up with

### "Failed to fetch expenses"
- Make sure the `expenses` table exists in your Supabase database
- Check that the SQL setup script was executed successfully
- Verify Row-Level Security (RLS) policies are enabled

### "Cannot read property 'email' of null"
- Make sure you're logged in before accessing the expense tracker
- Clear your browser cache and try again

## Production Best Practices

1. **Secure your Supabase credentials**:
   - Never expose your keys in client-side code (they should be public anyway as they're anon keys)
   - Keep your `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables only on Vercel

2. **Monitor Supabase usage**:
   - Keep an eye on your Supabase project limits and quotas

3. **Enable Supabase backups**:
   - Go to Supabase Dashboard → Database → Backups
   - Enable automatic backups for production data

4. **Set up email verification** (optional):
   - In Supabase → Authentication → Providers
   - Enable email verification for new signups

## Next Steps

After successful deployment:

1. Share your app URL with others
2. Consider adding more features:
   - Expense categories/tags
   - Monthly budget limits
   - Export to CSV
   - Dark mode toggle
   - Multi-currency support

## Support

If you encounter issues:

1. Check Supabase logs: Supabase Dashboard → Logs
2. Check Vercel logs: Vercel Dashboard → Deployments → Click on deployment
3. Open browser DevTools → Console for client-side errors
4. Verify environment variables are correctly set in Vercel dashboard

## Additional Resources

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev
