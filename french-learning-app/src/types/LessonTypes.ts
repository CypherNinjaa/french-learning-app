// Lesson structure and learning types for Stage 4.1 implementation

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  content: LessonContent;
  lesson_type: LessonType;
  order_index: number;
  is_active: boolean;
  difficulty_level: DifficultyLevel;
  estimated_duration: number; // in minutes
  points_reward: number;
  created_at: string;
  updated_at: string;
}

export interface LessonContent {
  introduction?: string;
  sections: LessonSection[];
  summary?: string;
  vocabulary_focus?: number[]; // vocabulary IDs
  grammar_focus?: number[]; // grammar rule IDs
}

export interface LessonSection {
  id: string;
  type: SectionType;
  title?: string;
  content: any; // Dynamic content based on section type
  order_index: number;
  is_required: boolean;
}

export type LessonType = 
  | 'vocabulary'
  | 'grammar'
  | 'pronunciation' 
  | 'conversation'
  | 'cultural'
  | 'mixed';

export type SectionType =
  | 'text'           // Reading/explanation content
  | 'vocabulary'     // Vocabulary introduction
  | 'grammar'        // Grammar explanation
  | 'audio'          // Audio content
  | 'video'          // Video content
  | 'practice'       // Practice exercises
  | 'quiz'           // Quiz questions
  | 'pronunciation'  // Pronunciation practice
  | 'conversation';  // Conversation practice

export type DifficultyLevel = 
  | 'beginner'
  | 'intermediate' 
  | 'advanced';

// User progress tracking
export interface UserProgress {
  id: number;
  user_id: string;
  lesson_id: number;
  status: ProgressStatus;
  score: number;
  time_spent: number; // in seconds
  attempts: number;
  completed_at?: string;
  started_at: string;
  last_accessed: string;
  section_progress: SectionProgress[];
}

export interface SectionProgress {
  section_id: string;
  completed: boolean;
  score?: number;
  time_spent: number;
  attempts: number;
  completed_at?: string;
}

export type ProgressStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'mastered';

// Lesson renderer props
export interface LessonRendererProps {
  lesson: Lesson;
  userProgress?: UserProgress;
  onSectionComplete: (sectionId: string, score: number, timeSpent: number) => void;
  onLessonComplete: (finalScore: number, totalTime: number) => void;
  onProgressUpdate: (progress: Partial<UserProgress>) => void;
}

// Adaptive difficulty system
export interface DifficultyMetrics {
  user_id: string;
  lesson_type: LessonType;
  average_score: number;
  average_completion_time: number;
  success_rate: number;
  preferred_difficulty: DifficultyLevel;
  learning_velocity: number; // lessons per week
  strong_areas: string[];
  weak_areas: string[];
  last_calculated: string;
}

export interface AdaptiveDifficultyConfig {
  min_lessons_for_analysis: number;
  score_threshold_easy: number;
  score_threshold_hard: number;
  time_threshold_fast: number;
  time_threshold_slow: number;
  success_rate_threshold: number;
}

// Lesson completion criteria
export interface CompletionCriteria {
  min_score: number;
  required_sections: string[];
  time_limit?: number;
  max_attempts?: number;
  mastery_threshold: number; // for repeated lessons
}

// Points and rewards system
export interface LessonRewards {
  base_points: number;
  bonus_points: BonusPoints;
  achievements: string[];
  streaks: StreakReward[];
}

export interface BonusPoints {
  perfect_score: number;
  first_attempt: number;
  speed_bonus: number;
  streak_multiplier: number;
  difficulty_multiplier: number;
}

export interface StreakReward {
  type: 'daily' | 'weekly' | 'lesson_type';
  current_count: number;
  bonus_multiplier: number;
  next_milestone: number;
}

// Error handling and state management
export interface LessonState {
  lesson: Lesson | null;
  userProgress: UserProgress | null;
  currentSection: number;
  loading: boolean;
  error: string | null;
  isCompleted: boolean;
  canProceed: boolean;
  timeSpent: number;
  sessionStartTime: number;
}

export interface LessonAction {
  type: LessonActionType;
  payload?: any;
}

export type LessonActionType =
  | 'LOAD_LESSON_START'
  | 'LOAD_LESSON_SUCCESS'
  | 'LOAD_LESSON_ERROR'
  | 'SECTION_COMPLETE'
  | 'LESSON_COMPLETE'
  | 'UPDATE_PROGRESS'
  | 'NEXT_SECTION'
  | 'PREVIOUS_SECTION'
  | 'RESET_LESSON'
  | 'UPDATE_TIME';
