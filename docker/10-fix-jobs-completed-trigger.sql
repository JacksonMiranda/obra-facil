-- Migration: fix jobs_completed trigger to count completed works, not reviews
-- Previously the trigger set jobs_completed = COUNT(*) FROM reviews,
-- which caused the denormalized column to track review count instead of completed works.

CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE professionals
  SET
    rating_avg     = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE professional_id = NEW.professional_id
    ),
    jobs_completed = (
      SELECT COUNT(*)
      FROM works
      WHERE professional_id = NEW.professional_id
        AND status = 'completed'
    ),
    updated_at     = now()
  WHERE id = NEW.professional_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
