// Supabase Edge Function for Content Retrieval - Stage 3.3
// Optimized content fetching with caching and performance improvements

// @ts-ignore - Deno runtime import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno runtime import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Deno global declaration for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentRequest {
  type: 'lessons' | 'vocabulary' | 'grammar' | 'questions' | 'mixed' | 'versions';
  filters?: {
    level_id?: number;
    module_id?: number;
    lesson_id?: number;
    difficulty_level?: string;
    limit?: number;
    offset?: number;
    content_type?: string;
    content_id?: number;
    since_version?: string;
  };
  include_related?: boolean;
  cache_duration?: number;
  version_check?: boolean;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { type, filters = {}, include_related = false, cache_duration = 300 }: ContentRequest = await req.json()

    let result;
    
    switch (type) {
      case 'lessons':
        result = await fetchLessons(supabase, filters, include_related);
        break;
      case 'vocabulary':
        result = await fetchVocabulary(supabase, filters);
        break;
      case 'grammar':
        result = await fetchGrammar(supabase, filters);
        break;
      case 'questions':
        result = await fetchQuestions(supabase, filters);
        break;
      case 'mixed':
        result = await fetchMixedContent(supabase, filters);
        break;
      case 'versions':
        result = await fetchContentVersions(supabase, filters);
        break;
      default:
        throw new Error('Invalid content type');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        cached_at: new Date().toISOString(),
        cache_duration: cache_duration, // 5 minutes default
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${cache_duration}`,
        },
      }
    )  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})

async function fetchLessons(supabase: any, filters: any, include_related: boolean) {
  let query = supabase
    .from('lessons')
    .select(include_related ? `
      *,
      module:modules(
        *,
        level:levels(*)
      ),
      vocabulary_count:lesson_vocabulary(count),
      grammar_count:lesson_grammar(count),
      questions_count:questions(count)
    ` : '*')
    .eq('is_active', true)
    .order('order_index');

  // Apply filters
  if (filters.module_id) query = query.eq('module_id', filters.module_id);
  if (filters.difficulty_level) query = query.eq('difficulty_level', filters.difficulty_level);
  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

  const { data, error } = await query;
  if (error) throw error;

  return data;
}

async function fetchVocabulary(supabase: any, filters: any) {
  let query = supabase
    .from('vocabulary')
    .select('*')
    .eq('is_active', true)
    .order('french_word');

  if (filters.difficulty_level) query = query.eq('difficulty_level', filters.difficulty_level);
  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);

  const { data, error } = await query;
  if (error) throw error;

  return data;
}

async function fetchGrammar(supabase: any, filters: any) {
  let query = supabase
    .from('grammar_rules')
    .select('*')
    .eq('is_active', true)
    .order('title');

  if (filters.difficulty_level) query = query.eq('difficulty_level', filters.difficulty_level);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;

  return data;
}

async function fetchQuestions(supabase: any, filters: any) {
  let query = supabase
    .from('questions')
    .select(`
      *,
      lesson:lessons(
        title,
        module:modules(
          title,
          level:levels(name)
        )
      )
    `)
    .eq('is_active', true)
    .order('order_index');

  if (filters.lesson_id) query = query.eq('lesson_id', filters.lesson_id);
  if (filters.difficulty_level) query = query.eq('difficulty_level', filters.difficulty_level);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;

  return data;
}

async function fetchMixedContent(supabase: any, filters: any) {
  // Fetch optimized mixed content for learning sessions
  const [lessons, vocabulary, grammar] = await Promise.all([
    fetchLessons(supabase, { ...filters, limit: 5 }, true),
    fetchVocabulary(supabase, { ...filters, limit: 20 }),
    fetchGrammar(supabase, { ...filters, limit: 10 })
  ]);

  return {
    lessons,
    vocabulary,
    grammar,
    total_items: lessons.length + vocabulary.length + grammar.length
  };
}

async function fetchContentVersions(supabase: any, filters: any) {
  let query = supabase
    .from('content_versions')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.content_type) query = query.eq('content_type', filters.content_type);
  if (filters.content_id) query = query.eq('content_id', filters.content_id);
  if (filters.since_version) query = query.gt('version', filters.since_version);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;

  return data;
}
