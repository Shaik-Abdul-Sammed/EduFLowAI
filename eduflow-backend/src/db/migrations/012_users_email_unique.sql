-- Check for duplicates first, keep oldest
DELETE FROM users a USING users b
WHERE a.id > b.id AND a.email = b.email;

-- Add unique constraint if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;
END $$;
