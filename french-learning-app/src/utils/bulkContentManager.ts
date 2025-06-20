// Bulk Import/Export Utility - Stage 3.2
// Handles bulk operations for content management

import { supabase } from '../services/supabase';
import {
	Level,
	Module,
	Lesson,
	Vocabulary,
	GrammarRule,
	Question,
	CreateLevelDto,
	CreateModuleDto,
	CreateLessonDto,
	CreateVocabularyDto,
	CreateGrammarRuleDto,
	CreateQuestionDto,
	ApiResponse,
} from '../types';

export interface BulkImportData {
	levels?: CreateLevelDto[];
	modules?: CreateModuleDto[];
	lessons?: CreateLessonDto[];
	vocabulary?: CreateVocabularyDto[];
	grammarRules?: CreateGrammarRuleDto[];
	questions?: CreateQuestionDto[];
}

export interface BulkExportData {
	levels: Level[];
	modules: Module[];
	lessons: Lesson[];
	vocabulary: Vocabulary[];
	grammarRules: GrammarRule[];
	questions: Question[];
	exportedAt: string;
	metadata: {
		totalLevels: number;
		totalModules: number;
		totalLessons: number;
		totalVocabulary: number;
		totalGrammarRules: number;
		totalQuestions: number;
	};
}

export class BulkContentManager {
	// ============ IMPORT OPERATIONS ============
	
	static async importFromJSON(jsonData: string): Promise<ApiResponse<BulkImportData>> {
		try {
			const data: BulkImportData = JSON.parse(jsonData);
			const results = await this.bulkImport(data);
			return results;
		} catch (error) {
			console.error('Error parsing import data:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Failed to parse import data',
				success: false,
			};
		}
	}

	static async bulkImport(data: BulkImportData): Promise<ApiResponse<BulkImportData>> {
		try {
			const results: BulkImportData = {};

			// Import levels first (they're referenced by modules)
			if (data.levels && data.levels.length > 0) {
				const { data: levelData, error: levelError } = await supabase
					.from('levels')
					.insert(data.levels)
					.select();

				if (levelError) throw new Error(`Level import failed: ${levelError.message}`);
				results.levels = levelData || [];
			}

			// Import modules (they're referenced by lessons)
			if (data.modules && data.modules.length > 0) {
				const { data: moduleData, error: moduleError } = await supabase
					.from('modules')
					.insert(data.modules)
					.select();

				if (moduleError) throw new Error(`Module import failed: ${moduleError.message}`);
				results.modules = moduleData || [];
			}

			// Import lessons (they're referenced by questions)
			if (data.lessons && data.lessons.length > 0) {
				const { data: lessonData, error: lessonError } = await supabase
					.from('lessons')
					.insert(data.lessons)
					.select();

				if (lessonError) throw new Error(`Lesson import failed: ${lessonError.message}`);
				results.lessons = lessonData || [];
			}

			// Import vocabulary
			if (data.vocabulary && data.vocabulary.length > 0) {
				const { data: vocabularyData, error: vocabularyError } = await supabase
					.from('vocabulary')
					.insert(data.vocabulary)
					.select();

				if (vocabularyError) throw new Error(`Vocabulary import failed: ${vocabularyError.message}`);
				results.vocabulary = vocabularyData || [];
			}

			// Import grammar rules
			if (data.grammarRules && data.grammarRules.length > 0) {
				const { data: grammarData, error: grammarError } = await supabase
					.from('grammar_rules')
					.insert(data.grammarRules)
					.select();

				if (grammarError) throw new Error(`Grammar rules import failed: ${grammarError.message}`);
				results.grammarRules = grammarData || [];
			}

			// Import questions
			if (data.questions && data.questions.length > 0) {
				const { data: questionData, error: questionError } = await supabase
					.from('questions')
					.insert(data.questions)
					.select();

				if (questionError) throw new Error(`Questions import failed: ${questionError.message}`);
				results.questions = questionData || [];
			}

			return {
				data: results,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error during bulk import:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Bulk import failed',
				success: false,
			};
		}
	}

	// ============ EXPORT OPERATIONS ============
	
