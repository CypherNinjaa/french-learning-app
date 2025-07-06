// Modern Learning Platform Service
// Core service for book-based learning system with comprehensive features

import { supabase } from './supabase';
import {
  LearningBook,
  LearningLesson,
  LessonTest,
  TestQuestion,
  TestAttempt,
  UserBookProgress,
  UserLessonProgress,
  CreateBookDto,
  UpdateBookDto,
  CreateLessonDto,
  UpdateLessonDto,
  CreateTestDto,
  UpdateTestDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  StartTestDto,
  SubmitTestDto,
  UpdateProgressDto,
  ApiResponse,
  PaginatedResponse,
  LearningFilters,
  DifficultyLevel,
  LessonStatus,
  QuestionType,
  LearningError,
} from '../types/LearningTypes';

export class LearningService {
  // ============================================================================
  // BOOK MANAGEMENT
  // ============================================================================

  /**
   * Get all published books with optional filtering
   */
  static async getBooks(filters?: LearningFilters): Promise<PaginatedResponse<LearningBook>> {
    try {
      let query = supabase
        .from('learning_books')
        .select(`
          *
        `)
        .eq('is_published', true)
        .eq('is_active', true)
        .order('order_index');

      // Apply filters
      if (filters?.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level);
      }

      if (filters?.search_query) {
        query = query.or(`title.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Pagination
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      
      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .limit(limit);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
        metadata: {
          total_count: count || 0,
          page: Math.floor(offset / limit) + 1,
          page_size: limit,
          has_more: (count || 0) > offset + limit,
          total_pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching books:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch books',
        success: false,
        metadata: {
          total_count: 0,
          page: 1,
          page_size: filters?.limit || 20,
          has_more: false,
          total_pages: 0,
        },
      };
    }
  }

  /**
   * Get a single book with full details
   */
  static async getBook(bookId: number): Promise<ApiResponse<LearningBook>> {
    try {
      const { data, error } = await supabase
        .from('learning_books')
        .select(`
          *,
          lessons:learning_lessons(*),
          user_progress:user_book_progress(*)
        `)
        .eq('id', bookId)
        .eq('is_published', true)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching book:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch book',
        success: false,
      };
    }
  }

  /**
   * Admin: Create a new book
   */
  static async createBook(bookData: CreateBookDto): Promise<ApiResponse<LearningBook>> {
    try {
      const { data, error } = await supabase
        .from('learning_books')
        .insert([{
          ...bookData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select('*')
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
        message: 'Book created successfully',
      };
    } catch (error) {
      console.error('Error creating book:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create book',
        success: false,
      };
    }
  }

  /**
   * Admin: Update an existing book
   */
  static async updateBook(bookId: number, updates: UpdateBookDto): Promise<ApiResponse<LearningBook>> {
    try {
      const { data, error } = await supabase
        .from('learning_books')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookId)
        .select('*')
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
        message: 'Book updated successfully',
      };
    } catch (error) {
      console.error('Error updating book:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update book',
        success: false,
      };
    }
  }

  /**
   * Admin: Delete a book (soft delete)
   */
  static async deleteBook(bookId: number): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('learning_books')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookId);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true,
        message: 'Book deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting book:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete book',
        success: false,
      };
    }
  }

  // ============================================================================
  // LESSON MANAGEMENT
  // ============================================================================

  /**
   * Get lessons for a specific book with user progress
   */
  static async getLessonsForBook(bookId: number, userId?: string): Promise<ApiResponse<LearningLesson[]>> {
    try {
      let query = supabase
        .from('learning_lessons')
        .select(`
          *,
          book:learning_books(*),
          test:lesson_tests(*),
          user_progress:user_lesson_progress(*)
        `)
        .eq('book_id', bookId)
        .eq('is_published', true)
        .eq('is_active', true)
        .order('order_index');

      if (userId) {
        query = query.eq('user_progress.user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process lessons to determine lock status
      const processedLessons = await this.processLessonsLockStatus(data || [], userId);

      return {
        data: processedLessons,
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

  /**
   * Get a single lesson with full details
   */
  static async getLesson(lessonId: number, userId?: string): Promise<ApiResponse<LearningLesson>> {
    try {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select(`
          *,
          book:learning_books(*),
          test:lesson_tests(
            *,
            questions:test_questions(*)
          ),
          user_progress:user_lesson_progress(*)
        `)
        .eq('id', lessonId)
        .eq('is_published', true)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      // Check if lesson is accessible to user
      if (userId) {
        const isAccessible = await this.checkLessonAccess(lessonId, userId);
        if (!isAccessible) {
          return {
            data: null,
            error: 'LESSON_LOCKED',
            success: false,
            message: 'This lesson is locked. Complete previous lessons first.',
          };
        }
      }

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

  /**
   * Admin: Create a new lesson
   */
  static async createLesson(lessonData: CreateLessonDto): Promise<ApiResponse<LearningLesson>> {
    try {
      const { data, error } = await supabase
        .from('learning_lessons')
        .insert([{
          ...lessonData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select('*')
        .single();

      if (error) throw error;

      // Create default test for the lesson
      if (data) {
        await this.createTest({
          lesson_id: data.id,
          title: `${data.title} - Assessment`,
          question_count: 5,
          passing_percentage: data.passing_percentage,
        });
      }

      return {
        data,
        error: null,
        success: true,
        message: 'Lesson created successfully',
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

  /**
   * Admin: Update an existing lesson
   */
  static async updateLesson(lessonId: number, updates: UpdateLessonDto): Promise<ApiResponse<LearningLesson>> {
    try {
      const { data, error } = await supabase
        .from('learning_lessons')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lessonId)
        .select('*')
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
        message: 'Lesson updated successfully',
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

  /**
   * Admin: Delete a lesson (soft delete)
   */
  static async deleteLesson(lessonId: number): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('learning_lessons')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lessonId);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true,
        message: 'Lesson deleted successfully',
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

  // ============================================================================
  // TEST MANAGEMENT
  // ============================================================================

  /**
   * Admin: Create a test for a lesson
   */
  static async createTest(testData: CreateTestDto): Promise<ApiResponse<LessonTest>> {
    try {
      const { data, error } = await supabase
        .from('lesson_tests')
        .insert([testData])
        .select('*')
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
        message: 'Test created successfully',
      };
    } catch (error) {
      console.error('Error creating test:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create test',
        success: false,
      };
    }
  }

  /**
   * Admin: Add a question to a test
   */
  static async createQuestion(questionData: CreateQuestionDto): Promise<ApiResponse<TestQuestion>> {
    try {
      const { data, error } = await supabase
        .from('test_questions')
        .insert([questionData])
        .select('*')
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
        message: 'Question created successfully',
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

  /**
   * Get tests for a specific lesson
   */
  static async getLessonTests(lessonId: number): Promise<ApiResponse<LessonTest[]>> {
    try {
      const { data, error } = await supabase
        .from('lesson_tests')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('is_active', true)
        .order('id');

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error getting lesson tests:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get lesson tests',
        success: false,
      };
    }
  }

  /**
   * Get questions for a specific test
   */
  static async getTestQuestions(testId: number): Promise<ApiResponse<TestQuestion[]>> {
    try {
      const { data, error } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_id', testId)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error getting test questions:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get test questions',
        success: false,
      };
    }
  }

  // ============================================================================
  // USER PROGRESS TRACKING
  // ============================================================================

  /**
   * Initialize progress for a user starting a new book
   */
  static async initializeBookProgress(userId: string, bookId: number): Promise<ApiResponse<UserBookProgress>> {
    try {
      // Create or update book progress
      const { data, error } = await supabase
        .from('user_book_progress')
        .upsert([{
          user_id: userId,
          book_id: bookId,
          started_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
        }], {
          onConflict: 'user_id,book_id',
        })
        .select('*')
        .single();

      if (error) throw error;

      // Initialize access to the first lesson in the book
      const { data: firstLesson, error: firstLessonError } = await supabase
        .from('learning_lessons')
        .select('id')
        .eq('book_id', bookId)
        .eq('order_index', 0)
        .single();

      if (firstLessonError || !firstLesson) {
        console.error('Error finding first lesson:', firstLessonError);
      } else {
        // Create progress record for first lesson to make it accessible
        await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: userId,
            lesson_id: firstLesson.id,
            status: 'not_started',
            content_viewed: false,
            examples_practiced: false,
            test_passed: false,
            total_study_time_minutes: 0,
            bookmarks: [],
            notes: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,lesson_id',
            ignoreDuplicates: true // Don't overwrite if already exists
          });
        
        console.log(`Initialized access to first lesson ${firstLesson.id} for user ${userId}`);
      }

      return {
        data,
        error: null,
        success: true,
        message: 'Book progress initialized successfully',
      };
    } catch (error) {
      console.error('Error initializing book progress:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to initialize book progress',
        success: false,
      };
    }
  }

  /**
   * Update user progress for a lesson
   */
  static async updateLessonProgress(userId: string, progressData: UpdateProgressDto): Promise<ApiResponse<UserLessonProgress>> {
    try {
      const { lesson_id, action, data: actionData } = progressData;

      // Get current progress (without throwing error if not found)
      const { data: currentProgress } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lesson_id)
        .maybeSingle();

      let upsertData: Partial<UserLessonProgress> = {
        user_id: userId,
        lesson_id: lesson_id,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Set defaults for new progress record
      if (!currentProgress) {
        upsertData.status = 'not_started';
        upsertData.content_viewed = false;
        upsertData.examples_practiced = false;
        upsertData.total_study_time_minutes = 0;
        upsertData.bookmarks = [];
        upsertData.notes = '';
      } else {
        // Preserve existing data
        upsertData = { ...currentProgress, ...upsertData };
      }

      // Apply action-specific updates
      switch (action) {
        case 'start_lesson':
          upsertData.status = 'in_progress';
          upsertData.started_at = upsertData.started_at || new Date().toISOString();
          break;

        case 'view_content':
          upsertData.content_viewed = true;
          break;

        case 'practice_examples':
          upsertData.examples_practiced = true;
          break;

        case 'complete_lesson':
          upsertData.status = 'completed';
          upsertData.completed_at = new Date().toISOString();
          // If test score is provided, mark test as passed if score meets requirement
          if (actionData?.test_score && actionData?.passing_percentage) {
            upsertData.test_passed = actionData.test_score >= actionData.passing_percentage;
          }
          break;

        case 'submit_test':
          // Update test status based on score
          if (actionData?.test_score && actionData?.passing_percentage) {
            const testPassed = actionData.test_score >= actionData.passing_percentage;
            upsertData.test_passed = testPassed;
            if (testPassed) {
              upsertData.status = 'completed';
              upsertData.completed_at = new Date().toISOString();
            }
          }
          break;

        case 'add_note':
          if (actionData?.notes) {
            upsertData.notes = actionData.notes;
          }
          break;

        case 'add_bookmark':
          if (actionData?.bookmark_id) {
            const bookmarks = upsertData.bookmarks || [];
            if (!bookmarks.includes(actionData.bookmark_id)) {
              upsertData.bookmarks = [...bookmarks, actionData.bookmark_id];
            }
          }
          break;
      }

      // Add study time if provided
      if (actionData?.study_time_minutes) {
        upsertData.total_study_time_minutes = (upsertData.total_study_time_minutes || 0) + actionData.study_time_minutes;
      }

      // Upsert progress record
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert(upsertData, { 
          onConflict: 'user_id,lesson_id',
          ignoreDuplicates: false 
        })
        .select('*');

      if (error) throw error;

      // Return the first record if multiple or the single record
      const progressRecord = Array.isArray(data) ? data[0] : data;

      return {
        data: progressRecord,
        error: null,
        success: true,
        message: 'Progress updated successfully',
      };
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update progress',
        success: false,
      };
    }
  }

  /**
   * Get user's progress for a specific book
   */
  static async getUserBookProgress(userId: string, bookId: number): Promise<ApiResponse<UserBookProgress>> {
    try {
      const { data, error } = await supabase
        .from('user_book_progress')
        .select(`
          *,
          book:learning_books(*),
          lesson_progress:user_lesson_progress(
            *,
            lesson:learning_lessons(*)
          )
        `)
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

      return {
        data: data || null,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching user book progress:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch progress',
        success: false,
      };
    }
  }

  /**
   * Get all user's book progress for level unlocking
   */
  static async getAllUserProgress(userId: string): Promise<ApiResponse<UserBookProgress[]>> {
    try {
      const { data, error } = await supabase
        .from('user_book_progress')
        .select(`
          *,
          book:learning_books(id, title, difficulty_level)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching all user progress:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch progress',
        success: false,
      };
    }
  }

