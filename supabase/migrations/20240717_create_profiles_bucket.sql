
-- Create a profiles bucket for storing profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'Profile Photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up public access policy for the profiles bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- Set up authenticated users can upload policy
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- Set up users can update their own objects policy
CREATE POLICY "Users can update their own objects"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profiles' AND auth.uid() = owner);

-- Set up users can delete their own objects policy
CREATE POLICY "Users can delete their own objects"
ON storage.objects FOR DELETE
USING (bucket_id = 'profiles' AND auth.uid() = owner);
