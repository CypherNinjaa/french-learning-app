import { Alert } from 'react-native';
import { supabase } from './supabase';
import { getConfig } from '../config/productionConfig';

interface UserLearningData {
  userId: string;
  level: string;
  weakAreas: string[];
  strongAreas: string[];
  recentMistakes: string[];
  learningHistory: any[];
  preferences: {
    difficulty: 'easy' | 'medium' | 'hard';
    focusAreas: string[];
    sessionLength: number;
  };
}

interface ExerciseRequest {
  type: 'adaptive' | 'focused' | 'quick';
  difficulty?: 'easy' | 'medium' | 'hard';
  focusArea?: string;
  count?: number;
  userContext: UserLearningData;
}

interface GeneratedExercise {
  id: string;
  type: 'vocabulary' | 'grammar' | 'pronunciation' | 'comprehension';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  focusArea: string;
  timeLimit?: number;
}

interface ConversationRequest {
  topic?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  userContext: UserLearningData;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

interface AnalysisRequest {
  userText: string;
  type: 'grammar' | 'pronunciation' | 'vocabulary';
  context?: string;
}

interface PracticeStats {
  todayMinutes: number;
  weekStreak: number;
  totalPoints: number;
  level: string;
  nextLevelProgress: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendedPractice: string[];
}

class EnhancedGroqService {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';
  
  constructor() {
    // Get API key from environment variables via config
    const config = getConfig();
    this.apiKey = config.groq.apiKey;
    
    if (!this.apiKey) {
      console.error('❌ Groq API key not found! Please check your .env file.');
      throw new Error('Groq API key is required. Please add EXPO_PUBLIC_GROQ_API_KEY to your .env file.');
    }
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Groq API request failed:', error);
      throw error;
    }
  }