  // ============================================================================
  // TEST TAKING SYSTEM
  // ============================================================================

  /**
   * Start a test attempt
   */
  static async startTest(userId: string, testData: StartTestDto): Promise<ApiResponse<TestAttempt>> {
    try {
      const { lesson_id, test_id } = testData;

      // Check if user can take the test
      const canTakeTest = await this.canUserTakeTest(userId, lesson_id, test_id);
      if (!canTakeTest.allowed) {
        return {
          data: null,
          error: canTakeTest.reason as LearningError,
          success: false,
          message: canTakeTest.message,
        };
      }

      // Get attempt number
      const { count: previousAttempts } = await supabase
        .from('test_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('test_id', test_id);

      const attemptNumber = (previousAttempts || 0) + 1;

      // Create test attempt
      const { data, error } = await supabase
        .from('test_attempts')
        .insert([{
          user_id: userId,
          lesson_id,
          test_id,
          attempt_number: attemptNumber,
          score: 0,
          total_questions: 0,
          correct_answers: 0,
          answers: [],
          passed: false,
          started_at: new Date().toISOString(),
        }])
        .select('*')
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
        message: 'Test started successfully',
      };
    } catch (error) {
      console.error('Error starting test:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to start test',
        success: false,
      };
    }
  }

  /**
   * Submit a test attempt
   */
  static async submitTest(userId: string, submitData: SubmitTestDto): Promise<ApiResponse<TestAttempt>> {
    try {
      const { attempt_id, answers, time_taken_minutes } = submitData;

      console.log(`Looking up test attempt with id: ${attempt_id} for user: ${userId}`);
      
      // First, get the basic test attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('id', attempt_id)
        .eq('user_id', userId)
        .single();

      if (attemptError) {
        console.error("Error fetching test attempt:", attemptError);
        throw new Error(`Test attempt not found: ${attemptError.message}`);
      }
      
      if (!attempt) {
        throw new Error("Test attempt not found");
      }

      console.log("Found test attempt:", attempt);

      // Get the test details
      const { data: testData, error: testError } = await supabase
        .from('lesson_tests')
        .select('*')
        .eq('id', attempt.test_id)
        .single();

      if (testError || !testData) {
        console.error("Error fetching test:", testError);
        throw new Error(`Test not found: ${testError?.message || 'No test data'}`);
      }

      console.log("Found test:", testData);

      // Get the test questions
      const { data: questions, error: questionsError } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_id', attempt.test_id)
        .order('order_index');

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        throw new Error(`Questions not found: ${questionsError.message}`);
      }

      console.log("Found questions:", questions?.length || 0);

      // Create the combined attempt object to match the expected structure
      const combinedAttempt = {
        ...attempt,
        test: {
          ...testData,
          questions: questions || []
        }
      };

      // Calculate score
      const { score, correctAnswers, detailedAnswers } = this.calculateTestScore(
        answers,
        combinedAttempt.test.questions
      );

      const passed = score >= combinedAttempt.test.passing_percentage;

      console.log(`Test score: ${score}%, passed: ${passed}, required: ${combinedAttempt.test.passing_percentage}%`);

      // Update test attempt
      const { data: updatedAttempt, error: updateError } = await supabase
        .from('test_attempts')
        .update({
          score,
          total_questions: combinedAttempt.test.questions.length,
          correct_answers: correctAnswers,
          time_taken_minutes,
          answers: detailedAnswers,
          passed,
          completed_at: new Date().toISOString(),
        })
        .eq('id', attempt_id)
        .select('*')
        .maybeSingle();

      if (updateError) throw updateError;
      // If no row is returned, log a warning and use the original attempt with calculated values
      let updatedAttemptRecord = null;
      if (!updatedAttempt) {
        console.warn('No test attempt rows updated. Attempt may not exist or was already updated. Returning original attempt with calculated score.');
        // Update the original attempt with our calculated values
        updatedAttemptRecord = {
          ...attempt,
          score,
          total_questions: combinedAttempt.test.questions.length,
          correct_answers: correctAnswers,
          time_taken_minutes,
          answers: detailedAnswers,
          passed,
          completed_at: new Date().toISOString(),
        };
      } else if (Array.isArray(updatedAttempt) && updatedAttempt.length > 0) {
        updatedAttemptRecord = updatedAttempt[0];
      } else {
        updatedAttemptRecord = updatedAttempt;
      }

      // Update lesson progress whether test passed or failed
      console.log(`Updating lesson progress for lesson ${combinedAttempt.lesson_id} with score ${score}%`);
      
      try {
        // Direct update of lesson progress to avoid issues with the complex upsert logic
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: userId,
            lesson_id: combinedAttempt.lesson_id,
            status: passed ? 'completed' : 'in_progress',
            test_passed: passed,
            completed_at: passed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            // Set defaults for required fields
            content_viewed: true,
            examples_practiced: false,
            total_study_time_minutes: 0,
            bookmarks: [],
            notes: '',
            created_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,lesson_id',
            ignoreDuplicates: false
          });

