// Stage 3.1: Content Management Service
// Handles all content management operations for lessons, vocabulary, grammar, etc.

import { supabase } from './supabase';
import {
	Level,
	Module,
	Lesson,
	Vocabulary,
	GrammarRule,
	Question,
	ContentCategory,
	ContentTag,
	LessonVocabulary,
	LessonGrammar,
	CreateLevelDto,
	UpdateLevelDto,
	CreateModuleDto,
	UpdateModuleDto,
	CreateLessonDto,
	UpdateLessonDto,
	CreateVocabularyDto,
	UpdateVocabularyDto,
	CreateGrammarRuleDto,
	UpdateGrammarRuleDto,
	CreateQuestionDto,
	UpdateQuestionDto,
	ContentFilters,
	ApiResponse,
	DifficultyLevel,
	LessonType,
} from '../types';

export class ContentManagementService {
	// ============ LEVELS ============
	static async getLevels(): Promise<ApiResponse<Level[]>> {
		try {
			const { data, error } = await supabase
				.from('levels')
				.select('*')
				.eq('is_active', true)
				.order('order_index');

			if (error) throw error;

			return {
				data: data || [],
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching levels:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch levels',
				success: false,
			};
		}
	}

	static async createLevel(levelData: CreateLevelDto): Promise<ApiResponse<Level>> {
		try {
			const { data, error } = await supabase
				.from('levels')
				.insert([levelData])
				.select()
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error creating level:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to create level',
				success: false,
			};
		}
	}

	static async updateLevel(id: number, updates: UpdateLevelDto): Promise<ApiResponse<Level>> {
		try {
			const { data, error } = await supabase
				.from('levels')
				.update(updates)
				.eq('id', id)
				.select()
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error updating level:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to update level',
				success: false,
			};
		}
	}

	static async deleteLevel(id: number): Promise<ApiResponse<null>> {
		try {
			const { error } = await supabase
				.from('levels')
				.update({ is_active: false })
				.eq('id', id);

			if (error) throw error;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error deleting level:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to delete level',
				success: false,
			};
		}
	}

	// ============ MODULES ============
	static async getModules(levelId?: number): Promise<ApiResponse<Module[]>> {
		try {
			let query = supabase
				.from('modules')
				.select(`
					*,
					level:levels(*)
				`)
				.eq('is_active', true)
				.order('order_index');

			if (levelId) {
				query = query.eq('level_id', levelId);
			}

			const { data, error } = await query;

			if (error) throw error;

			return {
				data: data || [],
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching modules:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch modules',
				success: false,
			};
		}
	}

	static async createModule(moduleData: CreateModuleDto): Promise<ApiResponse<Module>> {
		try {
			const { data, error } = await supabase
				.from('modules')
				.insert([moduleData])
				.select(`
					*,
					level:levels(*)
				`)
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error creating module:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to create module',
				success: false,
			};
		}
	}

	static async updateModule(id: number, updates: UpdateModuleDto): Promise<ApiResponse<Module>> {
		try {
			const { data, error } = await supabase
				.from('modules')
				.update(updates)
				.eq('id', id)
				.select(`
					*,
					level:levels(*)
				`)
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error updating module:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to update module',
				success: false,
			};
		}
	}

	static async deleteModule(id: number): Promise<ApiResponse<null>> {
		try {
			const { error } = await supabase
				.from('modules')
				.update({ is_active: false })
				.eq('id', id);

			if (error) throw error;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error deleting module:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to delete module',
				success: false,
			};
		}
	}

	// ============ LESSONS ============
	static async getLessons(moduleId?: number, filters?: ContentFilters): Promise<ApiResponse<Lesson[]>> {
		try {
			let query = supabase
				.from('lessons')
				.select(`
					*,
					module:modules(*, level:levels(*))
				`)
				.eq('is_active', true)
				.order('order_index');

			if (moduleId) {
				query = query.eq('module_id', moduleId);
			}

			if (filters) {
				if (filters.difficulty_level) {
					query = query.eq('difficulty_level', filters.difficulty_level);
				}
				if (filters.lesson_type) {
					query = query.eq('lesson_type', filters.lesson_type);
				}
				if (filters.search) {
					query = query.ilike('title', `%${filters.search}%`);
				}
				if (filters.limit) {
					query = query.limit(filters.limit);
				}
				if (filters.offset) {
					query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
				}
			}

			const { data, error } = await query;

			if (error) throw error;

			return {
				data: data || [],
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching lessons:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch lessons',
				success: false,
			};
		}
	}

	static async getLessonById(id: number): Promise<ApiResponse<Lesson>> {
		try {
			const { data, error } = await supabase
				.from('lessons')
				.select(`
					*,
					module:modules(*, level:levels(*))
				`)
				.eq('id', id)
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching lesson:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch lesson',
				success: false,
			};
		}
	}

	static async createLesson(lessonData: CreateLessonDto): Promise<ApiResponse<Lesson>> {
		try {
			const { data, error } = await supabase
				.from('lessons')
				.insert([lessonData])
				.select(`
					*,
					module:modules(*, level:levels(*))
				`)
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error creating lesson:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to create lesson',
				success: false,
			};
		}
	}

	static async updateLesson(id: number, updates: UpdateLessonDto): Promise<ApiResponse<Lesson>> {
		try {
			const { data, error } = await supabase
				.from('lessons')
				.update(updates)
				.eq('id', id)
				.select(`
					*,
					module:modules(*, level:levels(*))
				`)
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error updating lesson:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to update lesson',
				success: false,
			};
		}
	}

	static async deleteLesson(id: number): Promise<ApiResponse<null>> {
		try {
			const { error } = await supabase
				.from('lessons')
				.update({ is_active: false })
				.eq('id', id);

			if (error) throw error;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error deleting lesson:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to delete lesson',
				success: false,
			};
		}
	}

	// ============ VOCABULARY ============
	static async getVocabulary(filters?: ContentFilters): Promise<ApiResponse<Vocabulary[]>> {
		try {
			let query = supabase
				.from('vocabulary')
				.select('*')
				.eq('is_active', true)
				.order('french_word');

			if (filters) {
				if (filters.difficulty_level) {
					query = query.eq('difficulty_level', filters.difficulty_level);
				}
				if (filters.category) {
					query = query.eq('category', filters.category);
				}
				if (filters.search) {
					query = query.or(`french_word.ilike.%${filters.search}%,english_translation.ilike.%${filters.search}%`);
				}
				if (filters.limit) {
					query = query.limit(filters.limit);
				}
				if (filters.offset) {
					query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
				}
			}

			const { data, error } = await query;

			if (error) throw error;

			return {
				data: data || [],
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching vocabulary:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch vocabulary',
				success: false,
			};
		}
	}

	static async createVocabulary(vocabularyData: CreateVocabularyDto): Promise<ApiResponse<Vocabulary>> {
		try {
			const { data, error } = await supabase
				.from('vocabulary')
				.insert([vocabularyData])
				.select()
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error creating vocabulary:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to create vocabulary',
				success: false,
			};
		}
	}

	static async updateVocabulary(id: number, updates: UpdateVocabularyDto): Promise<ApiResponse<Vocabulary>> {
		try {
			const { data, error } = await supabase
				.from('vocabulary')
				.update(updates)
				.eq('id', id)
				.select()
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error updating vocabulary:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to update vocabulary',
				success: false,
			};
		}
	}

	static async deleteVocabulary(id: number): Promise<ApiResponse<null>> {
		try {
			const { error } = await supabase
				.from('vocabulary')
				.update({ is_active: false })
				.eq('id', id);

			if (error) throw error;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error deleting vocabulary:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to delete vocabulary',
				success: false,
			};
		}
	}

	// ============ GRAMMAR RULES ============
	static async getGrammarRules(filters?: ContentFilters): Promise<ApiResponse<GrammarRule[]>> {
		try {
			let query = supabase
				.from('grammar_rules')
				.select('*')
				.eq('is_active', true)
				.order('order_index');

			if (filters) {
				if (filters.difficulty_level) {
					query = query.eq('difficulty_level', filters.difficulty_level);
				}
				if (filters.category) {
					query = query.eq('category', filters.category);
				}
				if (filters.search) {
					query = query.ilike('title', `%${filters.search}%`);
				}
			}

			const { data, error } = await query;

			if (error) throw error;

			return {
				data: data || [],
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching grammar rules:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch grammar rules',
				success: false,
			};
		}
	}

	static async createGrammarRule(grammarData: CreateGrammarRuleDto): Promise<ApiResponse<GrammarRule>> {
		try {
			const { data, error } = await supabase
				.from('grammar_rules')
				.insert([grammarData])
				.select()
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error creating grammar rule:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to create grammar rule',
				success: false,
			};
		}
	}

	static async updateGrammarRule(id: number, updates: UpdateGrammarRuleDto): Promise<ApiResponse<GrammarRule>> {
		try {
			const { data, error } = await supabase
				.from('grammar_rules')
				.update(updates)
				.eq('id', id)
				.select()
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error updating grammar rule:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to update grammar rule',
				success: false,
			};
		}
	}

	static async deleteGrammarRule(id: number): Promise<ApiResponse<null>> {
		try {
			const { error } = await supabase
				.from('grammar_rules')
				.update({ is_active: false })
				.eq('id', id);

			if (error) throw error;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error deleting grammar rule:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to delete grammar rule',
				success: false,
			};
		}
	}

	// ============ QUESTIONS ============
	static async getQuestions(lessonId?: number, filters?: ContentFilters): Promise<ApiResponse<Question[]>> {
		try {
			let query = supabase
				.from('questions')
				.select(`
					*,
					lesson:lessons(*, module:modules(*, level:levels(*)))
				`)
				.eq('is_active', true)
				.order('order_index');

			if (lessonId) {
				query = query.eq('lesson_id', lessonId);
			}

			if (filters) {
				if (filters.difficulty_level) {
					query = query.eq('difficulty_level', filters.difficulty_level);
				}
				if (filters.question_type) {
					query = query.eq('question_type', filters.question_type);
				}
				if (filters.limit) {
					query = query.limit(filters.limit);
				}
			}

			const { data, error } = await query;

			if (error) throw error;

			return {
				data: data || [],
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching questions:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch questions',
				success: false,
			};
		}
	}

	static async createQuestion(questionData: CreateQuestionDto): Promise<ApiResponse<Question>> {
		try {
			const { data, error } = await supabase
				.from('questions')
				.insert([questionData])
				.select(`
					*,
					lesson:lessons(*, module:modules(*, level:levels(*)))
				`)
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error creating question:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to create question',
				success: false,
			};
		}
	}

	static async updateQuestion(id: number, updates: UpdateQuestionDto): Promise<ApiResponse<Question>> {
		try {
			const { data, error } = await supabase
				.from('questions')
				.update(updates)
				.eq('id', id)
				.select(`
					*,
					lesson:lessons(*, module:modules(*, level:levels(*)))
				`)
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error updating question:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to update question',
				success: false,
			};
		}
	}

	static async deleteQuestion(id: number): Promise<ApiResponse<null>> {
		try {
			const { error } = await supabase
				.from('questions')
				.update({ is_active: false })
				.eq('id', id);

			if (error) throw error;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error deleting question:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to delete question',
				success: false,
			};
		}
	}

	// ============ CONTENT CATEGORIES ============
	static async getContentCategories(): Promise<ApiResponse<ContentCategory[]>> {
		try {
			const { data, error } = await supabase
				.from('content_categories')
				.select('*')
				.eq('is_active', true)
				.order('order_index');

			if (error) throw error;

			return {
				data: data || [],
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching content categories:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch content categories',
				success: false,
			};
		}
	}

	// ============ CONTENT TAGS ============
	static async getContentTags(): Promise<ApiResponse<ContentTag[]>> {
		try {
			const { data, error } = await supabase
				.from('content_tags')
				.select('*')
				.order('name');

			if (error) throw error;

			return {
				data: data || [],
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching content tags:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch content tags',
				success: false,
			};
		}
	}

	// ============ LESSON ASSOCIATIONS ============
	static async associateVocabularyWithLesson(
		lessonId: number,
		vocabularyId: number,
		isPrimary: boolean = false
	): Promise<ApiResponse<LessonVocabulary>> {
		try {
			const { data, error } = await supabase
				.from('lesson_vocabulary')
				.insert([{
					lesson_id: lessonId,
					vocabulary_id: vocabularyId,
					is_primary: isPrimary
				}])
				.select(`
					*,
					lesson:lessons(*),
					vocabulary:vocabulary(*)
				`)
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error associating vocabulary with lesson:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to associate vocabulary',
				success: false,
			};
		}
	}

	static async associateGrammarWithLesson(
		lessonId: number,
		grammarRuleId: number,
		isPrimary: boolean = false
	): Promise<ApiResponse<LessonGrammar>> {
		try {
			const { data, error } = await supabase
				.from('lesson_grammar')
				.insert([{
					lesson_id: lessonId,
					grammar_rule_id: grammarRuleId,
					is_primary: isPrimary
				}])
				.select(`
					*,
					lesson:lessons(*),
					grammar_rule:grammar_rules(*)
				`)
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error associating grammar with lesson:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to associate grammar rule',
				success: false,
			};
		}
	}

	// ============ UTILITY METHODS ============
	static async getLessonWithContent(lessonId: number): Promise<ApiResponse<any>> {
		try {
			// Get lesson with all associated content
			const lessonResult = await this.getLessonById(lessonId);
			if (!lessonResult.success || !lessonResult.data) {
				return {
					data: null,
					error: 'Lesson not found',
					success: false,
				};
			}

			// Get associated vocabulary
			const { data: vocabularyData } = await supabase
				.from('lesson_vocabulary')
				.select(`
					*,
					vocabulary:vocabulary(*)
				`)
				.eq('lesson_id', lessonId);

			// Get associated grammar
			const { data: grammarData } = await supabase
				.from('lesson_grammar')
				.select(`
					*,
					grammar_rule:grammar_rules(*)
				`)
				.eq('lesson_id', lessonId);

			// Get questions
			const questionsResult = await this.getQuestions(lessonId);

			return {
				data: {
					lesson: lessonResult.data,
					vocabulary: vocabularyData || [],
					grammar: grammarData || [],
					questions: questionsResult.data || [],
				},
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error fetching lesson with content:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to fetch lesson content',
				success: false,
			};
		}	}

	// ============ BULK OPERATIONS ============
	static async bulkCreateVocabulary(vocabularyList: CreateVocabularyDto[]): Promise<ApiResponse<Vocabulary[]>> {
		try {
			const { data, error } = await supabase
				.from('vocabulary')
				.insert(vocabularyList)
				.select();

			if (error) throw error;

			return {
				data: data || [],
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error bulk creating vocabulary:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to bulk create vocabulary',
				success: false,
			};
		}
	}
}
