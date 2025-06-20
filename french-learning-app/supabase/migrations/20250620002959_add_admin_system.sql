-- Stage 2.3: Admin Role System
-- Create admin roles and permissions system

-- Add admin role to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'user';

-- Create enum for user roles (optional, but good practice)
CREATE TYPE user_role_enum AS ENUM ('user', 'admin', 'super_admin');

-- Update the column to use the enum (optional)
-- ALTER TABLE profiles ALTER COLUMN user_role TYPE user_role_enum USING user_role::user_role_enum;

-- Create admin-specific tables
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  permission_name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role permissions mapping
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_role TEXT NOT NULL,
  permission_name TEXT REFERENCES admin_permissions(permission_name) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_role, permission_name)
);

-- Create admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin tables
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for admin tables

-- Admin permissions - only super admins can manage
CREATE POLICY "Super admins can manage permissions" 
ON admin_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_role = 'super_admin'
  )
);

-- Role permissions - only super admins can manage
CREATE POLICY "Super admins can manage role permissions" 
ON role_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_role = 'super_admin'
  )
);

-- Admin activity log - admins can view, only system can insert
CREATE POLICY "Admins can view activity log" 
ON admin_activity_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "System can insert activity log" 
ON admin_activity_log FOR INSERT
WITH CHECK (true); -- This will be restricted by application logic

-- Insert default permissions
INSERT INTO admin_permissions (permission_name, description) VALUES
('manage_users', 'Can view and manage user accounts'),
('manage_content', 'Can create and edit learning content'),
('manage_lessons', 'Can create and manage lessons'),
('manage_vocabulary', 'Can manage vocabulary database'),
('manage_analytics', 'Can view analytics and reports'),
('manage_admins', 'Can manage admin accounts and permissions'),
('view_admin_dashboard', 'Can access admin dashboard'),
('export_data', 'Can export user and content data'),
('manage_achievements', 'Can create and manage achievements'),
('moderate_content', 'Can moderate user-generated content');

-- Assign default permissions to roles
INSERT INTO role_permissions (user_role, permission_name) VALUES
-- Admin permissions
('admin', 'view_admin_dashboard'),
('admin', 'manage_content'),
('admin', 'manage_lessons'),
('admin', 'manage_vocabulary'),
('admin', 'manage_analytics'),
('admin', 'manage_achievements'),
('admin', 'moderate_content'),

-- Super admin permissions (all permissions)
('super_admin', 'view_admin_dashboard'),
('super_admin', 'manage_users'),
('super_admin', 'manage_content'),
('super_admin', 'manage_lessons'),
('super_admin', 'manage_vocabulary'),
('super_admin', 'manage_analytics'),
('super_admin', 'manage_admins'),
('super_admin', 'export_data'),
('super_admin', 'manage_achievements'),
('super_admin', 'moderate_content');

-- Create function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN role_permissions rp ON p.user_role = rp.user_role
    WHERE p.id = user_id 
    AND rp.permission_name = permission
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  admin_id UUID,
  action_name TEXT,
  table_name TEXT DEFAULT NULL,
  record_id TEXT DEFAULT NULL,
  old_record JSONB DEFAULT NULL,
  new_record JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO admin_activity_log (
    admin_user_id,
    action,
    target_table,
    target_id,
    old_data,
    new_data
  ) VALUES (
    admin_id,
    action_name,
    table_name,
    record_id,
    old_record,
    new_record
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for admin dashboard stats
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE user_role = 'user') as total_users,
  (SELECT COUNT(*) FROM profiles WHERE user_role IN ('admin', 'super_admin')) as total_admins,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_users_this_week,
  (SELECT COUNT(*) FROM profiles WHERE last_login_at > NOW() - INTERVAL '24 hours') as active_users_today,
  (SELECT COUNT(*) FROM user_sessions WHERE started_at > NOW() - INTERVAL '24 hours') as sessions_today;