	static async exportAllContent(): Promise<ApiResponse<BulkExportData>> {
		try {
			// Fetch all content in parallel
			const [
				levelsResult,
				modulesResult,
				lessonsResult,
				vocabularyResult,
				grammarResult,
				questionsResult,
			] = await Promise.all([
				supabase.from('levels').select('*').eq('is_active', true).order('order_index'),
				supabase.from('modules').select('*').eq('is_active', true).order('order_index'),
				supabase.from('lessons').select('*').eq('is_active', true).order('order_index'),
				supabase.from('vocabulary').select('*').eq('is_active', true).order('french_word'),
				supabase.from('grammar_rules').select('*').eq('is_active', true).order('title'),
				supabase.from('questions').select('*').eq('is_active', true).order('id'),
			]);

			// Check for errors
			if (levelsResult.error) throw new Error(`Levels export failed: ${levelsResult.error.message}`);
			if (modulesResult.error) throw new Error(`Modules export failed: ${modulesResult.error.message}`);
			if (lessonsResult.error) throw new Error(`Lessons export failed: ${lessonsResult.error.message}`);
			if (vocabularyResult.error) throw new Error(`Vocabulary export failed: ${vocabularyResult.error.message}`);
			if (grammarResult.error) throw new Error(`Grammar rules export failed: ${grammarResult.error.message}`);
			if (questionsResult.error) throw new Error(`Questions export failed: ${questionsResult.error.message}`);

			const exportData: BulkExportData = {
				levels: levelsResult.data || [],
				modules: modulesResult.data || [],
				lessons: lessonsResult.data || [],
				vocabulary: vocabularyResult.data || [],
				grammarRules: grammarResult.data || [],
				questions: questionsResult.data || [],
				exportedAt: new Date().toISOString(),
				metadata: {
					totalLevels: (levelsResult.data || []).length,
					totalModules: (modulesResult.data || []).length,
					totalLessons: (lessonsResult.data || []).length,
					totalVocabulary: (vocabularyResult.data || []).length,
					totalGrammarRules: (grammarResult.data || []).length,
					totalQuestions: (questionsResult.data || []).length,
				},
			};

			return {
				data: exportData,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error during bulk export:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'Bulk export failed',
				success: false,
			};
		}
	}

	static async exportToJSON(): Promise<ApiResponse<string>> {
		try {
			const exportResult = await this.exportAllContent();
			
			if (!exportResult.success || !exportResult.data) {
				return {
					data: null,
					error: exportResult.error || 'Export failed',
					success: false,
				};
			}

			const jsonString = JSON.stringify(exportResult.data, null, 2);
			
			return {
				data: jsonString,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error('Error converting to JSON:', error);
			return {
				data: null,
				error: error instanceof Error ? error.message : 'JSON conversion failed',
				success: false,
			};
		}
	}

	// ============ TEMPLATE OPERATIONS ============
		static generateImportTemplate(): BulkImportData {
		return {
			levels: [
				{
					name: 'Beginner',
					description: 'Starting level for French learners',
					order_index: 1,
				},
			],
			modules: [
				{
					level_id: 1, // Reference to level
					title: 'Basic Greetings',
					description: 'Learn how to greet people in French',
					order_index: 1,
					estimated_duration_minutes: 30,
					difficulty_level: 'beginner',
					learning_objectives: ['Learn basic greeting phrases', 'Understand formal vs informal greetings'],
				},
			],
			lessons: [
				{
					module_id: 1, // Reference to module
					title: 'Hello and Goodbye',
					description: 'Basic greeting and farewell expressions',
					lesson_type: 'vocabulary',
					order_index: 1,
					estimated_time_minutes: 15,
					difficulty_level: 'beginner',
					content: {
						introduction: 'Welcome to your first French lesson!',
						sections: [
							{
								type: 'vocabulary',
								title: 'Basic Greetings',
								words: ['Bonjour', 'Bonsoir', 'Au revoir'],
							},
						],
					},
				},
			],
			vocabulary: [
				{
					french_word: 'Bonjour',
					english_translation: 'Hello/Good morning',
					pronunciation: 'bon-ZHOOR',
					word_type: 'interjection',
					difficulty_level: 'beginner',
					category: 'greetings',
					example_sentence_fr: 'Bonjour, comment allez-vous?',
					example_sentence_en: 'Hello, how are you?',
				},
			],
			grammarRules: [
				{
					title: 'Formal vs Informal Greetings',
					explanation: 'French has different greeting forms depending on the context and relationship.',
					examples: [
						'Bonjour (formal)',
						'Salut (informal)',
					],
					difficulty_level: 'beginner',
					category: 'social_conventions',
				},
			],
			questions: [
				{
					lesson_id: 1, // Reference to lesson
					question_text: 'How do you say "Hello" in French?',
					question_type: 'multiple_choice',
					options: ['Bonjour', 'Au revoir', 'Merci', 'Oui'],
					correct_answer: 'Bonjour',
					explanation: 'Bonjour is the standard French greeting meaning "Hello" or "Good morning".',
					points: 10,
					difficulty_level: 'beginner',
				},
			],
		};
	}

	static getImportTemplateJSON(): string {
		return JSON.stringify(this.generateImportTemplate(), null, 2);
	}
}
