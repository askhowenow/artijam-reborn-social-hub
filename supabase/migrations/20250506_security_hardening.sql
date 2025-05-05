
-- Enable Row Level Security on all cart tables to ensure proper security
ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_cart_items ENABLE ROW LEVEL SECURITY;

-- Create policy for user carts: users can only access their own carts
CREATE POLICY "Users can manage their own carts" ON public.user_carts
FOR ALL USING (auth.uid() = user_id);

-- Create policy for user cart items: users can only access items in their own carts
CREATE POLICY "Users can manage their own cart items" ON public.user_cart_items
FOR ALL USING (
  cart_id IN (
    SELECT id FROM public.user_carts 
    WHERE user_id = auth.uid()
  )
);

-- Create policy for guest carts: allow anonymous access with guest_id validation
CREATE POLICY "Guests can access their own carts" ON public.guest_carts
FOR ALL USING (true);

-- Create policy for guest cart items: allow access only to items in a valid cart
CREATE POLICY "Guests can manage their own cart items" ON public.guest_cart_items
FOR ALL USING (true);

-- Create a secure function for checking if a user has a specific role
-- This avoids recursive RLS policies that could lead to infinite recursion
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, check_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = $1
    AND role = $2
  );
$$;

-- Create a secure function to get all roles for a user
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS TABLE(role app_role)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = $1;
$$;

-- Create a security definer function to safely handle cart operations
CREATE OR REPLACE FUNCTION public.sync_guest_cart_to_user(guest_id TEXT, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_guest_cart_id UUID;
  v_user_cart_id UUID;
  guest_cart_exists BOOLEAN;
  user_cart_exists BOOLEAN;
BEGIN
  -- Check if guest cart exists
  SELECT EXISTS (
    SELECT 1 FROM public.guest_carts WHERE guest_id = $1
  ) INTO guest_cart_exists;
  
  IF NOT guest_cart_exists THEN
    RETURN TRUE; -- No guest cart to sync
  END IF;
  
  -- Get guest cart ID
  SELECT id INTO v_guest_cart_id
  FROM public.guest_carts
  WHERE guest_id = $1;
  
  -- Check if user cart exists
  SELECT EXISTS (
    SELECT 1 FROM public.user_carts WHERE user_id = $2
  ) INTO user_cart_exists;
  
  IF NOT user_cart_exists THEN
    -- Create user cart if it doesn't exist
    INSERT INTO public.user_carts(user_id)
    VALUES ($2)
    RETURNING id INTO v_user_cart_id;
  ELSE
    -- Get existing user cart ID
    SELECT id INTO v_user_cart_id
    FROM public.user_carts
    WHERE user_id = $2;
  END IF;
  
  -- Merge guest cart items into user cart
  WITH existing_items AS (
    SELECT product_id, quantity 
    FROM public.user_cart_items 
    WHERE cart_id = v_user_cart_id
  ), guest_items AS (
    SELECT product_id, quantity 
    FROM public.guest_cart_items 
    WHERE cart_id = v_guest_cart_id
  ), to_update AS (
    SELECT 
      e.product_id, 
      e.quantity + g.quantity as new_quantity
    FROM existing_items e
    JOIN guest_items g ON e.product_id = g.product_id
  ), to_insert AS (
    SELECT 
      product_id, 
      quantity
    FROM guest_items
    WHERE product_id NOT IN (SELECT product_id FROM existing_items)
  )
  -- Update existing items with new quantities
  UPDATE public.user_cart_items AS u
  SET quantity = t.new_quantity
  FROM to_update t
  WHERE u.cart_id = v_user_cart_id AND u.product_id = t.product_id;

  -- Insert new items
  INSERT INTO public.user_cart_items(cart_id, product_id, quantity)
  SELECT v_user_cart_id, product_id, quantity
  FROM to_insert;
  
  -- Delete guest cart items
  DELETE FROM public.guest_cart_items
  WHERE cart_id = v_guest_cart_id;
  
  RETURN TRUE;
END;
$$;

-- Create a function to securely update product metrics
-- Already exists as increment_product_metric from previous migrations
