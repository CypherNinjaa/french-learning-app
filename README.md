# 🇫🇷 French Learning App

A comprehensive, gamified French language learning application built with React Native, featuring AI-powered learning assistance, interactive lessons, and a complete progress tracking system.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.79.4-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)
![Expo](https://img.shields.io/badge/Expo-SDK%2053-black.svg)

## 📱 Overview

The French Learning App is a modern, feature-rich language learning platform that combines traditional pedagogical methods with cutting-edge technology. Designed for learners of all levels, it offers an immersive French learning experience through interactive lessons, AI-powered conversation practice, and comprehensive progress tracking.

### 🎯 Key Highlights

- **Complete Learning System**: From beginner greetings to advanced conversation
- **AI-Powered Features**: Real-time grammar correction and personalized learning
- **Gamification**: Points, streaks, achievements, and leaderboards
- **Offline-First**: Core functionality works without internet connection
- **Multi-Platform**: Native iOS, Android, and Web support

## ✨ Features

### 🎓 Learning Content & Curriculum

#### **Structured Learning Path**
- **Multi-Level System**: Beginner, Intermediate, and Advanced levels
- **Modular Approach**: Organized into focused learning modules
- **Progressive Difficulty**: Carefully crafted lesson progression
- **Comprehensive Content**: Covers vocabulary, grammar, pronunciation, and culture

#### **Interactive Lesson Types**
- **Vocabulary Lessons**: Word learning with visual and audio aids
- **Grammar Modules**: Step-by-step grammar explanations with examples
- **Pronunciation Practice**: Text-to-speech with speed controls
- **Conversation Scenarios**: Real-world dialogue practice
- **Cultural Lessons**: French culture and etiquette insights

#### **Rich Question Types**
- Multiple choice questions with instant feedback
- Fill-in-the-blank exercises with hint system
- Drag-and-drop vocabulary matching
- Text input validation with smart correction
- Image-based questions for visual learning
- Audio comprehension exercises

### 🤖 AI-Powered Learning

#### **Conversational AI Assistant**
- Real-time French conversation practice
- Context-aware responses and corrections
- Personalized learning recommendations
- Dynamic content generation based on user level

#### **Smart Grammar Correction**
- Instant grammar feedback during exercises
- Explanation of grammatical rules and exceptions
- Contextual correction suggestions
- Progress tracking for grammar improvement

### 🎮 Gamification System

#### **Comprehensive Points System**
- **Lesson Completion**: 10-25 points based on performance
- **Perfect Scores**: Bonus points for 100% accuracy
- **Speed Bonuses**: Rewards for quick completion
- **Daily Activities**: Login streaks and daily goal completion
- **Social Engagement**: Points for community participation

#### **Level Progression**
- **11+ Levels**: From Débutant to Grand Maître
- **Unlock System**: New content and features at each level
- **Visual Progress**: Experience bars and achievement galleries
- **Streak Multipliers**: Enhanced rewards for consistency

#### **Achievement System**
- **Progress Achievements**: Milestone rewards for lesson completion
- **Skill Achievements**: Specialized badges for different competencies
- **Streak Achievements**: Recognition for consistent learning
- **Hidden Achievements**: Special rewards for unique accomplishments
- **Seasonal Badges**: Time-limited special achievements

#### **Leaderboards & Competition**
- **Multiple Leaderboard Types**: Daily, weekly, monthly, and all-time
- **Skill-Based Rankings**: Separate boards for different competencies
- **Level-Based Leagues**: Fair competition within skill ranges
- **Social Features**: Friend challenges and group competitions

### 🎵 Audio & Pronunciation

#### **Text-to-Speech Engine**
- **Multiple French Voices**: Choose from various native speakers
- **Speed Controls**: Slow, normal, fast, and very fast playback
- **Word-by-Word Pronunciation**: Letter-by-letter spelling support
- **Phonetic Transcriptions**: IPA notation for accurate pronunciation

#### **Pronunciation Training**
- Interactive pronunciation exercises
- Real-time feedback on pronunciation accuracy
- Recording and playback functionality
- Progress tracking for pronunciation improvement

### 📊 Progress Tracking & Analytics

#### **Comprehensive Dashboard**
- **Performance Metrics**: Detailed statistics on learning progress
- **Visual Analytics**: Charts and graphs for progress visualization
- **Strength Analysis**: Identification of strong and weak areas
- **Time Tracking**: Study time and session analytics
- **Completion Rates**: Module and lesson completion tracking

#### **Personalized Recommendations**
- AI-generated study suggestions based on performance
- Adaptive difficulty adjustment
- Personalized review schedules
- Weakness-focused practice recommendations

### 🌟 User Experience

#### **Modern Interface Design**
- **Responsive Design**: Optimized for all screen sizes
- **Theme Support**: Dark and light mode with automatic switching
- **Smooth Animations**: Engaging micro-interactions and transitions
- **Intuitive Navigation**: User-friendly interface design
- **Accessibility**: Support for screen readers and accessibility features

#### **Authentication & Profile Management**
- Secure user registration and authentication
- Password reset functionality with email verification
- Comprehensive profile management
- Avatar upload and customization options
- Session persistence across app restarts

### 📱 Platform Features

#### **Cross-Platform Compatibility**
- Native iOS and Android applications
- Progressive Web App (PWA) support
- Synchronized data across all platforms
- Offline functionality with automatic sync

#### **Performance Optimization**
- Efficient data caching and storage
- Optimized image and audio loading
- Background data synchronization
- Battery-efficient design patterns

## 🛠️ Tech Stack

### **Frontend Framework**
- **React Native 0.79.4**: Cross-platform mobile development
- **Expo SDK 53**: Streamlined development and deployment
- **TypeScript 5.8.3**: Type-safe development with enhanced IDE support
- **React 19.0.0**: Latest React features and performance improvements

### **Navigation & State Management**
- **React Navigation 7**: Advanced navigation with stack and tab navigators
- **React Context API**: Centralized state management
- **AsyncStorage**: Local data persistence and caching

### **Backend & Database**
- **Supabase**: Backend-as-a-Service with PostgreSQL database
- **Real-time Subscriptions**: Live data updates and synchronization
- **Row Level Security (RLS)**: Secure data access control
- **File Storage**: Avatar and media file management

### **AI & Language Processing**
- **Groq SDK 0.25.0**: High-performance AI language processing
- **Real-time Grammar Checking**: Advanced language analysis
- **Conversational AI**: Context-aware dialogue systems

### **Audio & Media**
- **Expo Speech 13.1.7**: Text-to-speech functionality
- **Expo AV 15.1.6**: Audio playback and recording
- **Multiple Voice Support**: Native French speaker voices
- **Audio Caching**: Optimized audio loading and storage

### **UI/UX Components**
- **Expo Linear Gradient**: Beautiful gradient backgrounds
- **React Native Gesture Handler**: Smooth touch interactions
- **Safe Area Context**: Proper handling of device safe areas
- **Custom Components**: Reusable UI component library

### **Development Tools**
- **TypeScript**: Full type safety and enhanced development experience
- **Babel**: Modern JavaScript compilation
- **Metro**: React Native bundler with optimization
- **ESLint & Prettier**: Code quality and formatting tools

## 📁 Project Structure

```
french-learning-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (buttons, inputs)
│   │   ├── lesson/         # Lesson-specific components
│   │   └── gamification/   # Achievement and progress components
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── learning/      # Learning and lesson screens
│   │   ├── profile/       # User profile and settings
│   │   └── admin/         # Admin management screens
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigation.tsx
│   │   └── TabNavigation.tsx
│   ├── services/           # API and external service integrations
│   │   ├── supabase.ts    # Supabase configuration
│   │   ├── groqService.ts  # AI service integration
│   │   └── audioService.ts # Audio playback services
│   ├── contexts/           # React contexts for state management
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ProgressContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProgress.ts
│   │   └── useAudio.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── UserTypes.ts
│   │   ├── LessonTypes.ts
│   │   └── GameTypes.ts
│   ├── utils/              # Utility functions
│   │   ├── deepLinkHandler.ts
│   │   ├── audioUtils.ts
│   │   └── formatters.ts
│   └── constants/          # App constants and configuration
│       ├── theme.ts
│       ├── gameRules.ts
│       └── lessonData.ts
├── assets/                 # Static assets
│   ├── images/            # App images and icons
│   ├── audio/             # Audio files and pronunciation guides
│   └── fonts/             # Custom fonts
├── docs/                   # Comprehensive documentation
│   ├── Gamification-System-Rules.md
│   ├── User-Access-Summary.md
│   └── development-guides/
├── supabase/              # Database configuration
│   ├── migrations/        # Database schema migrations
│   └── setup.sql         # Initial database setup
└── scripts/               # Build and deployment scripts
    ├── test-scripts/      # Automated testing scripts
    └── setup-scripts/     # Environment setup utilities
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Expo CLI** (`npm install -g @expo/cli`)
- **Supabase Account** (for backend services)
- **iOS Simulator** (for iOS development)
- **Android Studio** (for Android development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/CypherNinjaa/french-learning-app.git
cd french-learning-app/french-learning-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

4. **Configure Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to `.env`
   - Run the database setup script in Supabase SQL Editor:
   ```sql
   -- Copy and run the contents of supabase-setup.sql
   ```

5. **Start the development server**
```bash
npm start
```

### Development Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web

# Type checking
npm run type-check

# Run integration tests
npm run test:stage-4-3
```

## 📱 Platform Support

### iOS
- **Minimum Version**: iOS 13.0+
- **Native Features**: Full iOS integration with native components
- **App Store Ready**: Production-ready iOS build configuration

### Android
- **Minimum SDK**: Android 6.0 (API level 23)
- **Target SDK**: Latest Android version
- **Google Play Ready**: Optimized for Play Store distribution

### Web
- **Progressive Web App**: Installable web application
- **Responsive Design**: Optimized for desktop and mobile browsers
- **Cross-Browser Support**: Chrome, Firefox, Safari, Edge

## 🎯 Learning Methodology

### Pedagogical Approach
- **Communicative Method**: Focus on real-world communication skills
- **Task-Based Learning**: Practical exercises and scenarios
- **Spaced Repetition**: Scientifically-backed review scheduling
- **Adaptive Learning**: AI-powered personalization based on performance

### Content Philosophy
- **Cultural Integration**: Learn language through cultural context
- **Practical Focus**: Emphasis on everyday, useful French
- **Progressive Complexity**: Carefully structured learning progression
- **Multi-Modal Learning**: Visual, auditory, and kinesthetic elements

## 🔒 Privacy & Security

### Data Protection
- **GDPR Compliance**: Full compliance with European data protection laws
- **Local Data Storage**: Sensitive data stored locally when possible
- **Encrypted Transmission**: All data transmitted using HTTPS/WSS
- **Minimal Data Collection**: Only collect necessary user information

### Authentication Security
- **Secure Authentication**: Industry-standard authentication protocols
- **Password Protection**: Secure password hashing and storage
- **Session Management**: Secure session handling and timeout
- **Two-Factor Authentication**: Optional 2FA for enhanced security

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting pull requests.

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Write comprehensive tests for new features
- Update documentation for significant changes

### Code Style
- Use TypeScript for all new code
- Follow React Native and Expo conventions
- Implement proper error handling
- Write clear, self-documenting code

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **User Guides**: Comprehensive user documentation
- **Developer Docs**: Technical implementation guides
- **API Reference**: Complete API documentation

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community discussions and Q&A
- **Wiki**: Community-maintained documentation

### Contact
- **Developer**: [@CypherNinjaa](https://github.com/CypherNinjaa)
- **Project**: [French Learning App](https://github.com/CypherNinjaa/french-learning-app)

---

**Created with ❤️ by CypherNinjaa**

*Empowering French language learners worldwide through innovative technology and comprehensive educational content.*
