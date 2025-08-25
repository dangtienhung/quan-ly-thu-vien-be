-- Migration: Add physical_copy_id column to reservations table
-- Date: 2024-12-19
-- Description: Add optional physical_copy_id column to link reservations to specific physical copies

-- Add the physical_copy_id column
ALTER TABLE reservations ADD COLUMN physical_copy_id UUID NULL;

-- Add foreign key constraint
ALTER TABLE reservations
ADD CONSTRAINT fk_reservations_physical_copy FOREIGN KEY (physical_copy_id) REFERENCES physical_copies (id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_reservations_physical_copy_id ON reservations (physical_copy_id);

-- Add comment to the column
COMMENT ON COLUMN reservations.physical_copy_id IS 'ID của bản sao vật lý (optional) - liên kết đến bảng physical_copies';