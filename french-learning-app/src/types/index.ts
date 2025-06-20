// Core TypeScript interfaces following the development rules

export type UserLevel = "beginner" | "intermediate" | "advanced";
export type UserRole = "user" | "admin" | "super_admin";

export interface User {
	id: string;
	username: string;
	email: string;
	level: UserLevel;
	points: number;
	streakDays: number;
	createdAt: string;
	// Stage 2.3 addition
	userRole?: UserRole;
	// Stage 2.2 addition
	avatarUrl?: string;
}

export interface UserProfile {
	id: string;
	username?: string;
	full_name?: string;
	avatar_url?: string;
	level: string;
	points: number;
	streak_days: number;
	// Stage 2 additions
	last_login_at?: string;
	total_lessons_completed: number;
	total_time_spent: number; // in minutes
	favorite_topic?: string;
	daily_goal: number; // minutes per day
	notification_enabled: boolean;
	created_at: string;
	updated_at: string;
}

export interface UserSession {
	id: string;
	user_id: string;
	started_at: string;
	ended_at?: string;
	duration_minutes: number;
	lessons_completed: number;
	points_earned: number;
	created_at: string;
}

export interface DailyStreak {
	id: string;
	user_id: string;
	streak_date: string;
	minutes_studied: number;
	lessons_completed: number;
	points_earned: number;
	created_at: string;
}

export interface Achievement {
	id: string;
	name: string;
	description?: string;
	icon?: string;
	badge_color: string;
	points_required: number;
	type: 'general' | 'streak' | 'lessons' | 'time';
	is_active: boolean;
	created_at: string;
}

export interface UserAchievement {
	id: string;
	user_id: string;
	achievement_id: string;
	earned_at: string;
	achievement?: Achievement;
}

// Stage 3: Content Management System Types
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type LessonType = "vocabulary" | "grammar" | "conversation" | "pronunciation" | "reading" | "listening";
export type QuestionType = "multiple_choice" | "fill_blank" | "pronunciation" | "matching" | "translation" | "listening";
export type WordType = "noun" | "verb" | "adjective" | "adverb" | "preposition" | "conjunction" | "interjection";
export type Gender = "masculine" | "feminine" | "neutral";
export type ConjugationGroup = "first" | "second" | "third" | "irregular";

