-- Ensure teddy bucket serves public URLs used by scheduled social posts.
UPDATE storage.buckets
SET public = true
WHERE id = 'teddy';
