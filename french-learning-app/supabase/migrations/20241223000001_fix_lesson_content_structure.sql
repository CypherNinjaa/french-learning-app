-- Fix lesson content structure to match the expected format
-- This migration updates existing lesson content to use the new sections-based structure

-- First, let's check if we have any lessons with the old format
-- and update them to the new sections-based format

-- Update lesson content to use sections array format
UPDATE lessons 
SET content = jsonb_build_object(
    'sections', 
    CASE 
        -- If content already has sections, keep it as is
        WHEN content ? 'sections' THEN content->'sections'
        -- If content has 'content' key, wrap it in sections
        WHEN content ? 'content' THEN jsonb_build_array(
            jsonb_build_object(
                'type', 'text',
                'content', content->'content'
            )
        )
        -- If content has direct text/html, wrap it in sections
        WHEN content ? 'text' OR content ? 'html' THEN jsonb_build_array(
            jsonb_build_object(
                'type', 'text',
                'content', jsonb_build_object(
                    'text', COALESCE(content->>'text', content->>'html', 'No content available')
                )
            )
        )
        -- If content has exercises, create sections for them
        WHEN content ? 'exercises' THEN (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'type', 'exercise',
                    'content', exercise
                )
            )
            FROM jsonb_array_elements(content->'exercises') AS exercise
        )
        -- Default case: create a simple text section
        ELSE jsonb_build_array(
            jsonb_build_object(
                'type', 'text',
                'content', jsonb_build_object(
                    'text', 'Content needs to be updated'
                )
            )
        )
    END
)
WHERE content IS NOT NULL 
AND (
    -- Only update lessons that don't already have the correct structure
    NOT (content ? 'sections') 
    OR jsonb_typeof(content->'sections') != 'array'
);

-- Ensure all lessons have at least one section
UPDATE lessons 
SET content = jsonb_build_object(
    'sections', 
    jsonb_build_array(
        jsonb_build_object(
            'type', 'text',
            'content', jsonb_build_object('text', 'Welcome to this lesson!')
        )
    )
)
WHERE content IS NULL 
OR NOT (content ? 'sections')
OR jsonb_array_length(content->'sections') = 0;

-- Verify the update worked
SELECT 
    id, 
    title, 
    jsonb_pretty(content) as formatted_content
FROM lessons 
WHERE id IN (
    SELECT id FROM lessons LIMIT 3
);