export interface Level {
	id: number;
	name: string;
	description?: string;
	order_index: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface Module {
	id: number;
	level_id: number;
	title: string;
	description?: string;
	order_index: number;
	estimated_duration_minutes?: number;
	difficulty_level?: DifficultyLevel;
	learning_objectives?: string[];
	is_active: boolean;
	created_at: string;
	updated_at: string;
	level?: Level; // Optional populated level
}

export interface Lesson {
	id: number;
	module_id: number;
	title: string;
	description?: string;
	content?: any; // JSONB content structure
	lesson_type: LessonType;
	order_index: number;
	is_active: boolean;
	estimated_time_minutes: number;
	difficulty_level: DifficultyLevel;
	created_at: string;
	updated_at: string;
	module?: Module; // Optional populated module
}

export interface Vocabulary {
	id: number;
	french_word: string;
	english_translation: string;
	pronunciation?: string; // IPA or phonetic notation
	audio_url?: string;
	example_sentence_fr?: string;
	example_sentence_en?: string;
	difficulty_level: DifficultyLevel;
	category?: string;
	gender?: Gender; // For nouns
	word_type?: WordType;
	conjugation_group?: ConjugationGroup; // For verbs
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface GrammarRule {
	id: number;
	title: string;
	explanation: string;
	examples?: any; // JSONB array of example objects
	difficulty_level: DifficultyLevel;
	category?: string;
	order_index?: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface Question {
	id: number;
	lesson_id: number;
	question_text: string;
	question_type: QuestionType;
	options?: any; // JSONB for multiple choice, matching, etc.
	correct_answer: string;
	explanation?: string;
	points: number;
	difficulty_level: DifficultyLevel;
	audio_url?: string; // For listening questions
	image_url?: string; // For visual questions
	order_index?: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	lesson?: Lesson; // Optional populated lesson
}

export interface LessonVocabulary {
	id: number;
	lesson_id: number;
	vocabulary_id: number;
	is_primary: boolean;
	created_at: string;
	lesson?: Lesson;
	vocabulary?: Vocabulary;
}

export interface LessonGrammar {
	id: number;
	lesson_id: number;
	grammar_rule_id: number;
	is_primary: boolean;
	created_at: string;
	lesson?: Lesson;
	grammar_rule?: GrammarRule;
}

export interface ContentCategory {
	id: number;
	name: string;
	description?: string;
	icon?: string;
	color?: string;
	order_index?: number;
	is_active: boolean;
	created_at: string;
}

export interface ContentTag {
	id: number;
	name: string;
	description?: string;
	color?: string;
	created_at: string;
}

export interface LessonTag {
	id: number;
	lesson_id: number;
	tag_id: number;
	created_at: string;
	lesson?: Lesson;
	tag?: ContentTag;
}

export interface VocabularyTag {
	id: number;
	vocabulary_id: number;
	tag_id: number;
	created_at: string;
	vocabulary?: Vocabulary;
	tag?: ContentTag;
}

// Content Management DTOs (Data Transfer Objects)
export interface CreateLevelDto {
	name: string;
	description?: string;
	order_index: number;
}

export interface UpdateLevelDto extends Partial<CreateLevelDto> {
	is_active?: boolean;
}

export interface CreateModuleDto {
	level_id: number;
	title: string;
	description?: string;
	order_index: number;
	estimated_duration_minutes?: number;
	difficulty_level?: DifficultyLevel;
	learning_objectives?: string[];
}

export interface UpdateModuleDto extends Partial<CreateModuleDto> {
	is_active?: boolean;
}

export interface CreateLessonDto {
	module_id: number;
	title: string;
	description?: string;
	content?: any;
	lesson_type: LessonType;
	order_index: number;
	estimated_time_minutes?: number;
	difficulty_level: DifficultyLevel;
}

export interface UpdateLessonDto extends Partial<CreateLessonDto> {
	is_active?: boolean;
}

export interface CreateVocabularyDto {
	french_word: string;
	english_translation: string;
	pronunciation?: string;
	audio_url?: string;
	example_sentence_fr?: string;
	example_sentence_en?: string;
	difficulty_level: DifficultyLevel;
	category?: string;
	gender?: Gender;
	word_type?: WordType;
	conjugation_group?: ConjugationGroup;
}

export interface UpdateVocabularyDto extends Partial<CreateVocabularyDto> {
	is_active?: boolean;
}

export interface CreateGrammarRuleDto {
	title: string;
	explanation: string;
	examples?: any;
	difficulty_level: DifficultyLevel;
	category?: string;
	order_index?: number;
}

export interface UpdateGrammarRuleDto extends Partial<CreateGrammarRuleDto> {
	is_active?: boolean;
}

export interface CreateQuestionDto {
	lesson_id: number;
	question_text: string;
	question_type: QuestionType;
	options?: any;
	correct_answer: string;
	explanation?: string;
	points?: number;
	difficulty_level: DifficultyLevel;
	audio_url?: string;
	image_url?: string;
	order_index?: number;
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {
	is_active?: boolean;
}

// Content Management Filter/Query Types
export interface ContentFilters {
	difficulty_level?: DifficultyLevel;
	is_active?: boolean;
	category?: string;
	lesson_type?: LessonType;
	question_type?: QuestionType;
	search?: string;
	limit?: number;
	offset?: number;
	order_by?: string;
	order_direction?: 'asc' | 'desc';
}

// API Response wrapper
export interface ApiResponse<T> {
	data: T | null;
	error: string | null;
	success: boolean;
}

// Authentication context types
export interface AuthContextType {
	user: User | null;
	loading: boolean;
	signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	setUser: (user: User | null) => void;
	// Stage 2.3: Admin methods
	isAdmin: () => boolean;
	isSuperAdmin: () => boolean;
}
