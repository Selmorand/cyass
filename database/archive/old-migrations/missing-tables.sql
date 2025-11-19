-- Create missing tables for CYAss

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
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
CREATE TABLE IF NOT EXISTS reports (
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
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Standard', 'Bathroom', 'Kitchen', 'Patio', 'Outbuilding', 'Exterior')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection items table
CREATE TABLE IF NOT EXISTS inspection_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('Good', 'Fair', 'Poor', 'Urgent Repair', 'N/A')),
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;

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