-- Debug script for survey analytics issues
-- Run these queries in your Supabase SQL editor to diagnose the problem

-- 1. Check if surveys table exists and has data
SELECT 
    COUNT(*) as total_surveys,
    MIN(timestamp) as earliest_survey,
    MAX(timestamp) as latest_survey
FROM public.surveys;

-- 2. Check the structure of survey data
SELECT 
    id,
    student_email,
    most_needed_subjects,
    study_frequency,
    preferred_resources,
    additional_comments,
    timestamp
FROM public.surveys
ORDER BY timestamp DESC
LIMIT 10;

-- 3. Check for any data type issues
SELECT 
    id,
    pg_typeof(most_needed_subjects) as subjects_type,
    pg_typeof(preferred_resources) as resources_type,
    pg_typeof(study_frequency) as frequency_type,
    most_needed_subjects,
    preferred_resources,
    study_frequency
FROM public.surveys
LIMIT 5;

-- 4. Analyze the subjects data
SELECT 
    unnest(most_needed_subjects) as subject,
    COUNT(*) as count
FROM public.surveys
WHERE most_needed_subjects IS NOT NULL
GROUP BY unnest(most_needed_subjects)
ORDER BY count DESC;

-- 5. Analyze study frequency
SELECT 
    study_frequency,
    COUNT(*) as count
FROM public.surveys
WHERE study_frequency IS NOT NULL
GROUP BY study_frequency
ORDER BY count DESC;

-- 6. Analyze preferred resources
SELECT 
    unnest(preferred_resources) as resource,
    COUNT(*) as count
FROM public.surveys
WHERE preferred_resources IS NOT NULL
GROUP BY unnest(preferred_resources)
ORDER BY count DESC;

-- 7. Check Row Level Security policies
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'surveys';

-- 8. Check RLS policies on surveys table
SELECT 
    pol.polname as policy_name,
    pol.polcmd as command,
    pol.polroles as roles,
    pol.polqual as using_expression,
    pol.polwithcheck as with_check_expression
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
JOIN pg_namespace pn ON pc.relnamespace = pn.oid
WHERE pc.relname = 'surveys' AND pn.nspname = 'public';

-- 9. Test data access as authenticated user
-- (This would need to be run in the context of an authenticated user)

-- 10. Insert a test survey if no data exists
-- Uncomment and modify the following if you need to create test data:

/*
INSERT INTO public.surveys (
    user_id,
    student_email,
    most_needed_subjects,
    study_frequency,
    preferred_resources,
    additional_comments
) VALUES (
    (SELECT id FROM auth.users LIMIT 1), -- Use an existing user ID
    'test@student.edu',
    ARRAY['Mathematics', 'Life Sciences', 'Physical Sciences'],
    'weekly',
    ARRAY['Previous exam question papers', 'Study guides', 'Online tutorials'],
    'This is a test survey for debugging analytics.'
);
*/

-- 11. Check for recent submissions
SELECT 
    DATE(timestamp) as submission_date,
    COUNT(*) as submissions_count
FROM public.surveys
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY submission_date DESC;

-- 12. Verify auth.users table has data (surveys need valid user_id)
SELECT COUNT(*) as total_users FROM auth.users;