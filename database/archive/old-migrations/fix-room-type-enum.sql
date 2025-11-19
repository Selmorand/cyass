-- Fix room_type enum to include SpecialFeatures
-- Run this in Supabase SQL Editor

-- Drop the existing enum if it exists and recreate it
DO $$ 
BEGIN
    -- Check if the enum exists, if so drop and recreate
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_type') THEN
        -- First, we need to alter the column to use text temporarily
        ALTER TABLE rooms ALTER COLUMN type TYPE TEXT;
        
        -- Drop the enum
        DROP TYPE room_type;
    END IF;
    
    -- Create the new enum with SpecialFeatures included
    CREATE TYPE room_type AS ENUM ('Standard', 'Kitchen', 'Bathroom', 'Patio', 'Outbuilding', 'Exterior', 'SpecialFeatures');
    
    -- Convert the column back to the enum type
    ALTER TABLE rooms ALTER COLUMN type TYPE room_type USING type::room_type;
    
END $$;