-- Fix the check constraint on rooms table
-- Run this in Supabase SQL Editor

-- First, let's see what constraints exist
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%rooms%type%';

-- Drop the existing check constraint
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_type_check;

-- Add a new check constraint that includes SpecialFeatures
ALTER TABLE rooms ADD CONSTRAINT rooms_type_check 
CHECK (type IN ('Standard', 'Kitchen', 'Bathroom', 'Patio', 'Outbuilding', 'Exterior', 'SpecialFeatures'));