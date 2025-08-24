-- Fix RLS policies for member_profiles table
-- Run this in Supabase SQL Editor

-- First, drop existing policies to clean slate
DROP POLICY IF EXISTS "Users can view their own profiles" ON member_profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON member_profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON member_profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON member_profiles;

-- Recreate policies with proper conditions
-- SELECT policy: Users can view their own profiles
CREATE POLICY "Users can view their own profiles" ON member_profiles
FOR SELECT USING (member_account_id = auth.uid());

-- INSERT policy: Users can create profiles for their account
CREATE POLICY "Users can insert their own profiles" ON member_profiles
FOR INSERT WITH CHECK (member_account_id = auth.uid());

-- UPDATE policy: Users can update their own profiles
CREATE POLICY "Users can update their own profiles" ON member_profiles
FOR UPDATE USING (member_account_id = auth.uid()) 
WITH CHECK (member_account_id = auth.uid());

-- DELETE policy: Users can delete their own profiles (soft delete via UPDATE)
CREATE POLICY "Users can delete their own profiles" ON member_profiles
FOR UPDATE USING (member_account_id = auth.uid()) 
WITH CHECK (member_account_id = auth.uid());

-- Verify RLS is enabled
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;

-- Check the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual AS using_condition, with_check AS check_condition
FROM pg_policies 
WHERE tablename = 'member_profiles';