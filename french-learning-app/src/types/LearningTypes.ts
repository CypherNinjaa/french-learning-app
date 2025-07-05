// Modern Learning Platform Types
// Comprehensive type definitions for book-based learning system

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonStatus = 'not_started' | 'in_progress' | 'completed' | 'locked';
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'audio_recognition' | 'translation';

// ============================================================================
// CORE LEARNING ENTITIES
// ============================================================================

export interface LearningBook {
  id: number;
  title: string;
  description?: string;
  cover_image_url?: string;
  difficulty_level: DifficultyLevel;
  estimated_duration_hours: number;
  order_index: number;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Metadata
  tags: string[];
  prerequisites: string[]; // Book IDs
  learning_objectives: string[];
  
  // Computed fields (from joins/aggregations)
  lesson_count?: number;
  completed_lessons?: number;
  progress_percentage?: number;
  user_progress?: UserBookProgress;
}

export interface LearningLesson {
  id: number;
  book_id: number;
  title: string;
  description?: string;
  
  // Content Structure
  content: LessonContent;
  examples: LessonExample[];
  vocabulary_words: string[];
  
  // Audio & Media
  audio_url?: string;
  video_url?: string;
  images: LessonImage[];
  
  // Lesson Metadata
  estimated_duration_minutes: number;
  difficulty_level: DifficultyLevel;
  order_index: number;
  
  // Test Configuration
  passing_percentage: number;
  max_attempts: number;
  
  // Status
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  learning_objectives: string[];
  
  // Computed fields
  book?: LearningBook;
  test?: LessonTest;
  user_progress?: UserLessonProgress;
  is_locked?: boolean;
  can_attempt_test?: boolean;
}

export interface LessonContent {
  introduction?: string;
  main_content: ContentSection[];
  summary?: string;
  key_points?: string[];
  cultural_notes?: string[];
}

export interface ContentSection {
  id: string;
  type: 'text' | 'audio' | 'video' | 'interactive' | 'vocabulary' | 'grammar';
  title?: string;
  content: string;
  audio_url?: string;
  video_url?: string;
  interactive_elements?: InteractiveElement[];
  order_index: number;
}

export interface InteractiveElement {
  type: 'click_to_hear' | 'drag_drop' | 'fill_blank' | 'match_pairs';
  data: any; // Flexible data structure for different interaction types
  instructions?: string;
}

export interface LessonExample {
  id: string;
  french_text: string;
  english_translation: string;
  audio_url?: string;
  context?: string;
  difficulty_level: DifficultyLevel;
  order_index: number;
}

export interface LessonImage {
  id: string;
  url: string;
  alt_text: string;
  caption?: string;
  order_index: number;
}

// ============================================================================
// TESTING SYSTEM
// ============================================================================

export interface LessonTest {
  id: number;
  lesson_id: number;
  title: string;
  description?: string;
  
  // Test Configuration
  question_count: number;
  time_limit_minutes?: number;
  passing_percentage: number;
  randomize_questions: boolean;
  show_correct_answers: boolean;
  
  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  questions?: TestQuestion[];
  user_best_attempt?: TestAttempt;
  attempts_remaining?: number;
}

export interface TestQuestion {
  id: number;
  test_id: number;
  question_text: string;
  question_type: QuestionType;
  
  // Question Options
  options: QuestionOption[];
  correct_answer: string;
  explanation?: string;
  
  // Audio & Media
  audio_url?: string;
  image_url?: string;
  
  // Metadata
  difficulty_level: DifficultyLevel;
  points: number;
  order_index: number;
  
  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
  audio_url?: string;
  image_url?: string;
}

export interface TestAttempt {
  id: number;
  user_id: string;
  lesson_id: number;
  test_id: number;
  
  // Attempt Details
  attempt_number: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_minutes?: number;
  
  // Detailed Results
  answers: TestAnswer[];
  passed: boolean;
  
  // Timing
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface TestAnswer {
  question_id: number;
  user_answer: string;
  is_correct: boolean;
  points_earned: number;
  time_taken_seconds?: number;
}

// ============================================================================
// USER PROGRESS TRACKING
// ============================================================================

export interface UserBookProgress {
  id: number;
  user_id: string;
  book_id: number;
  
  // Progress Metrics
  lessons_completed: number;
  total_lessons: number;
  progress_percentage: number;
  
  // Timing
  started_at: string;
  completed_at?: string;
  last_accessed_at: string;
  total_study_time_minutes: number;
  
  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  book?: LearningBook;
  current_lesson?: LearningLesson;
  next_lesson?: LearningLesson;
}

export interface UserLessonProgress {
  id: number;
  user_id: string;
  lesson_id: number;
  book_id: number;
  
  // Progress Status
  status: LessonStatus;
  completion_percentage: number;
  
  // Content Progress
  content_viewed: boolean;
  examples_practiced: boolean;
  
  // Test Progress
  test_attempts: number;
  best_test_score: number;
  latest_test_score: number;
  test_passed: boolean;
  
  // Timing
  started_at?: string;
  completed_at?: string;
  last_accessed_at?: string;
  total_study_time_minutes: number;
  
  // Metadata
  notes?: string;
  bookmarks: string[]; // Section IDs
  
  created_at: string;
  updated_at: string;
  
