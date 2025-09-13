-- Migration: Update Reader fields to be nullable
-- Date: 2025-09-12
-- Description: Make cardNumber, cardIssueDate, and cardExpiryDate nullable in readers table

-- Update cardNumber column to be nullable
ALTER TABLE readers ALTER COLUMN "cardNumber" DROP NOT NULL;

-- Update cardIssueDate column to be nullable
ALTER TABLE readers ALTER COLUMN "cardIssueDate" DROP NOT NULL;

-- Update cardExpiryDate column to be nullable
ALTER TABLE readers ALTER COLUMN "cardExpiryDate" DROP NOT NULL;

-- Note: dob, gender, address, phone were already nullable in the previous schema