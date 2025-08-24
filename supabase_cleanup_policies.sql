-- Clean up duplicate RLS policies for member_profiles table
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Members can add profiles linked to their account" ON member_profiles;
DROP POLICY IF EXISTS "Members can delete profiles linked to their account" ON member_profiles;
DROP POLICY IF EXISTS "Members can update profiles linked to their account" ON member_profiles;
DROP POLICY IF EXISTS "Members can view profiles linked to their account" ON member_profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON member_profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON member_profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON member_profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON member_profiles;

-- Create clean, single set of policies for authenticated users only
-- SELECT policy: Users can view their own profiles
CREATE POLICY "Users can view their own profiles" ON member_profiles
FOR SELECT 
TO authenticated
USING (member_account_id = auth.uid());

-- INSERT policy: Users can create profiles for their account
CREATE POLICY "Users can create their own profiles" ON member_profiles
FOR INSERT 
TO authenticated
WITH CHECK (member_account_id = auth.uid());

-- UPDATE policy: Users can update their own profiles
CREATE POLICY "Users can update their own profiles" ON member_profiles
FOR UPDATE 
TO authenticated
USING (member_account_id = auth.uid()) 
WITH CHECK (member_account_id = auth.uid());

-- No DELETE policy needed since we use soft deletes (UPDATE is_active = false)

-- Ensure RLS is enabled
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;

-- Verify the cleaned up policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, 
       qual AS using_condition, with_check AS check_condition
FROM pg_policies 
WHERE tablename = 'member_profiles'
ORDER BY cmd, policyname;