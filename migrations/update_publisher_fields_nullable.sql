-- Migration: Update Publisher fields to be nullable (except email)
-- Only email is required, isActive defaults to true, other fields are optional

-- Make publisherName nullable
ALTER TABLE publishers ALTER COLUMN "publisherName" DROP NOT NULL;

-- Make address nullable
ALTER TABLE publishers ALTER COLUMN "address" DROP NOT NULL;

-- Make phone nullable
ALTER TABLE publishers ALTER COLUMN "phone" DROP NOT NULL;

-- Keep email as NOT NULL (required field)
-- ALTER TABLE publishers ALTER COLUMN "email" SET NOT NULL; -- Already NOT NULL

-- Keep isActive with default true (already has default)
-- ALTER TABLE publishers ALTER COLUMN "isActive" SET DEFAULT true; -- Already has default

-- Other fields (website, description, establishedDate, country) are already nullable