        if (progressError) {
          console.error('Error updating lesson progress:', progressError);
        } else {
          console.log('Lesson progress updated successfully');
        }
      } catch (progressError) {
        console.error('Error updating lesson progress:', progressError);
        // Don't throw here - we still want to return the test result even if progress update fails
      }

      // Unlock next lesson only if test passed - do this locally and update database
      if (passed) {
        console.log('Test passed! Unlocking next lesson...');
        try {
          await this.unlockNextLessonDirect(userId, combinedAttempt.lesson_id);
          console.log('Next lesson unlocked successfully');
        } catch (unlockError) {
          console.error('Error unlocking next lesson:', unlockError);
          // Don't throw here either - test was still passed
        }
      }

      return {
        data: updatedAttemptRecord,
        error: null,
        success: true,
        message: passed ? 'Test passed! Lesson completed.' : 'Test completed. Try again to pass.',
      };
    } catch (error) {
      console.error('Error submitting test:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to submit test',
        success: false,
      };
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Process lessons to determine lock status - simplified approach
   */
  private static async processLessonsLockStatus(
    lessons: any[],
    userId?: string
  ): Promise<LearningLesson[]> {
    if (!userId) {
      // If no user, all lessons except first are locked
      return lessons.map((lesson, index) => ({
        ...lesson,
        is_locked: index > 0,
      }));
    }

    // Get user's lesson progress for all lessons in one query
    const { data: progressData } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id, status, test_passed')
      .eq('user_id', userId)
      .in('lesson_id', lessons.map(l => l.id));

    const progressMap = new Map(progressData?.map(p => [p.lesson_id, p]) || []);

    return lessons.map((lesson, index) => {
      let isLocked = false;
      
      if (index === 0) {
        // First lesson is always unlocked
        isLocked = false;
      } else {
        // Lesson is unlocked if user has a progress record for it
        const hasProgress = progressMap.has(lesson.id);
        isLocked = !hasProgress;
      }

      return {
        ...lesson,
        is_locked: isLocked,
      } as LearningLesson;
    });
  }

  /**
   * Check if a lesson is accessible to a user
   */
  private static async checkLessonAccess(lessonId: number, userId: string): Promise<boolean> {
    // Use the new local access check method
    return await this.checkLessonAccessLocal(lessonId, userId);
  }

  /**
   * Check lesson access locally - more reliable approach
   */
  private static async checkLessonAccessLocal(lessonId: number, userId: string): Promise<boolean> {
    try {
      // Get the lesson details
      const { data: lesson, error: lessonError } = await supabase
        .from('learning_lessons')
        .select('book_id, order_index, title')
        .eq('id', lessonId)
        .single();

      if (lessonError || !lesson) {
        console.error('Error fetching lesson:', lessonError);
        return false;
      }

      // First lesson in any book is always accessible
      if (lesson.order_index === 0) {
        console.log(`Lesson ${lessonId} is the first lesson - access granted`);
        return true;
      }

      // Check if user has a progress record for this lesson (which means it was unlocked)
      const { data: progressRecord, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, status')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (progressError) {
        console.error('Error checking lesson progress:', progressError);
        return false;
      }

      // If there's a progress record, the lesson is accessible
      const hasAccess = !!progressRecord;
      console.log(`Lesson ${lessonId} access check: ${hasAccess ? 'GRANTED' : 'DENIED'}`);
      
      return hasAccess;
      
    } catch (error) {
      console.error('Error in checkLessonAccessLocal:', error);
      return false;
    }
  }

  /**
   * Check if user can take a test
   */
  private static async canUserTakeTest(
    userId: string,
    lessonId: number,
    testId: number
  ): Promise<{ allowed: boolean; reason?: string; message?: string }> {
    try {
      // Check lesson access
      const hasAccess = await this.checkLessonAccess(lessonId, userId);
      if (!hasAccess) {
        return {
          allowed: false,
          reason: 'LESSON_LOCKED',
          message: 'Complete previous lessons to unlock this test.',
        };
      }

      // Check if user has viewed content
      const { data: progress } = await supabase
        .from('user_lesson_progress')
        .select('content_viewed, test_attempts')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (!progress?.content_viewed) {
        return {
          allowed: false,
          reason: 'CONTENT_NOT_VIEWED',
          message: 'Please read the lesson content before taking the test.',
        };
      }

      // Check attempt limit
      const { data: lesson } = await supabase
        .from('learning_lessons')
        .select('max_attempts')
        .eq('id', lessonId)
        .single();

      if (lesson && progress.test_attempts >= lesson.max_attempts) {
        return {
          allowed: false,
          reason: 'ATTEMPTS_EXCEEDED',
          message: 'Maximum test attempts exceeded.',
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking test eligibility:', error);
      return {
        allowed: false,
        reason: 'UNKNOWN_ERROR',
        message: 'Unable to verify test eligibility.',
      };
    }
  }

  /**
   * Calculate test score
   */
  private static calculateTestScore(
    userAnswers: { question_id: number; user_answer: string; time_taken_seconds?: number }[],
    questions: TestQuestion[]
  ): { score: number; correctAnswers: number; detailedAnswers: any[] } {
    let correctAnswers = 0;
    const detailedAnswers = userAnswers.map(answer => {
      const question = questions.find(q => q.id === answer.question_id);
      const isCorrect = question?.correct_answer === answer.user_answer;
      
      if (isCorrect) correctAnswers++;

      return {
        question_id: answer.question_id,
        user_answer: answer.user_answer,
        correct_answer: question?.correct_answer,
        is_correct: isCorrect,
        points_earned: isCorrect ? (question?.points || 1) : 0,
        time_taken_seconds: answer.time_taken_seconds,
      };
    });

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const earnedPoints = detailedAnswers.reduce((sum, a) => sum + a.points_earned, 0);
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    return {
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      correctAnswers,
      detailedAnswers,
    };
  }

  /**
   * Directly unlock the next lesson after passing a test - simpler approach
   */
  private static async unlockNextLessonDirect(userId: string, currentLessonId: number): Promise<void> {
    try {
      console.log(`Directly unlocking next lesson after lesson ${currentLessonId} for user ${userId}`);
      
      // Get current lesson details
      const { data: currentLesson, error: currentError } = await supabase
        .from('learning_lessons')
        .select('book_id, order_index')
        .eq('id', currentLessonId)
        .single();

      if (currentError || !currentLesson) {
        console.error('Error fetching current lesson:', currentError);
        return;
      }

      console.log(`Current lesson: book_id=${currentLesson.book_id}, order_index=${currentLesson.order_index}`);

      // Get the next lesson in the same book
      const { data: nextLesson, error: nextError } = await supabase
        .from('learning_lessons')
        .select('id, title')
        .eq('book_id', currentLesson.book_id)
        .eq('order_index', currentLesson.order_index + 1)
        .single();

      if (nextError || !nextLesson) {
        console.log('No next lesson found (end of book or error):', nextError?.message);
        // If this was the last lesson in the book, mark book as completed
        console.log(`User ${userId} completed book ${currentLesson.book_id}!`);
        return;
      }

      console.log(`Found next lesson: ${nextLesson.id} - ${nextLesson.title}`);
      
      // Create/update progress record for the next lesson to mark it as accessible
      const { error: updateError } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: nextLesson.id,
          status: 'not_started', // Mark as available but not started
          content_viewed: false,
          examples_practiced: false,
          test_passed: false,
          total_study_time_minutes: 0,
          bookmarks: [],
          notes: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id',
          ignoreDuplicates: false // Update if exists
        });

      if (updateError) {
        console.error('Error creating next lesson access:', updateError);
      } else {
        console.log(`Successfully unlocked next lesson ${nextLesson.id} for user ${userId}`);
      }
      
    } catch (error) {
      console.error('Error in unlockNextLessonDirect:', error);
    }
  }

  /**
   * Unlock the next lesson after completing current one
   */
  private static async unlockNextLesson(userId: string, currentLessonId: number): Promise<void> {
    try {
      console.log(`Unlocking next lesson after lesson ${currentLessonId} for user ${userId}`);
      
      const { data: currentLessons, error: currentError } = await supabase
        .from('learning_lessons')
        .select('book_id, order_index')
        .eq('id', currentLessonId);

      if (currentError) {
        console.error('Error fetching current lesson:', currentError);
        return;
      }

      if (!currentLessons || currentLessons.length === 0) {
        console.log('Current lesson not found');
        return;
      }

      const currentLesson = currentLessons[0];
      console.log(`Current lesson: book_id=${currentLesson.book_id}, order_index=${currentLesson.order_index}`);

      const { data: nextLessons, error: nextError } = await supabase
        .from('learning_lessons')
        .select('id')
        .eq('book_id', currentLesson.book_id)
        .eq('order_index', currentLesson.order_index + 1);

      if (nextError) {
        console.error('Error fetching next lesson:', nextError);
        return;
      }

      if (nextLessons && nextLessons.length > 0) {
        const nextLesson = nextLessons[0];
        console.log(`Found next lesson: ${nextLesson.id}`);
        
        // Try to update the next lesson's status
        const { data: updateResult, error: updateError } = await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: userId,
            lesson_id: nextLesson.id,
            status: 'not_started',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            content_viewed: false,
            examples_practiced: false,
            test_passed: false,
            total_study_time_minutes: 0,
            bookmarks: [],
            notes: ''
          }, {
            onConflict: 'user_id,lesson_id',
            ignoreDuplicates: false
          })
          .select('*');

        if (updateError) {
          console.error('Error updating next lesson progress:', updateError);
        } else {
          console.log('Successfully unlocked next lesson:', updateResult);
        }
      } else {
        console.log('No next lesson found (end of book)');
        // If this was the last lesson in the book, we could unlock the next book here
        // For now, just log that the user completed the book
        console.log(`User ${userId} completed book ${currentLesson.book_id}!`);
      }
    } catch (error) {
      console.error('Error unlocking next lesson:', error);
    }
  }

  /**
   * Get all lessons (admin)
   */
  static async getAllLessons(): Promise<ApiResponse<LearningLesson[]>> {
    try {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select(`
          *,
          book:learning_books(id, title)
        `)
        .eq('is_active', true)
        .order('book_id', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error getting all lessons:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get lessons',
        success: false,
      };
    }
  }

  /**
   * Get all tests (admin)
   */
  static async getAllTests(): Promise<ApiResponse<LessonTest[]>> {
    try {
      const { data, error } = await supabase
        .from('lesson_tests')
        .select(`
          *,
          lesson:learning_lessons(
            id,
            title,
            book:learning_books(id, title)
          )
        `)
        .eq('is_active', true)
        .order('id', { ascending: true });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error getting all tests:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get tests',
        success: false,
      };
    }
  }
}
