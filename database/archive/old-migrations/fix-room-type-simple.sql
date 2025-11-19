-- Simple fix for room_type enum to include SpecialFeatures
-- Run this in Supabase SQL Editor

-- First check if we have any existing rooms
-- If no data exists, we can safely recreate the enum

DO $$ 
DECLARE
    room_count INTEGER;
BEGIN
    -- Count existing rooms
    SELECT COUNT(*) INTO room_count FROM rooms;
    
    IF room_count = 0 THEN
        -- No data exists, safe to recreate enum
        DROP TYPE IF EXISTS room_type CASCADE;
        CREATE TYPE room_type AS ENUM ('Standard', 'Kitchen', 'Bathroom', 'Patio', 'Outbuilding', 'Exterior', 'SpecialFeatures');
        
        -- Recreate the rooms table with the new enum
        ALTER TABLE rooms ALTER COLUMN type TYPE room_type USING type::text::room_type;
    ELSE
        -- Data exists, use ALTER TYPE ADD VALUE (safer)
        ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'SpecialFeatures';
    END IF;
END $$;