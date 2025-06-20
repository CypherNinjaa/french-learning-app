# French Learning App - Gamification System Rules

## Overview

This document defines the complete gamification system for the French Learning App, including levels, points, streaks, achievements, and progression mechanics. These rules ensure consistent implementation across all features and provide a clear framework for user engagement and motivation.

---

## 🎯 Points System

### Point Earning Rules

#### Lesson Completion

- **Basic Lesson Completion:** 10 points
- **Perfect Score (100%):** +5 bonus points (15 total)
- **First Attempt Perfect:** +10 bonus points (25 total)
- **Speed Bonus:** +5 points if completed in under 2 minutes
- **Review Lesson:** 5 points (50% of original)

#### Question Types

- **Multiple Choice (Correct):** 2 points
- **Fill-in-the-Blank (Correct):** 3 points
- **Pronunciation Practice:** 4 points
- **Conversation Practice:** 5 points
- **Grammar Exercise:** 3 points
- **Vocabulary Match:** 2 points

#### Daily Activities

- **Daily Login:** 5 points
- **First Lesson of the Day:** +5 bonus points
- **Complete Daily Goal:** 20 points
- **Consecutive Days (Streak Bonus):** See Streak System

#### Social & Engagement

- **Share Achievement:** 10 points
- **Help Another User (Future Feature):** 15 points
- **Community Participation:** 5-25 points

### Point Deduction Rules

- **Wrong Answer:** -1 point (minimum 0)
- **Skip Question:** -2 points (minimum 0)
- **Hint Usage:** -1 point per hint

### Daily Point Caps

- **Maximum Daily Points:** 500 points
- **Streak Bonus:** No daily cap
- **Achievement Points:** No daily cap

---

## 📈 Level System

### Level Progression

| Level | Title                        | Points Required  | Cumulative Points | Unlock Features       |
| ----- | ---------------------------- | ---------------- | ----------------- | --------------------- |
| 1     | Débutant (Beginner)          | 0                | 0                 | Basic lessons         |
| 2     | Novice                       | 100              | 100               | Audio exercises       |
| 3     | Apprenti (Apprentice)        | 200              | 300               | Grammar basics        |
| 4     | Étudiant (Student)           | 300              | 600               | Conversation practice |
| 5     | Intermédiaire (Intermediate) | 500              | 1,100             | Advanced grammar      |
| 6     | Pratiquant (Practitioner)    | 750              | 1,850             | Cultural lessons      |
| 7     | Compétent (Competent)        | 1,000            | 2,850             | Business French       |
| 8     | Avancé (Advanced)            | 1,500            | 4,350             | Literature basics     |
| 9     | Expert                       | 2,000            | 6,350             | Advanced conversation |
| 10    | Maître (Master)              | 3,000            | 9,350             | All features unlocked |
| 11+   | Grand Maître (Grand Master)  | +3,000 per level | -                 | Prestige levels       |

### Level Benefits

- **New Content Unlock:** Each level unlocks new lesson types
- **Streak Multiplier:** Higher levels get better streak bonuses
- **Achievement Access:** Some achievements require minimum levels
- **Leaderboard Tiers:** Separate leaderboards for level ranges
- **Customization Options:** Avatar items, themes unlock by level

---

## 🔥 Streak System

### Streak Calculation Rules

#### Daily Streak Requirements

- **Minimum Activity:** Complete at least 1 lesson OR earn 20 points
- **Streak Window:** 24-hour rolling window from last activity
- **Grace Period:** 6-hour buffer after midnight for streak maintenance
- **Freeze Option:** Use streak freeze (earned or purchased) to maintain streak

#### Streak Bonuses

| Streak Days | Bonus Multiplier | Special Reward             |
| ----------- | ---------------- | -------------------------- |
| 1-6 days    | 1.0x             | None                       |
| 7 days      | 1.2x             | 50 bonus points            |
| 14 days     | 1.3x             | Achievement unlock         |
| 30 days     | 1.5x             | Streak freeze + 100 points |
| 60 days     | 1.7x             | Premium feature trial      |
| 100 days    | 2.0x             | Exclusive badge            |
| 365 days    | 2.5x             | Master streak badge        |

#### Streak Freeze System

- **Earn Conditions:** 7-day streak, certain achievements, or purchase
- **Usage:** Maintain streak for 1 day without activity
- **Limit:** Maximum 5 freezes stored at once
- **Cool-down:** 7 days between earned freezes

