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

      // For admin, just return the lessons as-is without lock processing
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

      // Check if lesson is accessible to user (simplified check)
      if (userId) {
        // For now, just check if it's the first lesson or user has progress
        if (data.order_index > 0) {
          const { data: progressData } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('lesson_id', lessonId)
            .maybeSingle();
          
          if (!progressData) {
            return {
              data: null,
              error: 'LESSON_LOCKED',
              success: false,
              message: 'This lesson is locked. Complete previous lessons first.',
            };
          }
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
      console.log('🔍 [LearningService] Creating lesson with data:', JSON.stringify(lessonData, null, 2));
      
      // Get current user for created_by field
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('❌ [LearningService] Error getting user:', userError);
        throw new Error(`User authentication error: ${userError.message}`);
      }
      
      if (!user.user) {
        console.error('❌ [LearningService] No authenticated user found');
        throw new Error('No authenticated user found');
      }
      
      console.log('✅ [LearningService] Authenticated user:', user.user.id);

      const insertData = {
        ...lessonData,
        created_by: user.user.id,
      };
      
      console.log('📝 [LearningService] Insert data:', JSON.stringify(insertData, null, 2));

      const { data, error } = await supabase
        .from('learning_lessons')
        .insert([insertData])
        .select('*')
        .single();

      if (error) {
        console.error('❌ [LearningService] Database error creating lesson:', error);
        console.error('❌ [LearningService] Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ [LearningService] Lesson created successfully:', data);

      // Create default test for the lesson
      if (data) {
        console.log('📝 [LearningService] Creating default test for lesson...');
        
        const testResult = await this.createTest({
          lesson_id: data.id,
          title: `${data.title} - Assessment`,
          question_count: 5,
          passing_percentage: data.passing_percentage || 65,
        });
        
        if (!testResult.success) {
          console.warn('⚠️ [LearningService] Failed to create default test:', testResult.error);
        } else {
          console.log('✅ [LearningService] Default test created successfully');
        }
      }

      return {
        data,
        error: null,
        success: true,
        message: 'Lesson created successfully',
      };
    } catch (error) {
      console.error('❌ [LearningService] Error creating lesson:', error);
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

  /**
   * Admin: Get a specific test with its questions
   */
  static async getTest(testId: number): Promise<ApiResponse<LessonTest>> {
    try {
      console.log('📚 [LearningService] Getting test:', testId);
      
      const { data, error } = await supabase
        .from('lesson_tests')
        .select(`
          *,
          lesson:learning_lessons(
            id,
            title,
            book_id,
            book:learning_books(id, title)
          ),
          questions:test_questions(*)
        `)
        .eq('id', testId)
        .single();

      if (error) {
        console.error('❌ [LearningService] Error fetching test:', error);
        throw error;
      }

      console.log(`✅ [LearningService] Retrieved test: ${data?.title}`);
      
      return {
        data: data || null,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('❌ [LearningService] Error in getTest:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch test',
        success: false,
      };
    }
  }

  /**
   * Admin: Update a test
   */
  static async updateTest(testId: number, updates: UpdateTestDto): Promise<ApiResponse<LessonTest>> {
    try {
      console.log('📝 [LearningService] Updating test:', testId);
      
      const { data, error } = await supabase
        .from('lesson_tests')
        .update(updates)
        .eq('id', testId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ [LearningService] Error updating test:', error);
        throw error;
      }

      console.log('✅ [LearningService] Test updated successfully');
      
      return {
        data,
        error: null,
        success: true,
        message: 'Test updated successfully',
      };
    } catch (error) {
      console.error('❌ [LearningService] Error in updateTest:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update test',
        success: false,
      };
    }
  }

  /**
   * Admin: Delete a test
   */
  static async deleteTest(testId: number): Promise<ApiResponse<void>> {
    try {
      console.log('🗑️ [LearningService] Deleting test:', testId);
      
      const { error } = await supabase
        .from('lesson_tests')
        .delete()
        .eq('id', testId);

      if (error) {
        console.error('❌ [LearningService] Error deleting test:', error);
        throw error;
      }

      console.log('✅ [LearningService] Test deleted successfully');
      
      return {
        data: undefined,
        error: null,
        success: true,
        message: 'Test deleted successfully',
      };
    } catch (error) {
      console.error('❌ [LearningService] Error in deleteTest:', error);
      return {
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to delete test',
        success: false,
      };
    }
  }

  /**
   * Admin: Update a question
   */
  static async updateQuestion(questionId: number, updates: UpdateQuestionDto): Promise<ApiResponse<TestQuestion>> {
    try {
      console.log('📝 [LearningService] Updating question:', questionId);
      
      const { data, error } = await supabase
        .from('test_questions')
        .update(updates)
        .eq('id', questionId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ [LearningService] Error updating question:', error);
        throw error;
      }

      console.log('✅ [LearningService] Question updated successfully');
      
      return {
        data,
        error: null,
        success: true,
        message: 'Question updated successfully',
      };
    } catch (error) {
      console.error('❌ [LearningService] Error in updateQuestion:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update question',
        success: false,
      };
    }
  }

  /**
   * Admin: Delete a question
   */
  static async deleteQuestion(questionId: number): Promise<ApiResponse<void>> {
    try {
      console.log('🗑️ [LearningService] Deleting question:', questionId);
      
      const { error } = await supabase
        .from('test_questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        console.error('❌ [LearningService] Error deleting question:', error);
        throw error;
      }

      console.log('✅ [LearningService] Question deleted successfully');
      
      return {
        data: undefined,
        error: null,
        success: true,
        message: 'Question deleted successfully',
      };
    } catch (error) {
      console.error('❌ [LearningService] Error in deleteQuestion:', error);
      return {
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to delete question',
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

  /**
   * Admin: Get all lessons for a specific book (without user filtering)
   */
  static async getAllLessonsForBook(bookId: number): Promise<ApiResponse<LearningLesson[]>> {
    try {
      console.log('📚 [LearningService] Getting all lessons for book:', bookId);
      
      const { data, error } = await supabase
        .from('learning_lessons')
        .select(`
          *,
          book:learning_books(id, title),
          test:lesson_tests(*)
        `)
        .eq('book_id', bookId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('❌ [LearningService] Error fetching lessons for book:', error);
        throw error;
      }

      console.log(`✅ [LearningService] Retrieved ${data?.length || 0} lessons for book ${bookId}`);
      
      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('❌ [LearningService] Error in getAllLessonsForBook:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch lessons for book',
        success: false,
      };
    }
  }

  /**
   * Admin: Get all lessons across all books
   */
  static async getAllLessons(): Promise<ApiResponse<LearningLesson[]>> {
    try {
      console.log('📚 [LearningService] Getting all lessons...');
      
      const { data, error } = await supabase
        .from('learning_lessons')
        .select(`
          *,
          book:learning_books(id, title),
          test:lesson_tests(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [LearningService] Error fetching all lessons:', error);
        throw error;
      }

      console.log(`✅ [LearningService] Retrieved ${data?.length || 0} lessons`);
      
      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('❌ [LearningService] Error in getAllLessons:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch lessons',
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

  /**
   * Admin: Get progress of all users for a specific book
   */
  static async getBookProgressOverview(bookId: number): Promise<ApiResponse<UserBookProgress[]>> {
    try {
      const { data, error } = await supabase
        .from('user_book_progress')
        .select(`
          user_id,
          user:users(
            id,
            name,
            email
          ),
          book_id,
          started_at,
          last_accessed_at,
          progress_percentage
        `)
        .eq('book_id', bookId)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;

      return {
        data: (data || []) as any[], // Casting as any[] since we're returning a subset of UserBookProgress
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching book progress overview:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch progress overview',
        success: false,
      };
    }
  }

  /**
   * Admin: Get detailed progress of a specific user
   */
  static async getUserProgressDetail(userId: string): Promise<ApiResponse<UserLessonProgress[]>> {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select(`
          *,
          lesson:learning_lessons(
            id,
            title,
            book_id,
            book:learning_books(id, title, difficulty_level)
          )
        `)
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching user progress detail:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch progress detail',
        success: false,
      };
    }
  }
}
