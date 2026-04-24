-- Migration 06: Add rejection_reason to visits
ALTER TABLE visits ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