### Streak Recovery

- **Broken Streak:** Starts from day 1
- **Weekend Protection:** Optional setting to pause streaks on weekends
- **Vacation Mode:** Temporary streak pause (premium feature)

---

## 🏆 Achievement System

### Achievement Categories

#### Progress Achievements

- **First Steps:** Complete first lesson (10 points)
- **Getting Started:** Complete 10 lessons (50 points)
- **Dedicated Learner:** Complete 100 lessons (200 points)
- **Lesson Master:** Complete 500 lessons (500 points)

#### Streak Achievements

- **Consistent:** 7-day streak (100 points)
- **Committed:** 30-day streak (300 points)
- **Devoted:** 100-day streak (1000 points)
- **Legendary:** 365-day streak (2500 points)

#### Skill Achievements

- **Vocabulary Novice:** Learn 50 words (100 points)
- **Word Collector:** Learn 500 words (500 points)
- **Grammar Guru:** Master all basic grammar (300 points)
- **Pronunciation Pro:** Perfect pronunciation 100 times (400 points)

#### Speed Achievements

- **Quick Learner:** Complete lesson in under 1 minute (50 points)
- **Speed Demon:** Complete 10 lessons under 2 minutes each (200 points)
- **Lightning Fast:** Average lesson time under 90 seconds (500 points)

#### Perfect Score Achievements

- **Perfectionist:** 10 perfect scores (100 points)
- **Flawless:** 50 perfect scores (300 points)
- **Untouchable:** 100 perfect scores (750 points)

#### Social Achievements (Future)

- **Helper:** Help 10 other users (200 points)
- **Mentor:** Achieve top 10% in community rankings (500 points)
- **Community Leader:** Organize study group (1000 points)

### Hidden Achievements

- **Night Owl:** Complete lesson after midnight (100 points)
- **Early Bird:** Complete lesson before 6 AM (100 points)
- **Weekend Warrior:** Complete 10 lessons on weekend (150 points)
- **Holiday Spirit:** Use app on major holidays (75 points)

---

## 🎯 Daily Goals System

### Adaptive Daily Goals

- **Beginner (Levels 1-3):** 1 lesson or 20 points
- **Intermediate (Levels 4-6):** 2 lessons or 40 points
- **Advanced (Levels 7-10):** 3 lessons or 60 points
- **Master (Level 11+):** 5 lessons or 100 points

### Goal Completion Rewards

- **Standard Goal:** 20 points + streak maintenance
- **Exceed Goal (2x):** +10 bonus points
- **Exceed Goal (3x):** +25 bonus points
- **Perfect Week:** All 7 daily goals met (+100 bonus points)

### Customizable Goals

- **User Choice:** Set personal daily point target
- **Minimum:** 10 points per day
- **Maximum:** 200 points per day
- **Adjustment:** Weekly goal review and adjustment

---

## 🏅 Badge System

### Badge Types

#### Progress Badges

- **Bronze:** First milestone in category
- **Silver:** Intermediate milestone
- **Gold:** Advanced milestone
- **Platinum:** Master milestone
- **Diamond:** Legendary milestone

#### Special Badges

- **Comeback Kid:** Return after 30+ day absence
- **Study Buddy:** Use app with friend (future feature)
- **Beta Tester:** Participated in beta testing
- **Founder:** Among first 1000 users
- **Supporter:** Purchased premium features

#### Seasonal Badges

- **New Year Motivation:** Active during first week of January
- **Summer Scholar:** Complete 100 lessons in summer
- **Holiday Learner:** Maintain streak through holidays

---

## 📊 Leaderboard System

### Leaderboard Types

#### Time-Based

- **Daily:** Points earned today
- **Weekly:** Points earned this week (Monday-Sunday)
- **Monthly:** Points earned this month
- **All-Time:** Total career points

#### Skill-Based

- **Vocabulary Leaders:** Most words learned
- **Grammar Masters:** Best grammar scores
- **Pronunciation Pros:** Best pronunciation scores
- **Speed Champions:** Fastest lesson completion

#### Level-Based

- **Beginner League:** Levels 1-3
- **Intermediate League:** Levels 4-6
- **Advanced League:** Levels 7-10
- **Master League:** Level 11+