  // Computed fields
  lesson?: LearningLesson;
  can_take_test?: boolean;
  attempts_remaining?: number;
}

// ============================================================================
// ADMIN & CONFIGURATION
// ============================================================================

export interface LearningSettings {
  id: number;
  key: string;
  value: any;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface AIAssistantConfig {
  id: number;
  name: string;
  personality: string;
  system_prompt: string;
  model_settings: Record<string, any>;
  
  // Features
  enabled: boolean;
  available_during_lessons: boolean;
  available_during_tests: boolean;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API DTOs (Data Transfer Objects)
// ============================================================================

// Book Management DTOs
export interface CreateBookDto {
  title: string;
  description?: string;
  cover_image_url?: string;
  difficulty_level: DifficultyLevel;
  estimated_duration_hours?: number;
  order_index?: number;
  tags?: string[];
  prerequisites?: string[];
  learning_objectives?: string[];
}

export interface UpdateBookDto extends Partial<CreateBookDto> {
  is_published?: boolean;
  is_active?: boolean;
}

// Lesson Management DTOs
export interface CreateLessonDto {
  book_id: number;
  title: string;
  description?: string;
  content: LessonContent;
  examples?: LessonExample[];
  vocabulary_words?: string[];
  audio_url?: string;
  video_url?: string;
  images?: LessonImage[];
  estimated_duration_minutes?: number;
  difficulty_level?: DifficultyLevel;
  order_index?: number;
  passing_percentage?: number;
  max_attempts?: number;
  learning_objectives?: string[];
}

export interface UpdateLessonDto extends Partial<CreateLessonDto> {
  is_published?: boolean;
  is_active?: boolean;
}

// Test Management DTOs
export interface CreateTestDto {
  lesson_id: number;
  title?: string;
  description?: string;
  question_count?: number;
  time_limit_minutes?: number;
  passing_percentage?: number;
  randomize_questions?: boolean;
  show_correct_answers?: boolean;
}

export interface UpdateTestDto extends Partial<CreateTestDto> {
  is_active?: boolean;
}

export interface CreateQuestionDto {
  test_id: number;
  question_text: string;
  question_type: QuestionType;
  options: Omit<QuestionOption, 'id'>[];
  correct_answer: string;
  explanation?: string;
  audio_url?: string;
  image_url?: string;
  difficulty_level?: DifficultyLevel;
  points?: number;
  order_index?: number;
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {
  is_active?: boolean;
}

// Test Taking DTOs
export interface StartTestDto {
  lesson_id: number;
  test_id: number;
}

export interface SubmitTestDto {
  attempt_id: number;
  answers: {
    question_id: number;
    user_answer: string;
    time_taken_seconds?: number;
  }[];
  time_taken_minutes: number;
}

// Progress DTOs
export interface UpdateProgressDto {
  lesson_id: number;
  action: 'start_lesson' | 'view_content' | 'practice_examples' | 'complete_lesson' | 'add_note' | 'add_bookmark' | 'submit_test';
  data?: {
    notes?: string;
    bookmark_id?: string;
    study_time_minutes?: number;
    test_score?: number;
    passing_percentage?: number;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  message?: string;
  metadata?: {
    total_count?: number;
    page?: number;
    page_size?: number;
    has_more?: boolean;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  metadata: {
    total_count: number;
    page: number;
    page_size: number;
    has_more: boolean;
    total_pages: number;
  };
}

// ============================================================================
// UI/UX TYPES
// ============================================================================

export interface LearningFilters {
  difficulty_level?: DifficultyLevel;
  book_id?: number;
  status?: LessonStatus;
  search_query?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface BookCardProps {
  book: LearningBook;
  onPress: (book: LearningBook) => void;
  onLongPress?: (book: LearningBook) => void;
  showProgress?: boolean;
  variant?: 'card' | 'list' | 'compact';
}

export interface LessonCardProps {
  lesson: LearningLesson;
  onPress: (lesson: LearningLesson) => void;
  onLongPress?: (lesson: LearningLesson) => void;
  showStatus?: boolean;
  showProgress?: boolean;
  variant?: 'card' | 'list' | 'compact';
}

export interface TestResultsProps {
  attempt: TestAttempt;
  test: LessonTest;
  onRetry?: () => void;
  onContinue?: () => void;
  showDetailedResults?: boolean;
}

// ============================================================================
// AI ASSISTANT TYPES
// ============================================================================

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: {
    lesson_id?: number;
    book_id?: number;
    question_id?: number;
    type?: 'lesson_help' | 'test_hint' | 'general_question';
  };
}

export interface AIConversation {
  id: string;
  user_id: string;
  messages: AIMessage[];
  context: {
    lesson_id?: number;
    book_id?: number;
    session_type: 'lesson' | 'test' | 'general';
  };
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SPEECH & AUDIO TYPES
// ============================================================================

export interface AudioPlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  speed: number;
  error?: string;
}

export interface SpeechConfig {
  language: 'fr-FR' | 'en-US';
  voice?: string;
  rate: number;
  pitch: number;
  volume: number;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export type LearningError = 
  | 'LESSON_LOCKED'
  | 'TEST_NOT_AVAILABLE'
  | 'ATTEMPTS_EXCEEDED'
  | 'CONTENT_NOT_FOUND'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'NETWORK_ERROR'
  | 'AUDIO_PLAYBACK_ERROR'
  | 'AI_SERVICE_ERROR'
  | 'UNKNOWN_ERROR';

export interface LearningErrorInfo {
  type: LearningError;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
  retryable: boolean;
}
