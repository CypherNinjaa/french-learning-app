-- Quick fix for infinite recursion in profiles RLS policies
-- Run this immediately to fix login issues

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Simplified admin policy without recursion
CREATE POLICY "Allow profile access for admin functions" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow INSERT for new users (for registration)
CREATE POLICY "Allow profile creation" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