  async generatePersonalizedExercises(request: ExerciseRequest): Promise<GeneratedExercise[]> {
    const prompt = this.buildExercisePrompt(request);
    
    try {
      const response = await this.makeRequest('/chat/completions', {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an expert French language teacher. Generate personalized exercises based on user data. Always respond with valid JSON.
            
            LANGUAGE GUIDELINES FOR EXERCISES:
            - For BEGINNER level: Provide instructions in English, include English translations for all French text
            - For INTERMEDIATE level: Mix English and French instructions, translate complex terms
            - For ADVANCED level: Use mostly French with English only for complex grammar explanations
            
            Always include explanations that help the user understand why answers are correct.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from Groq API');
      }

      // Clean the response to extract JSON
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const exercises = JSON.parse(jsonMatch[0]);
      return this.validateAndFormatExercises(exercises, request);
    } catch (error) {
      console.error('Error generating exercises:', error);
      return this.generateFallbackExercises(request);
    }
  }

  private buildExercisePrompt(request: ExerciseRequest): string {
    const { userContext, type, focusArea, count = 5, difficulty } = request;
    
    return `Generate ${count} French learning exercises for a ${userContext.level} level student.

User Profile:
- Level: ${userContext.level}
- Weak Areas: ${userContext.weakAreas.join(', ')}
- Strong Areas: ${userContext.strongAreas.join(', ')}

Exercise Type: ${type}
Focus Area: ${focusArea || 'mixed'}
Difficulty: ${difficulty || userContext.preferences.difficulty}

Respond with a JSON array:
[
  {
    "id": "exercise_1",
    "type": "vocabulary",
    "difficulty": "medium",
    "question": "What does 'maison' mean?",
    "options": ["House", "Car", "Tree", "Book"],
    "correctAnswer": "House",
    "explanation": "Maison means house in French.",
    "focusArea": "vocabulary",
    "timeLimit": 20
  }
]

Focus on weak areas: ${userContext.weakAreas.join(', ')}`;
  }

  async generateConversationalResponse(request: ConversationRequest): Promise<string> {
    try {
      const response = await this.makeRequest('/chat/completions', {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are a French conversation partner for a ${request.difficulty} level student. 
            
            LANGUAGE GUIDELINES:
            - For BEGINNER level: Use mostly English with simple French phrases. Always provide English translations in parentheses.
            - For INTERMEDIATE level: Use 50% French, 50% English. Provide translations for complex words.
            - For ADVANCED level: Use mostly French with occasional English explanations for complex concepts.
            
            Always be encouraging and patient. Explain grammar points when helpful.`
          },
          {
            role: 'user',
            content: `Topic: ${request.topic || 'general'}. Student level: ${request.userContext.level}. Please start or continue a conversation.`
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
      });

      return response.choices[0]?.message?.content || 'Bonjour! Comment allez-vous?';
    } catch (error) {
      console.error('Error generating conversation:', error);
      return 'Bonjour! Comment puis-je vous aider aujourd\'hui?';
    }
  }

  async analyzeUserInput(request: AnalysisRequest): Promise<{
    isCorrect: boolean;
    errors: string[];
    suggestions: string[];
    score: number;
  }> {
    try {
      const response = await this.makeRequest('/chat/completions', {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'Analyze French text for errors. Respond with JSON: {"isCorrect": boolean, "errors": [], "suggestions": [], "score": number}'
          },
          {
            role: 'user',
            content: `Analyze this French ${request.type}: "${request.userText}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error analyzing input:', error);
      return {
        isCorrect: true,
        errors: [],
        suggestions: ['Continue practicing!'],
        score: 85
      };
    }
  }

  async generatePersonalizedRecommendations(userContext: UserLearningData): Promise<string[]> {
    try {
      const response = await this.makeRequest('/chat/completions', {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `Generate 3-5 specific French learning recommendations based on user profile. Respond with JSON array of strings.
            
            LANGUAGE GUIDELINES FOR RECOMMENDATIONS:
            - For BEGINNER level: Write recommendations in English with simple, encouraging language
            - For INTERMEDIATE level: Mix English and basic French terms with translations
            - For ADVANCED level: Use French with English explanations for complex concepts
            
            Make recommendations practical and achievable for the user's current level.`
          },
          {
            role: 'user',
            content: `User level: ${userContext.level}, Weak areas: ${userContext.weakAreas.join(', ')}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [
        'Practice basic verb conjugations',
        'Review article usage (le, la, les)',
        'Focus on pronunciation of nasal sounds'
      ];
    }
  }

  private validateAndFormatExercises(exercises: any[], request: ExerciseRequest): GeneratedExercise[] {
    if (!Array.isArray(exercises)) {
      return this.generateFallbackExercises(request);
    }

    return exercises.map((exercise, index) => ({
      id: exercise.id || `generated_${Date.now()}_${index}`,
      type: exercise.type || 'vocabulary',
      difficulty: exercise.difficulty || request.difficulty || 'medium',
      question: exercise.question || 'Sample question',
      options: exercise.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: exercise.correctAnswer || exercise.options?.[0] || 'Option 1',
      explanation: exercise.explanation || 'This is the correct answer.',
      focusArea: exercise.focusArea || request.focusArea || 'general',
      timeLimit: exercise.timeLimit || 30,
    }));
  }

  private generateFallbackExercises(request: ExerciseRequest): GeneratedExercise[] {
    const fallbackExercises: GeneratedExercise[] = [
      {
        id: 'fallback_1',
        type: 'vocabulary',
        difficulty: 'medium',
        question: 'What does "bonjour" mean in English?',
        options: ['Good evening', 'Good morning', 'Good night', 'Goodbye'],
        correctAnswer: 'Good morning',
        explanation: '"Bonjour" is a French greeting used during the day.',
        focusArea: request.focusArea || 'vocabulary',
        timeLimit: 20,
      },
      {
        id: 'fallback_2',
        type: 'grammar',
        difficulty: 'medium',
        question: 'Choose the correct article: "___ chat est mignon."',
        options: ['Le', 'La', 'Les', 'Un'],
        correctAnswer: 'Le',
        explanation: '"Chat" is masculine, so we use "le".',
        focusArea: request.focusArea || 'grammar',
        timeLimit: 25,
      },
      {
        id: 'fallback_3',
        type: 'vocabulary',
        difficulty: 'easy',
        question: 'How do you say "thank you" in French?',
        options: ['Merci', 'Pardon', 'Excusez-moi', 'De rien'],
        correctAnswer: 'Merci',
        explanation: '"Merci" is the standard way to say thank you in French.',
        focusArea: request.focusArea || 'vocabulary',
        timeLimit: 15,
      },
    ];

    return fallbackExercises.slice(0, request.count || 3);
  }

  // User data management methods
  async getUserLearningData(userId: string): Promise<UserLearningData> {
    try {
      // Fetch user profile and learning data from Supabase
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      const { data: mistakes } = await supabase
        .from('user_mistakes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        userId,
        level: profile?.level || 'beginner',
        weakAreas: this.extractWeakAreas(progress || []),
        strongAreas: this.extractStrongAreas(progress || []),
        recentMistakes: mistakes?.map(m => m.content) || [],
        learningHistory: progress || [],
        preferences: {
          difficulty: profile?.preferred_difficulty || 'medium',
          focusAreas: profile?.focus_areas || [],
          sessionLength: profile?.session_length || 15,
        },
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return this.getDefaultUserData(userId);
    }
  }

  async getUserPracticeStats(userId: string): Promise<PracticeStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's practice time
      const { data: todayStats } = await supabase
        .from('practice_sessions')
        .select('duration')
        .eq('user_id', userId)
        .gte('created_at', today);

      // Get streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get user profile for level and points
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const userLearningData = await this.getUserLearningData(userId);

      return {
        todayMinutes: todayStats?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0,
        weekStreak: streakData?.current_streak || 0,
        totalPoints: profile?.total_points || 0,
        level: profile?.level || 'Beginner',
        nextLevelProgress: this.calculateLevelProgress(profile?.experience_points || 0),
        weakAreas: userLearningData.weakAreas,
        strongAreas: userLearningData.strongAreas,
        recommendedPractice: await this.generatePersonalizedRecommendations(userLearningData),
      };
    } catch (error) {
      console.error('Error fetching practice stats:', error);
      return this.getDefaultPracticeStats();
    }
  }

  private extractWeakAreas(progress: any[]): string[] {
    // Analyze progress data to identify weak areas
    const weakAreas: string[] = [];
    
    if (!progress || progress.length === 0) {
      return ['Grammar basics', 'Vocabulary'];
    }

    // Simple analysis - areas with low accuracy
    const areaScores: { [key: string]: { total: number; correct: number } } = {};
    
    progress.forEach(p => {
      const area = p.skill_area || 'general';
      if (!areaScores[area]) {
        areaScores[area] = { total: 0, correct: 0 };
      }
      areaScores[area].total++;
      if (p.is_correct) {
        areaScores[area].correct++;
      }
    });

    Object.entries(areaScores).forEach(([area, scores]) => {
      const accuracy = scores.correct / scores.total;
      if (accuracy < 0.7) { // Less than 70% accuracy
        weakAreas.push(area);
      }
    });

    return weakAreas.length > 0 ? weakAreas : ['Grammar basics'];
  }

  private extractStrongAreas(progress: any[]): string[] {
    // Similar to weak areas but for strong performance
    if (!progress || progress.length === 0) {
      return [];
    }

    const areaScores: { [key: string]: { total: number; correct: number } } = {};
    
    progress.forEach(p => {
      const area = p.skill_area || 'general';
      if (!areaScores[area]) {
        areaScores[area] = { total: 0, correct: 0 };
      }
      areaScores[area].total++;
      if (p.is_correct) {
        areaScores[area].correct++;
      }
    });

    const strongAreas: string[] = [];
    Object.entries(areaScores).forEach(([area, scores]) => {
      const accuracy = scores.correct / scores.total;
      if (accuracy > 0.85) { // More than 85% accuracy
        strongAreas.push(area);
      }
    });

    return strongAreas;
  }

  private calculateLevelProgress(experiencePoints: number): number {
    // Simple level progression calculation
    const pointsPerLevel = 1000;
    const currentLevelPoints = experiencePoints % pointsPerLevel;
    return (currentLevelPoints / pointsPerLevel) * 100;
  }

  private getDefaultUserData(userId: string): UserLearningData {
    return {
      userId,
      level: 'beginner',
      weakAreas: ['Grammar basics', 'Vocabulary'],
      strongAreas: [],
      recentMistakes: [],
      learningHistory: [],
      preferences: {
        difficulty: 'medium',
        focusAreas: ['vocabulary', 'grammar'],
        sessionLength: 15,
      },
    };
  }

  private getDefaultPracticeStats(): PracticeStats {
    return {
      todayMinutes: 0,
      weekStreak: 0,
      totalPoints: 0,
      level: 'Beginner',
      nextLevelProgress: 0,
      weakAreas: ['Grammar basics', 'Vocabulary'],
      strongAreas: [],
      recommendedPractice: [
        'Practice basic verb conjugations',
        'Learn common vocabulary',
        'Study article usage'
      ],
    };
  }

  async savePracticeSession(userId: string, sessionData: {
    type: string;
    duration: number;
    score: number;
    exercises: any[];
  }): Promise<void> {
    try {
      // Save practice session
      const { error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: userId,
          session_type: sessionData.type,
          duration: sessionData.duration,
          score: sessionData.score,
          exercises_completed: sessionData.exercises.length,
          created_at: new Date().toISOString(),
        });

      if (sessionError) throw sessionError;

      // Save individual exercise results
      const exerciseResults = sessionData.exercises.map(exercise => ({
        user_id: userId,
        exercise_type: exercise.type,
        skill_area: exercise.focusArea,
        is_correct: exercise.isCorrect,
        user_answer: exercise.userResponse,
        correct_answer: exercise.correctAnswer,
        created_at: new Date().toISOString(),
      }));

      const { error: exerciseError } = await supabase
        .from('user_progress')
        .insert(exerciseResults);

      if (exerciseError) throw exerciseError;

      // Update user experience points
      const pointsEarned = sessionData.score * 10;
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('experience_points, total_points')
        .eq('id', userId)
        .single();

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          experience_points: (currentProfile?.experience_points || 0) + pointsEarned,
          total_points: (currentProfile?.total_points || 0) + pointsEarned,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

    } catch (error) {
      console.error('Error saving practice session:', error);
    }
  }
}

export const enhancedGroqService = new EnhancedGroqService();
export type { 
  UserLearningData, 
  ExerciseRequest, 
  GeneratedExercise, 
  ConversationRequest, 
  AnalysisRequest,
  PracticeStats 
};
