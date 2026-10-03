-- Add is_active column to officers table for soft delete functionality
ALTER TABLE officers
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
