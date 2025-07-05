-- Clean up existing policies that might conflict with our schema
-- Run this BEFORE running the main LEARNING_PLATFORM_SCHEMA.sql

-- Drop existing policies on profiles table that might conflict
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Note: This only drops policies that our schema will recreate
-- Other existing policies on the profiles table will remain untouched

-- After running this, you can safely run LEARNING_PLATFORM_SCHEMA.sql
