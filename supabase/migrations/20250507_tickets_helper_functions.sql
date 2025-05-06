
-- Function to decrement ticket tier quantity_available
CREATE OR REPLACE FUNCTION public.decrement_tier_quantity(tier_id UUID)
RETURNS VOID AS $$
DECLARE
  current_quantity INTEGER;
BEGIN
  -- Get current quantity
  SELECT quantity_available INTO current_quantity
  FROM public.ticket_tiers
  WHERE id = tier_id;
  
  -- Check if tickets are available
  IF current_quantity <= 0 THEN
    RAISE EXCEPTION 'No tickets available for this tier';
  END IF;
  
  -- Decrement quantity_available
  UPDATE public.ticket_tiers
  SET quantity_available = quantity_available - 1
  WHERE id = tier_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
