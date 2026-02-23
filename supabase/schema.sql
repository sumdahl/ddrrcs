-- Digital Disaster Relief Request & Coordination System
-- Database Schema for Nepal

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Relief requests table
CREATE TABLE relief_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  disaster_type text NOT NULL CHECK (disaster_type IN ('flood', 'earthquake', 'landslide', 'fire')),
  ward_number integer NOT NULL CHECK (ward_number BETWEEN 1 AND 33),
  location_details text NOT NULL,
  damage_description text NOT NULL,
  relief_type text NOT NULL CHECK (relief_type IN ('food', 'medical', 'shelter', 'evacuation')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'assigned', 'resolved')),
  assigned_team text,
  admin_remark text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE relief_requests ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Relief Requests RLS Policies
CREATE POLICY "Citizens can view own requests" ON relief_requests FOR SELECT USING (auth.uid() = citizen_id);
CREATE POLICY "Citizens can insert own requests" ON relief_requests FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Admins can view all requests" ON relief_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all requests" ON relief_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes for performance
CREATE INDEX idx_relief_requests_status ON relief_requests(status);
CREATE INDEX idx_relief_requests_priority ON relief_requests(priority);
CREATE INDEX idx_relief_requests_disaster_type ON relief_requests(disaster_type);
CREATE INDEX idx_relief_requests_citizen_id ON relief_requests(citizen_id);
CREATE INDEX idx_relief_requests_created_at ON relief_requests(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_relief_requests_updated_at
  BEFORE UPDATE ON relief_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 'citizen');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Admin seed (uncomment and replace UUID after first user signup)
-- INSERT INTO profiles (id, full_name, role) VALUES ('<user-uuid-from-auth>', 'System Admin', 'admin');
