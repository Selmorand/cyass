-- CYAss Database Setup Script for Supabase
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'buyer', 'seller', 'agent');
CREATE TYPE report_status AS ENUM ('draft', 'in_progress', 'completed', 'paid');
CREATE TYPE room_type AS ENUM ('Standard', 'Kitchen', 'Bathroom', 'Patio', 'Outbuilding', 'Exterior');
CREATE TYPE condition_state AS ENUM ('Good', 'Fair', 'Poor', 'Urgent Repair', 'N/A');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'tenant',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address JSONB NOT NULL,
  gps_coordinates JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'draft',
  pdf_url TEXT,
  payment_reference TEXT,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type room_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspection items table
CREATE TABLE IF NOT EXISTS inspection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  condition condition_state NOT NULL,
  notes TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_property_id ON reports(property_id);
CREATE INDEX idx_rooms_report_id ON rooms(report_id);
CREATE INDEX idx_inspection_items_room_id ON inspection_items(room_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for properties table
CREATE POLICY "Users can view own properties" ON properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties" ON properties
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reports table
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON reports
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for rooms table
CREATE POLICY "Users can view rooms in own reports" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms in own reports" ON rooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rooms in own reports" ON rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rooms in own reports" ON rooms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

-- RLS Policies for inspection_items table
CREATE POLICY "Users can view items in own reports" ON inspection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items in own reports" ON inspection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own reports" ON inspection_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in own reports" ON inspection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'tenant');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_items_updated_at BEFORE UPDATE ON inspection_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();