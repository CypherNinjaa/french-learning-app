// Question Types for Stage 4.2 implementation
// Comprehensive question rendering and interaction system

export interface BaseQuestionProps {
  question: Question;
  onAnswer: (answer: string | string[], isCorrect: boolean, timeTaken: number) => void;
  onNext?: () => void;
  isAnswered: boolean;
  userAnswer?: string | string[];
  showCorrectAnswer?: boolean;
  disabled?: boolean;
  timeUp?: boolean;
}

export interface MultipleChoiceQuestion {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  image_url?: string;
  audio_url?: string;
}

export interface FillInBlankQuestion {
  id: number;
  question_text: string; // Text with blank spaces marked as [BLANK] or {blank}
  correct_answers: string[]; // Array of acceptable answers for each blank
  blanks: BlankConfig[];
  case_sensitive?: boolean;
  accept_partial?: boolean;
}

export interface BlankConfig {
  id: string;
  position: number; // Position in the sentence
  acceptable_answers: string[];
  hint?: string;
  case_sensitive?: boolean;
}

export interface DragAndDropQuestion {
  id: number;
  question_text: string;
  items: DragDropItem[];
  targets: DragDropTarget[];
  matching_type: 'vocabulary' | 'grammar' | 'image' | 'audio';
}

export interface DragDropItem {
  id: string;
  content: string;
  type: 'text' | 'image' | 'audio';
  url?: string; // For image/audio items
}

export interface DragDropTarget {
  id: string;
  content: string;
  acceptable_items: string[]; // IDs of items that can be dropped here
  type: 'text' | 'image';
  url?: string;
}

export interface TextInputQuestion {
  id: number;
  question_text: string;
  correct_answers: string[];
  validation_rules: ValidationRule[];
  input_type: 'text' | 'sentence' | 'paragraph';
  max_length?: number;
  min_length?: number;
  placeholder?: string;
}

export interface ValidationRule {
  type: 'exact_match' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'spelling';
  value: string;
  case_sensitive?: boolean;
  weight: number; // For partial scoring
}

export interface ImageBasedQuestion {
  id: number;
  question_text: string;
  image_url: string;
  question_type: 'identify' | 'describe' | 'multiple_choice' | 'click_regions';
  options?: string[]; // For multiple choice
  correct_answer: string | string[];
  clickable_regions?: ClickableRegion[]; // For click-based questions
}

export interface ClickableRegion {
  id: string;
  x: number; // Percentage from left
  y: number; // Percentage from top
  width: number; // Percentage width
  height: number; // Percentage height
  label: string;
  is_correct: boolean;
}

// Question rendering state management
export interface QuestionState {
  currentAnswer: string | string[];
  isAnswered: boolean;
  isCorrect?: boolean;
  showFeedback: boolean;
  startTime: number;
  timeSpent: number;
  attempts: number;
  hints_used: string[];
  partial_score?: number;
}

export interface QuestionResult {
  question_id: number;
  user_answer: string | string[];
  correct_answer: string | string[];
  is_correct: boolean;
  time_spent: number;
  attempts: number;
  partial_score: number;
  hints_used: string[];
  feedback_shown: boolean;
}

// Question feedback and scoring
export interface QuestionFeedback {
  is_correct: boolean;
  score: number;
  max_score: number;
  explanation?: string;
  correct_answer?: string | string[];
  hints?: string[];
  encouragement: string;
}

// Question analytics
export interface QuestionAnalytics {
  question_id: number;
  total_attempts: number;
  correct_attempts: number;
  average_time: number;
  difficulty_rating: number;
  common_wrong_answers: string[];
  improvement_suggestions: string[];
}

// Enhanced Question type from existing types
import { Question } from '../types';

export interface EnhancedQuestion extends Question {
  question_config: QuestionConfig;
  analytics?: QuestionAnalytics;
}

export interface QuestionConfig {
  type: 'multiple_choice' | 'fill_blank' | 'drag_drop' | 'text_input' | 'image_based';
  data: MultipleChoiceQuestion | FillInBlankQuestion | DragAndDropQuestion | TextInputQuestion | ImageBasedQuestion;
  scoring: ScoringConfig;
  ui_config: UIConfig;
}

export interface ScoringConfig {
  max_points: number;
  partial_credit: boolean;
  time_bonus: boolean;
  attempt_penalty: boolean;
  hint_penalty: number;
}

export interface UIConfig {
  show_progress: boolean;
  show_timer: boolean;
  allow_skip: boolean;
  max_attempts?: number;
  hint_enabled: boolean;
  feedback_delay: number; // seconds
}

// Question renderer component props
export interface QuestionRendererProps {
  question: EnhancedQuestion;
  onAnswer: (result: QuestionResult) => void;
  onNext: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  onHint?: (hintId: string) => void;
  settings: QuestionRendererSettings;
}

export interface QuestionRendererSettings {
  show_immediate_feedback: boolean;
  allow_multiple_attempts: boolean;
  show_correct_answer: boolean;
  enable_hints: boolean;
  time_limit?: number;
  auto_advance: boolean;
  sound_enabled: boolean;
}
