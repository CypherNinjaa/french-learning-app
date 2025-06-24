-- ====================================================================
-- PROMOTE USER TO SUPER ADMIN - FRENCH LEARNING APP
-- Run this in your Supabase SQL Editor to promote users to admin roles
-- ====================================================================

-- ====================================================================
-- METHOD 1: PROMOTE BY EMAIL ADDRESS (Recommended)
-- ====================================================================

-- Replace 'admin@example.com' with the actual email address
UPDATE profiles 
SET user_role = 'super_admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@example.com'
);

-- Verify the promotion worked
SELECT 
  u.email,
  p.full_name,
  p.username,
  p.user_role,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@example.com';

-- ====================================================================
-- METHOD 2: PROMOTE BY USER ID (if you know the UUID)
-- ====================================================================

-- Replace 'USER_UUID_HERE' with the actual user UUID
-- UPDATE profiles 
-- SET user_role = 'super_admin' 
-- WHERE id = 'USER_UUID_HERE';

-- ====================================================================
-- METHOD 3: PROMOTE MULTIPLE USERS AT ONCE
-- ====================================================================

-- Replace with actual email addresses
-- UPDATE profiles 
-- SET user_role = 'super_admin' 
-- WHERE id IN (
--   SELECT id FROM auth.users 
--   WHERE email IN (
--     'admin1@example.com',
--     'admin2@example.com',
--     'admin3@example.com'
--   )
-- );

-- ====================================================================
-- METHOD 4: PROMOTE THE FIRST REGISTERED USER (if you want)
-- ====================================================================

-- This promotes the very first user who registered
-- UPDATE profiles 
-- SET user_role = 'super_admin' 
-- WHERE id = (
--   SELECT id FROM profiles 
--   ORDER BY created_at ASC 
--   LIMIT 1
-- );

-- ====================================================================
-- VERIFICATION QUERIES
-- ====================================================================

-- View all admin users
SELECT 
  u.email,
  p.full_name,
  p.username,
  p.user_role,
  p.created_at,
  p.last_login_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.user_role IN ('admin', 'super_admin')
ORDER BY p.created_at ASC;

-- Count users by role
SELECT 
  user_role,
  COUNT(*) as count
FROM profiles
GROUP BY user_role
ORDER BY count DESC;

-- View all registered users (to find the email you want to promote)
SELECT 
  u.email,
  p.full_name,
  p.username,
  p.user_role,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
ORDER BY p.created_at ASC;

-- ====================================================================
-- ADDITIONAL ADMIN MANAGEMENT
-- ====================================================================

-- Demote a super admin back to regular user
-- UPDATE profiles 
-- SET user_role = 'user' 
-- WHERE id = (
--   SELECT id FROM auth.users 
--   WHERE email = 'demote-this-email@example.com'
-- );

-- Promote to regular admin (not super admin)
-- UPDATE profiles 
-- SET user_role = 'admin' 
-- WHERE id = (
--   SELECT id FROM auth.users 
--   WHERE email = 'make-admin@example.com'
-- );

-- ====================================================================
-- SUCCESS MESSAGE
-- ====================================================================

SELECT 
  '🎉 USER PROMOTION COMPLETED!' as message,
  'Check the verification queries above to confirm the role change.' as instruction,
  'Super admins have full access to the admin panel and all features.' as note;
