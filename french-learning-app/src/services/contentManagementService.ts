// Stage 3.1: Content Management Service
// Handles all content management operations for vocabulary, grammar, etc.

import { supabase } from './supabase';
import {
	Vocabulary,
	GrammarRule,
	ContentCategory,
	ContentTag,
	CreateVocabularyDto,
	UpdateVocabularyDto,
	CreateGrammarRuleDto,
	UpdateGrammarRuleDto,
	ContentFilters,
	ApiResponse,
	DifficultyLevel,
} from '../types';

export class ContentManagementService {
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

}
