// Stage 3.3: Content API Layer
// Enhanced content retrieval with caching, versioning, and performance optimization

import { supabase } from './supabase';
import {
	Level,
	Module,
	Lesson,
	Vocabulary,
	GrammarRule,
	Question,
	ApiResponse,
	DifficultyLevel,
	LessonType,
	ContentFilters,
} from '../types';

// Cache interface for content caching
interface CacheEntry<T> {
	data: T;
	timestamp: number;
	version: string;
	expiresAt: number;
}

// Content versioning interface
interface ContentVersion {
	id: string;
	content_type: string;
	content_id: number;
	version: string;
	changes: any;
	created_at: string;
}

// Advanced filtering options
interface AdvancedContentFilters extends ContentFilters {
	includeInactive?: boolean;
	sortBy?: 'created_at' | 'updated_at' | 'title' | 'order_index' | 'difficulty_level';
	sortOrder?: 'asc' | 'desc';
	limit?: number;
	offset?: number;
	searchTerm?: string;
	lastModified?: string; // ISO date string for incremental sync
	difficulty?: DifficultyLevel; // Add difficulty filter
}

// Learning path interface
interface LearningPath {
	id: number;
	user_level: DifficultyLevel;
	recommended_lessons: Lesson[];
	next_lesson?: Lesson;
	completion_percentage: number;
	estimated_time_remaining: number;
}

export class ContentApiService {
	private static cache = new Map<string, CacheEntry<any>>();
	private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
	private static readonly MAX_CACHE_SIZE = 100;

	// ============ CACHING UTILITIES ============
	
