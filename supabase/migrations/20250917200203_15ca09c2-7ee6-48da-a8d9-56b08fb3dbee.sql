-- Fix duplicate user preferences issue
-- First, let's see what duplicates exist and clean them up

-- Remove duplicate user preferences, keeping only the most recent one for each user
DELETE FROM public.user_preferences 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM public.user_preferences 
  ORDER BY user_id, created_at DESC
);