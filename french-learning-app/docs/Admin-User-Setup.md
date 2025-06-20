# Admin User Setup Guide

## Creating Admin Users in Supabase Dashboard

Since admin users should be created securely through the database rather than through the app, follow these steps to create admin users directly in Supabase.

## Step 1: Create Regular User Account

1. **Option A: Through the App**

   - Open your French Learning App
   - Go to Register screen
   - Create a new account with the admin's email and password
   - Complete the registration process

2. **Option B: Through Supabase Dashboard**
   - Go to your Supabase Dashboard
   - Navigate to **Authentication** → **Users**
   - Click **"Add user"**
   - Enter email and password
   - Click **"Create user"**

## Step 2: Promote User to Admin

### Method 1: Using Supabase SQL Editor

1. Go to **SQL Editor** in your Supabase Dashboard
2. Run this query to promote a user to admin:

```sql
-- Replace 'admin@example.com' with the actual admin email
UPDATE profiles
SET user_role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@example.com'
);
```

### Method 2: Using Table Editor

1. Go to **Table Editor** in your Supabase Dashboard
2. Open the **profiles** table
3. Find the user you want to promote
4. Edit the `user_role` column
5. Change the value from `'user'` to `'admin'` or `'super_admin'`
6. Save the changes

## Admin Role Types

### Admin (`'admin'`)

- Can access admin dashboard
- Can manage content, lessons, vocabulary
- Can view analytics
- Can manage achievements
- Cannot manage other admins

### Super Admin (`'super_admin'`)

- Has all admin permissions
- Can manage other admin users
- Can export data
- Can manage permissions

## Step 3: Verify Admin Access

1. **Login with Admin Account**

   - Open the French Learning App
   - Login with the admin email and password
   - You should see an "Admin Panel" button on the home screen

2. **Test Admin Dashboard**
   - Tap "Admin Panel"
   - Verify you can access the admin dashboard
   - Check that statistics are loading correctly

## Example Admin Creation Script

If you want to create multiple admin users, you can use this SQL script:

```sql
-- Create admin users (run this after users have registered through the app)
UPDATE profiles
SET user_role = 'admin'
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'support@yourapp.com'
);

-- Create a super admin
UPDATE profiles
SET user_role = 'super_admin'
WHERE email = 'superadmin@yourapp.com';

-- Verify the changes
SELECT
  p.username,
  u.email,
  p.user_role,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.user_role IN ('admin', 'super_admin')
ORDER BY p.created_at DESC;
```

## Security Best Practices

1. **Use Strong Passwords**: Admin accounts should have strong, unique passwords
2. **Limit Admin Count**: Only create admin accounts for users who need them
3. **Regular Audits**: Periodically review admin accounts and remove unused ones
4. **Monitor Activity**: Check the `admin_activity_log` table for admin actions

## Troubleshooting

### "Admin Panel" Button Not Showing

- Verify the user's `user_role` is set to 'admin' or 'super_admin'
- Make sure the user logged out and logged back in after role change
- Check browser console for any errors

### Admin Dashboard Stats Not Loading

- Verify the `admin_dashboard_stats` view exists in your database
- Check if the user has proper permissions
- Look at Supabase logs for any RLS policy issues

### Permission Denied Errors

- Ensure Row Level Security policies are correctly set
- Verify the user's role matches the policy requirements
- Check the `has_permission()` function is working correctly

---

**Next Steps**: Once admin users are created, they can access the admin dashboard and prepare for Stage 3 content management features.
