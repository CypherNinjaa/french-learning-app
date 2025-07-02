-- Secure function for admin dashboard stats with proper permission checks
-- This function replaces direct access to the admin_dashboard_stats view

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    total_users bigint,
    total_admins bigint,
    new_users_this_week bigint,
    active_users_today bigint,
    sessions_today bigint
) AS $$
BEGIN
    -- Check if the current user has admin permissions
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND user_role IN ('admin', 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- Return the dashboard statistics
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM profiles WHERE user_role = 'user')::bigint,
        (SELECT COUNT(*) FROM profiles WHERE user_role IN ('admin', 'super_admin'))::bigint,
        (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days')::bigint,
        (SELECT COUNT(*) FROM profiles WHERE last_login_at > NOW() - INTERVAL '24 hours')::bigint,
        -- Handle case where user_sessions table might not exist
        (SELECT COALESCE(
            (SELECT COUNT(*) FROM user_sessions WHERE started_at > NOW() - INTERVAL '24 hours'),
            0
        ))::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (admin check is inside function)
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