### Leaderboard Rewards

- **Daily Top 3:** 50, 30, 20 bonus points
- **Weekly Top 3:** 200, 150, 100 bonus points
- **Monthly Top 3:** Special badges + 500, 350, 250 points
- **All-Time Top 10:** Permanent profile badge

---

## 🎮 Gamification Mechanics

### Progress Visualization

- **Experience Bar:** Visual progress to next level
- **Streak Flame:** Animated streak counter
- **Achievement Gallery:** Visual achievement display
- **Progress Graphs:** Weekly/monthly progress charts

### Feedback Systems

- **Instant Feedback:** Points popup after each correct answer
- **Level Up Animation:** Celebratory animation for level increases
- **Achievement Toast:** Notification when achievement earned
- **Streak Celebration:** Special animation for milestone streaks

### Motivation Mechanics

- **Near-Miss Messaging:** Encourage when close to goals
- **Comeback Rewards:** Bonus points for returning users
- **Progress Sharing:** Social media integration for achievements
- **Personal Records:** Track and celebrate personal bests

---

## 🗄️ Database Requirements

### Core Tables

```sql
-- User Statistics (extends profiles table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 20;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freezes INTEGER DEFAULT 0;

-- Points History
CREATE TABLE points_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  points_earned INTEGER NOT NULL,
  points_type TEXT NOT NULL, -- 'lesson', 'streak', 'achievement', etc.
  source_id INTEGER, -- lesson_id, achievement_id, etc.
  earned_at TIMESTAMP DEFAULT NOW()
);

-- Daily Stats
CREATE TABLE daily_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  points_earned INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  perfect_scores INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,
  goal_met BOOLEAN DEFAULT false,
  UNIQUE(user_id, date)
);

-- Achievements
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL,
  points_reward INTEGER DEFAULT 0,
  badge_type TEXT DEFAULT 'bronze',
  is_hidden BOOLEAN DEFAULT false,
  requirements JSONB NOT NULL
);

-- User Achievements
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  achievement_id INTEGER REFERENCES achievements(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Leaderboards (materialized view)
CREATE MATERIALIZED VIEW leaderboard_daily AS
SELECT
  user_id,
  profiles.username,
  profiles.current_level,
  SUM(points_earned) as daily_points,
  RANK() OVER (ORDER BY SUM(points_earned) DESC) as rank
FROM points_history
JOIN profiles ON points_history.user_id = profiles.id
WHERE DATE(earned_at) = CURRENT_DATE
GROUP BY user_id, profiles.username, profiles.current_level;
```

---

## 🔧 Implementation Notes

### Point Calculation Priority

1. Base points for activity
2. Apply streak multiplier
3. Add level bonuses
4. Apply daily caps
5. Log to points_history table

### Streak Management

- Calculate daily at midnight UTC
- Update user stats atomically
- Send push notifications for streak risks
- Handle timezone differences properly

### Achievement Checking

- Check after each point-earning activity
- Use efficient queries to avoid performance issues
- Batch process for daily/weekly achievements
- Send push notifications for new achievements

### Performance Considerations

- Cache current user stats in memory
- Use materialized views for leaderboards
- Batch update operations where possible
- Implement proper indexing on frequently queried columns

---

## 🚀 Future Enhancements

### Advanced Features (Stage 10+)

- **Seasonal Events:** Limited-time challenges with special rewards
- **Guild System:** Team-based competitions and achievements
- **Mastery Levels:** Advanced progression beyond level 10
- **Personalized Challenges:** AI-generated goals based on user behavior
- **Social Streaks:** Shared streaks with friends
- **Learning Tournaments:** Competitive events with premium rewards

### Analytics Integration

- **Engagement Metrics:** Track which gamification elements drive engagement
- **A/B Testing:** Test different point values and reward structures
- **Churn Prediction:** Use gamification data to predict and prevent churn
- **Personalization:** Adapt rewards based on individual user preferences

---

This gamification system is designed to be:

- **Progressive:** Rewards increase with user commitment
- **Balanced:** No single strategy dominates point earning
- **Engaging:** Multiple ways to earn rewards and progress
- **Fair:** Clear rules that apply consistently to all users
- **Scalable:** Can accommodate millions of users and activities

The system should be implemented gradually, starting with basic points and levels in Stage 3, then expanding with achievements and social features in later stages.
