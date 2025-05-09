
-- Function to handle balance top-up transactions
CREATE OR REPLACE FUNCTION public.top_up_balance(
  p_user_id UUID,
  p_amount NUMERIC,
  p_currency TEXT DEFAULT 'USD',
  p_reference TEXT DEFAULT NULL,
  p_gateway TEXT DEFAULT NULL,
  p_gateway_reference TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM public.balances
  WHERE id = p_user_id;
  
  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;
  
  -- Update balance
  UPDATE public.balances
  SET 
    balance = v_new_balance,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.transactions (
    user_id, 
    amount, 
    currency, 
    type,
    status,
    reference_id,
    gateway,
    gateway_reference,
    metadata,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    p_currency,
    'top_up',
    'completed',
    p_reference,
    p_gateway,
    p_gateway_reference,
    p_metadata,
    'Account top-up'
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to process a payment from balance
CREATE OR REPLACE FUNCTION public.process_payment_from_balance(
  p_user_id UUID,
  p_amount NUMERIC,
  p_currency TEXT DEFAULT 'USD',
  p_reference TEXT DEFAULT NULL,
  p_description TEXT DEFAULT 'Payment'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM public.balances
  WHERE id = p_user_id;
  
  -- Check if balance is sufficient
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;
  
  -- Update balance
  UPDATE public.balances
  SET 
    balance = v_new_balance,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.transactions (
    user_id, 
    amount, 
    currency, 
    type,
    status,
    reference_id,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    p_currency,
    'payment',
    'completed',
    p_reference,
    p_description
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
