-- Add Contractor Role to CYAss Database
-- Run this in Supabase SQL Editor after reviewing
--
-- This migration adds 'contractor' as a valid user role

-- Update user_profiles table to allow contractor role
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('tenant', 'landlord', 'buyer', 'seller', 'agent', 'contractor'));

-- Update properties table to allow contractor as user_role
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_user_role_check;
ALTER TABLE properties ADD CONSTRAINT properties_user_role_check
  CHECK (user_role IN ('tenant', 'landlord', 'buyer', 'seller', 'agent', 'contractor'));

-- Verify the changes
SELECT
  'Contractor role migration complete!' as status,
  (SELECT constraint_name FROM information_schema.check_constraints
   WHERE constraint_name = 'user_profiles_role_check') as profile_constraint,
  (SELECT constraint_name FROM information_schema.check_constraints
   WHERE constraint_name = 'properties_user_role_check') as property_constraint;
