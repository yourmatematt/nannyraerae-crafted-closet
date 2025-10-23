-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a scheduled job to clean up expired reservations every 5 minutes
-- This will call the Supabase Edge Function via HTTP request
SELECT cron.schedule(
  'cleanup-expired-reservations',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url := current_setting('app.edge_function_url') || '/cleanup-reservations',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Create a function to manually trigger cleanup (for testing)
CREATE OR REPLACE FUNCTION manual_cleanup_reservations()
RETURNS TABLE(request_id bigint)
LANGUAGE sql
SECURITY definer
AS $$
  SELECT
    net.http_post(
      url := current_setting('app.edge_function_url') || '/cleanup-reservations',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
$$;

-- Grant execute permission on the manual cleanup function
GRANT EXECUTE ON FUNCTION manual_cleanup_reservations() TO authenticated;

-- Comment with instructions
COMMENT ON FUNCTION manual_cleanup_reservations() IS 'Manually trigger reservation cleanup. Usage: SELECT manual_cleanup_reservations();';