	private static getCacheKey(type: string, params?: any): string {
		return `${type}_${JSON.stringify(params || {})}`;
	}
	private static setCache<T>(key: string, data: T, version: string = '1.0'): void {
		// Implement LRU cache behavior
		if (this.cache.size >= this.MAX_CACHE_SIZE) {
			const firstKey = this.cache.keys().next().value;
			if (firstKey) {
				this.cache.delete(firstKey);
			}
		}

		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			version,
			expiresAt: Date.now() + this.CACHE_DURATION,
		});
	}

	private static getCache<T>(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry || Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			return null;
		}
		return entry.data;
	}

	private static clearCache(pattern?: string): void {
		if (!pattern) {
			this.cache.clear();
			return;
		}

		for (const key of this.cache.keys()) {
			if (key.includes(pattern)) {
				this.cache.delete(key);
			}
		}
	}

	// ============ CONTENT VERSIONING ============

	static async getContentVersion(contentType: string, contentId: number): Promise<string> {
		try {
			const { data, error } = await supabase
				.from('content_versions')
				.select('version')
				.eq('content_type', contentType)
				.eq('content_id', contentId)
				.order('created_at', { ascending: false })
				.limit(1)
				.single();

			if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
			
			return data?.version || '1.0';
		} catch (error) {
			console.warn('Failed to get content version:', error);
			return '1.0';
		}
	}

	static async createContentVersion(
		contentType: string, 
		contentId: number, 
		changes: any
	): Promise<void> {
		try {
			const currentVersion = await this.getContentVersion(contentType, contentId);
			const newVersion = await this.incrementVersion(currentVersion);

			await supabase
				.from('content_versions')
				.insert([{
					content_type: contentType,
					content_id: contentId,
					version: newVersion,
					changes,
				}]);

			// Clear related cache entries
			this.clearCache(contentType);
		} catch (error) {
			console.error('Failed to create content version:', error);
		}
	}

	private static async incrementVersion(version: string): Promise<string> {
		const parts = version.split('.');
		const minor = parseInt(parts[1] || '0') + 1;
		return `${parts[0]}.${minor}`;
	}

	// ============ ENHANCED CONTENT RETRIEVAL ============

	static async getLevelsWithModules(filters?: AdvancedContentFilters): Promise<ApiResponse<Level[]>> {
		const cacheKey = this.getCacheKey('levels_with_modules', filters);
		const cached = this.getCache<Level[]>(cacheKey);

		if (cached) {
			return { data: cached, error: null, success: true };
		}

		try {
			let query = supabase
				.from('levels')
				.select(`
					*,
					modules:modules(
						id,
						title,
						description,
						order_index,
						estimated_duration_minutes,
						difficulty_level,
						is_active,
						lesson_count:lessons(count)
					)
				`);

			// Apply filters
			if (!filters?.includeInactive) {
				query = query.eq('is_active', true);
			}

			if (filters?.difficulty) {
				query = query.eq('difficulty_level', filters.difficulty);
			}

			// Apply sorting
			const sortBy = filters?.sortBy || 'order_index';
			const sortOrder = filters?.sortOrder || 'asc';
			query = query.order(sortBy, { ascending: sortOrder === 'asc' });

			// Apply pagination
			if (filters?.limit) {
				query = query.limit(filters.limit);
			}
			if (filters?.offset) {
				query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
			}

			const { data, error } = await query;

			if (error) throw error;

			const result = data || [];
			this.setCache(cacheKey, result);

			return {
				data: result,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching levels with modules:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch levels',
				success: false,
			};
		}
	}

	static async getModuleWithLessons(
		moduleId: number, 
		filters?: AdvancedContentFilters
	): Promise<ApiResponse<Module & { lessons: Lesson[] }>> {
		const cacheKey = this.getCacheKey('module_with_lessons', { moduleId, ...filters });
		const cached = this.getCache<Module & { lessons: Lesson[] }>(cacheKey);

		if (cached) {
			return { data: cached, error: null, success: true };
		}

		try {
			let query = supabase
				.from('modules')
				.select(`
					*,
					level:levels(*),
					lessons:lessons(
						id,
						title,
						description,
						lesson_type,
						order_index,
						estimated_time_minutes,
						difficulty_level,
						is_active,
						created_at,
						updated_at
					)
				`)
				.eq('id', moduleId);

			if (!filters?.includeInactive) {
				query = query.eq('lessons.is_active', true);
			}

			const { data, error } = await query.single();

			if (error) throw error;			// Sort lessons by order_index
			if (data?.lessons) {
				data.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
			}

			this.setCache(cacheKey, data);

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching module with lessons:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch module',
				success: false,
			};
		}
	}

	static async getLessonWithContent(
		lessonId: number, 
		includeRelated: boolean = true
	): Promise<ApiResponse<Lesson & { 
		vocabulary?: Vocabulary[], 
		grammar?: GrammarRule[], 
		questions?: Question[] 
	}>> {
		const cacheKey = this.getCacheKey('lesson_with_content', { lessonId, includeRelated });
		const cached = this.getCache<any>(cacheKey);

		if (cached) {
			return { data: cached, error: null, success: true };
		}

		try {
			// Get lesson basic info
			const { data: lesson, error: lessonError } = await supabase
				.from('lessons')
				.select(`
					*,
					module:modules(
						id,
						title,
						level:levels(id, name)
					)
				`)
				.eq('id', lessonId)
				.single();

			if (lessonError) throw lessonError;

			let result: any = lesson;

			if (includeRelated) {
				// Get related vocabulary
				const { data: vocabulary } = await supabase
					.from('lesson_vocabulary')
					.select(`
						vocabulary:vocabulary(*)
					`)
					.eq('lesson_id', lessonId);

				// Get related grammar rules
				const { data: grammar } = await supabase
					.from('lesson_grammar')
					.select(`
						grammar_rule:grammar_rules(*)
					`)
					.eq('lesson_id', lessonId);

				// Get lesson questions
				const { data: questions } = await supabase
					.from('questions')
					.select('*')
					.eq('lesson_id', lessonId)
					.eq('is_active', true)
					.order('order_index');

				result = {
					...lesson,
					vocabulary: vocabulary?.map(v => v.vocabulary) || [],
					grammar: grammar?.map(g => g.grammar_rule) || [],
					questions: questions || [],
				};
			}

			this.setCache(cacheKey, result);

			return {
				data: result,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching lesson with content:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch lesson',
				success: false,
			};
		}
	}

	// ============ SMART CONTENT RECOMMENDATIONS ============

	static async getPersonalizedLearningPath(
		userId: string, 
		targetLevel: DifficultyLevel
	): Promise<ApiResponse<LearningPath>> {
		try {
			// Get user's current progress
			const { data: userProgress } = await supabase
				.from('user_progress')
				.select(`
					lesson_id,
					completed_at,
					score,
					lesson:lessons(
						id,
						module_id,
						difficulty_level,
						lesson_type,
						estimated_time_minutes
					)
				`)
				.eq('user_id', userId);

			const completedLessonIds = userProgress
				?.filter(p => p.completed_at)
				.map(p => p.lesson_id) || [];

			// Get recommended lessons based on difficulty progression
			const { data: recommendedLessons, error } = await supabase
				.from('lessons')
				.select(`
					*,
					module:modules(
						id,
						title,
						level:levels(id, name)
					)
				`)
				.eq('difficulty_level', targetLevel)
				.eq('is_active', true)
				.not('id', 'in', `(${completedLessonIds.join(',') || '0'})`)
				.order('order_index')
				.limit(10);

			if (error) throw error;

			// Calculate completion percentage and time estimates
			const totalLessons = await this.getTotalLessonCount(targetLevel);
			const completionPercentage = (completedLessonIds.length / totalLessons) * 100;
			const estimatedTimeRemaining = (recommendedLessons || [])
				.reduce((total, lesson) => total + (lesson.estimated_time_minutes || 0), 0);

			const learningPath: LearningPath = {
				id: Date.now(), // Temporary ID
				user_level: targetLevel,
				recommended_lessons: recommendedLessons || [],
				next_lesson: recommendedLessons?.[0],
				completion_percentage: Math.round(completionPercentage),
				estimated_time_remaining: estimatedTimeRemaining,
			};

			return {
				data: learningPath,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error generating learning path:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to generate learning path',
				success: false,
			};
		}
	}

	private static async getTotalLessonCount(difficulty: DifficultyLevel): Promise<number> {
		const { count, error } = await supabase
			.from('lessons')
			.select('*', { count: 'exact', head: true })
			.eq('difficulty_level', difficulty)
			.eq('is_active', true);

		return count || 0;
	}

	// ============ CONTENT SEARCH & FILTERING ============

	static async searchContent(
		searchTerm: string, 
		contentTypes: string[] = ['lessons', 'vocabulary', 'grammar'],
		filters?: AdvancedContentFilters
	): Promise<ApiResponse<{
		lessons: Lesson[],
		vocabulary: Vocabulary[],
		grammar: GrammarRule[]
	}>> {
		const cacheKey = this.getCacheKey('search_content', { searchTerm, contentTypes, filters });
		const cached = this.getCache<any>(cacheKey);

		if (cached) {
			return { data: cached, error: null, success: true };
		}

		try {
			const results: any = {
				lessons: [],
				vocabulary: [],
				grammar: [],
			};

			// Search lessons
			if (contentTypes.includes('lessons')) {
				const { data: lessons } = await supabase
					.from('lessons')
					.select(`
						*,
						module:modules(
							id,
							title,
							level:levels(id, name)
						)
					`)
					.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
					.eq('is_active', true)
					.limit(filters?.limit || 20);

				results.lessons = lessons || [];
			}

			// Search vocabulary
			if (contentTypes.includes('vocabulary')) {
				const { data: vocabulary } = await supabase
					.from('vocabulary')
					.select('*')
					.or(`
						french_word.ilike.%${searchTerm}%,
						english_translation.ilike.%${searchTerm}%,
						example_sentence_fr.ilike.%${searchTerm}%,
						example_sentence_en.ilike.%${searchTerm}%
					`)
					.eq('is_active', true)
					.limit(filters?.limit || 20);

				results.vocabulary = vocabulary || [];
			}

			// Search grammar rules
			if (contentTypes.includes('grammar')) {
				const { data: grammar } = await supabase
					.from('grammar_rules')
					.select('*')
					.or(`title.ilike.%${searchTerm}%,explanation.ilike.%${searchTerm}%`)
					.eq('is_active', true)
					.limit(filters?.limit || 20);

				results.grammar = grammar || [];
			}

			this.setCache(cacheKey, results);

			return {
				data: results,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error searching content:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to search content',
				success: false,
			};
		}
	}

	// ============ BULK CONTENT OPERATIONS ============

	static async syncContentUpdates(lastSyncTimestamp?: string): Promise<ApiResponse<{
		levels: Level[],
		modules: Module[],
		lessons: Lesson[],
		vocabulary: Vocabulary[],
		grammar: GrammarRule[]
	}>> {
		try {
			const syncTime = lastSyncTimestamp || '1970-01-01T00:00:00Z';
			const results: any = {
				levels: [],
				modules: [],
				lessons: [],
				vocabulary: [],
				grammar: [],
			};

			// Get updated content since last sync
			const promises = [
				supabase.from('levels').select('*').gte('updated_at', syncTime),
				supabase.from('modules').select('*').gte('updated_at', syncTime),
				supabase.from('lessons').select('*').gte('updated_at', syncTime),
				supabase.from('vocabulary').select('*').gte('updated_at', syncTime),
				supabase.from('grammar_rules').select('*').gte('updated_at', syncTime),
			];

			const [levels, modules, lessons, vocabulary, grammar] = await Promise.all(promises);

			results.levels = levels.data || [];
			results.modules = modules.data || [];
			results.lessons = lessons.data || [];
			results.vocabulary = vocabulary.data || [];
			results.grammar = grammar.data || [];

			// Clear all cache after sync
			this.clearCache();

			return {
				data: results,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error syncing content updates:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to sync content',
				success: false,
			};
		}
	}

	// ============ PERFORMANCE MONITORING ============

	static getCacheStats(): {
		size: number,
		hitRate: number,
		entries: Array<{ key: string, version: string, age: number }>
	} {
		const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
			key,
			version: entry.version,
			age: Date.now() - entry.timestamp,
		}));

		return {
			size: this.cache.size,
			hitRate: 0, // Would need to track hits/misses for accurate calculation
			entries,
		};
	}

	static clearAllCache(): void {
		this.clearCache();
	}
}
