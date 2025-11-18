-- CYAss Database Schema Setup
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('tenant', 'landlord', 'buyer', 'seller', 'agent')),
  full_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  
  -- South African Address Format
  street_number TEXT,
  street_name TEXT NOT NULL,
  suburb TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL CHECK (province IN (
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  )),
  postal_code TEXT NOT NULL CHECK (postal_code ~ '^\d{4}$'),
  
  -- GPS Coordinates (mandatory)
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  gps_accuracy DOUBLE PRECISION,
  gps_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- User role for this property
  user_role TEXT NOT NULL CHECK (user_role IN ('tenant', 'landlord', 'buyer', 'seller', 'agent')),
  
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  property_id UUID REFERENCES properties(id) NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'paid')) DEFAULT 'draft',
  pdf_url TEXT,
  payment_reference TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table
CREATE TABLE rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Standard', 'Bathroom', 'Kitchen', 'Patio', 'Outbuilding', 'Exterior')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection items table
CREATE TABLE inspection_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('Good', 'Fair', 'Poor', 'Urgent Repair', 'N/A')),
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties policies
CREATE POLICY "Users can view own properties" ON properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Rooms policies (access through report ownership)
CREATE POLICY "Users can view rooms of own reports" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage rooms of own reports" ON rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

-- Inspection items policies (access through room/report ownership)
CREATE POLICY "Users can view inspection items of own reports" ON inspection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage inspection items of own reports" ON inspection_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

-- Storage bucket for photos and PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-photos', 'property-photos', false);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-pdfs', 'report-pdfs', false);

-- Storage policies
CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'property-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own PDFs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'report-pdfs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own PDFs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'report-pdfs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();