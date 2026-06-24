-- SQL Schema Script for BWM Realtime Dashboard
-- This script creates the necessary database tables, storage buckets,
-- configures Row Level Security (RLS) policies for public access,
-- seeds initial stats for the dashboard, sets up trigger functions
-- to sync members/donations with site_stats, and enables real-time replication.

-- =========================================================================
-- 1. CLEANUP (Drop existing tables/policies/triggers for clean setup)
-- =========================================================================

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS on_member_inserted ON public.members;
DROP TRIGGER IF EXISTS on_donation_inserted ON public.donations;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS public.handle_member_inserted();
DROP FUNCTION IF EXISTS public.handle_donation_inserted();

-- Drop policies on public tables if they exist
DROP POLICY IF EXISTS "Public Access" ON public.site_stats;
DROP POLICY IF EXISTS "Public Access" ON public.campaigns;
DROP POLICY IF EXISTS "Public Access" ON public.volunteer_events;
DROP POLICY IF EXISTS "Public Access" ON public.library_items;
DROP POLICY IF EXISTS "Public Access" ON public.members;
DROP POLICY IF EXISTS "Public Access" ON public.donations;

-- Drop public tables
DROP TABLE IF EXISTS public.site_stats CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.volunteer_events CASCADE;
DROP TABLE IF EXISTS public.library_items CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;


-- =========================================================================
-- 2. CREATE TABLES
-- =========================================================================

-- A. Table: site_stats (Stores finance goals/currents and membership counts)
CREATE TABLE public.site_stats (
    id bigint PRIMARY KEY,
    financial_current bigint NOT NULL DEFAULT 0,
    financial_target bigint NOT NULL DEFAULT 0,
    membership_count integer NOT NULL DEFAULT 0
);

-- B. Table: campaigns (Stores active campaigns & events)
CREATE TABLE public.campaigns (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    name text NOT NULL,
    targetgoal integer NOT NULL DEFAULT 0,
    image text,
    status text NOT NULL DEFAULT 'Active',
    slotsfilled integer NOT NULL DEFAULT 0
);

-- C. Table: volunteer_events (Stores volunteer impact logs)
CREATE TABLE public.volunteer_events (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    group_name text NOT NULL,
    impact text,
    date date NOT NULL,
    description text,
    images text[] NOT NULL DEFAULT '{}'
);

-- D. Table: library_items (Stores library acquisitions archive)
CREATE TABLE public.library_items (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    donor text NOT NULL,
    category text NOT NULL,
    date date NOT NULL,
    description text,
    images text[] NOT NULL DEFAULT '{}'
);

-- E. Table: members (Stores membership registrations)
CREATE TABLE public.members (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    tier text NOT NULL DEFAULT 'Individual'
);

-- F. Table: donations (Stores donation transactions)
CREATE TABLE public.donations (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    amount numeric(12,2) NOT NULL DEFAULT 0.00,
    name text NOT NULL,
    email text NOT NULL,
    message text,
    payment_method text NOT NULL DEFAULT 'card'
);


-- =========================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =========================================================================

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- 4. CREATE RLS POLICIES (Allowing public read and write access)
-- =========================================================================

CREATE POLICY "Public Access" ON public.site_stats 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Access" ON public.campaigns 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Access" ON public.volunteer_events 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Access" ON public.library_items 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Access" ON public.members 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Access" ON public.donations 
    FOR ALL USING (true) WITH CHECK (true);


-- =========================================================================
-- 5. FUNCTIONS & TRIGGERS
-- =========================================================================

-- Trigger Function for incrementing membership_count
CREATE OR REPLACE FUNCTION public.handle_member_inserted()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.site_stats
    SET membership_count = membership_count + 1
    WHERE id = 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on members table
CREATE TRIGGER on_member_inserted
    AFTER INSERT ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_member_inserted();


-- Trigger Function for increasing financial_current
CREATE OR REPLACE FUNCTION public.handle_donation_inserted()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.site_stats
    SET financial_current = financial_current + NEW.amount
    WHERE id = 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on donations table
CREATE TRIGGER on_donation_inserted
    AFTER INSERT ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_donation_inserted();


-- =========================================================================
-- 6. INITIAL SEED DATA
-- =========================================================================

-- Pre-seed site_stats with ID 1 so frontend queries like `.eq('id', 1).single()` do not fail
INSERT INTO public.site_stats (id, financial_current, financial_target, membership_count)
VALUES (1, 0, 10000, 0)
ON CONFLICT (id) DO NOTHING;


-- =========================================================================
-- 7. ENABLE REAL-TIME REPLICATION
-- =========================================================================

-- First, ensure the supabase_realtime publication exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Enable replica identity full for the tables to receive complete update payloads
ALTER TABLE public.site_stats REPLICA IDENTITY FULL;
ALTER TABLE public.campaigns REPLICA IDENTITY FULL;
ALTER TABLE public.volunteer_events REPLICA IDENTITY FULL;
ALTER TABLE public.library_items REPLICA IDENTITY FULL;
ALTER TABLE public.members REPLICA IDENTITY FULL;
ALTER TABLE public.donations REPLICA IDENTITY FULL;

-- Add tables to publication if they are not already added
DO $$
DECLARE
    t text;
    tables_to_add text[] := ARRAY['site_stats', 'campaigns', 'volunteer_events', 'library_items', 'members', 'donations'];
BEGIN
    FOREACH t IN ARRAY tables_to_add LOOP
        -- Remove if already in publication to avoid duplicate insertion error
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore if table wasn't in publication
        END;
        -- Add table to publication
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END LOOP;
END $$;


-- =========================================================================
-- 8. STORAGE BUCKETS CONFIGURATION
-- =========================================================================

-- Insert the storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('campaign-images', 'campaign-images', true),
  ('volunteer-images', 'volunteer-images', true),
  ('library-images', 'library-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist to prevent name collisions
DROP POLICY IF EXISTS "Public Read and Write for campaign-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read and Write for volunteer-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read and Write for library-images" ON storage.objects;

-- Enable public read/write access policies for each storage bucket
CREATE POLICY "Public Read and Write for campaign-images" ON storage.objects
    FOR ALL USING (bucket_id = 'campaign-images') WITH CHECK (bucket_id = 'campaign-images');

CREATE POLICY "Public Read and Write for volunteer-images" ON storage.objects
    FOR ALL USING (bucket_id = 'volunteer-images') WITH CHECK (bucket_id = 'volunteer-images');

CREATE POLICY "Public Read and Write for library-images" ON storage.objects
    FOR ALL USING (bucket_id = 'library-images') WITH CHECK (bucket_id = 'library-images');
