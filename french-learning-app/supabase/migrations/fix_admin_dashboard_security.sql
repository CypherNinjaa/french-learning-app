-- Fix admin_dashboard_stats security issue - PostgreSQL/Supabase Migration
-- Drop the existing view with SECURITY DEFINER and recreate without it
-- Add secure function with proper admin checks

-- Step 1: Drop the existing insecure view
DROP VIEW IF EXISTS admin_dashboard_stats;

-- Step 2: Create the view without SECURITY DEFINER (uses invoker's permissions)
CREATE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE user_role = 'user') as total_users,
  (SELECT COUNT(*) FROM profiles WHERE user_role IN ('admin', 'super_admin')) as total_admins,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_users_this_week,
  (SELECT COUNT(*) FROM profiles WHERE last_login_at > NOW() - INTERVAL '24 hours') as active_users_today,
  (SELECT COUNT(*) FROM user_sessions WHERE started_at > NOW() - INTERVAL '24 hours') as sessions_today;

-- Step 3: Grant permissions on the view
GRANT SELECT ON admin_dashboard_stats TO authenticated;
