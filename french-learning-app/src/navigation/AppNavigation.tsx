import React, { useRef, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { EmailVerificationScreen } from "../screens/EmailVerificationScreen";
import { ResetPasswordScreen } from "../screens/ResetPasswordScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { AdminDashboardScreen } from "../screens/AdminDashboardScreen";
import { ContentManagementDashboard } from "../screens/admin/ContentManagementDashboard";
import { VocabularyManagement } from "../screens/admin/VocabularyManagement";
import { GrammarManagement } from "../screens/admin/GrammarManagement";
import { PronunciationWordsManagement } from "../screens/admin/PronunciationWordsManagement";
import { PronunciationTestScreen } from "../screens/PronunciationTestScreen";
import { AITestScreen } from "../screens/AITestScreen";
import { PersonalizedLearningScreen } from "../screens/PersonalizedLearningScreen";
import { ConversationalAIScreen } from "../screens/ConversationalAIScreen";
import { ConversationalAITestScreen } from "../screens/ConversationalAITestScreen";
import { ThemeSettingsScreen } from "../screens/ThemeSettingsScreen";
import { GamificationScreen } from "../screens/GamificationScreen";
import { VocabularyScreen } from "../screens/VocabularyScreen";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "../constants/theme";
import { deepLinkHandler } from "../utils/deepLinkHandler";
import { SplashScreen } from "../screens/SplashScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { TabNavigation } from "./TabNavigation";
import { VocabularyPracticeScreen } from "../screens/VocabularyPracticeScreen";
import { BooksScreen } from "../screens/BooksScreen";
import { BookDetailScreen } from "../screens/BookDetailScreen";
import { LessonDetailScreen } from "../screens/LessonDetailScreen";
import { LessonTestScreen } from "../screens/LessonTestScreen";
import { BookManagementScreen } from "../screens/admin/BookManagementScreen";
import { LessonManagementScreen } from "../screens/admin/LessonManagementScreen";
import { TestManagementScreen } from "../screens/admin/TestManagementScreen";
import { GrammarRulesScreen } from "../screens/GrammarRulesScreen";
import { GrammarRuleDetailScreen } from "../screens/GrammarRuleDetailScreen";
import { AdaptivePracticeSession } from "../screens/AdaptivePracticeSession";
import { FocusedPracticeSession } from "../screens/FocusedPracticeSession";
import { QuickPracticeSession } from "../screens/QuickPracticeSession";
import { GrammarCoachScreen } from "../screens/GrammarCoachScreen";
import { PronunciationProScreen } from "../screens/PronunciationProScreen";

// --- Navigation Param List Types ---
// Auth stack for login/registration flows
export type AuthStackParamList = {
	Login: undefined;
	Register: undefined;
	ForgotPassword: undefined;
	EmailVerification: undefined;
	ResetPassword: undefined;
};

// Main app stack for all user features
export type AppStackParamList = {
	// Core
	Home: undefined;
	Profile: undefined;
	Progress: undefined;

	// Learning System
	Books: undefined;
	BookDetail: { bookId: number };
	LessonDetail: { lessonId: number; bookId: number };
	LessonTest: { lessonId: number; bookId: number };

	// Admin & Content
	AdminDashboard: undefined;
	ContentManagementDashboard: undefined;
	BookManagement: undefined;
	LessonManagement: { bookId: number; createNew?: boolean };
	TestManagement: { lessonId?: number };
	VocabularyManagement: undefined;
	GrammarManagement: undefined;
	PronunciationWordsManagement: undefined;

	// Vocabulary & Practice
	Vocabulary: undefined;
	VocabularyPractice: { words: any[]; userId: string };
	AdaptivePracticeSession: undefined;
	FocusedPracticeSession: undefined;
	QuickPracticeSession: undefined;
	PronunciationTest: undefined;
	PersonalizedLearning: undefined;
	GrammarCoach: undefined;
	PronunciationPro: undefined;

	// Grammar Rules (User-facing)
	GrammarRules: undefined;
	GrammarRuleDetail: { ruleId: number };

	// AI & Gamification
	AITest: undefined;
	ConversationalAI: undefined;
	ConversationalAITest: undefined;
	Gamification: undefined;

	// Settings
	ThemeSettings: undefined;
	Onboarding: undefined;

	// Main Tabs
	MainTabs: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();

const AuthNavigator: React.FC = () => {
	return (
		<AuthStack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<AuthStack.Screen name="Login" component={LoginScreen} />
			<AuthStack.Screen name="Register" component={RegisterScreen} />
			<AuthStack.Screen
				name="ForgotPassword"
				component={ForgotPasswordScreen}
			/>
			<AuthStack.Screen
				name="EmailVerification"
				component={EmailVerificationScreen}
			/>
			<AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
		</AuthStack.Navigator>
	);
};

const AppNavigator: React.FC = () => {
	return (
		<AppStack.Navigator screenOptions={{ headerShown: false }}>
			{/* Main Tab Navigation as the home screen */}
			<AppStack.Screen name="MainTabs" component={TabNavigation} />
			{/* Admin screens accessible from anywhere */}
			<AppStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
			<AppStack.Screen
				name="ContentManagementDashboard"
				component={ContentManagementDashboard}
			/>
			<AppStack.Screen name="BookManagement" component={BookManagementScreen} />
			<AppStack.Screen
				name="LessonManagement"
				component={LessonManagementScreen}
			/>
			<AppStack.Screen name="TestManagement" component={TestManagementScreen} />
			<AppStack.Screen
				name="VocabularyManagement"
				component={VocabularyManagement}
			/>
			<AppStack.Screen name="GrammarManagement" component={GrammarManagement} />
			<AppStack.Screen
				name="PronunciationWordsManagement"
				component={PronunciationWordsManagement}
			/>
			{/* User-facing Grammar Rules */}
			<AppStack.Screen name="GrammarRules" component={GrammarRulesScreen} />
			<AppStack.Screen
				name="GrammarRuleDetail"
				component={GrammarRuleDetailScreen}
			/>
			{/* Core app screens accessible from anywhere */}
			<AppStack.Screen name="Progress" component={ProgressScreen} />
			<AppStack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
			<AppStack.Screen
				name="PersonalizedLearning"
				component={PersonalizedLearningScreen}
			/>
			<AppStack.Screen name="Gamification" component={GamificationScreen} />
			{/* Detail screens accessible from anywhere */}
			<AppStack.Screen name="BookDetail" component={BookDetailScreen} />
			<AppStack.Screen name="LessonDetail" component={LessonDetailScreen} />
			<AppStack.Screen name="LessonTest" component={LessonTestScreen} />
			<AppStack.Screen
				name="PronunciationTest"
				component={PronunciationTestScreen}
			/>
			<AppStack.Screen
				name="ConversationalAITest"
				component={ConversationalAITestScreen}
			/>
			<AppStack.Screen
				name="ConversationalAI"
				component={ConversationalAIScreen}
			/>
			<AppStack.Screen name="AITest" component={AITestScreen} />
			<AppStack.Screen
				name="VocabularyPractice"
				component={VocabularyPracticeScreen}
			/>
			{/* Enhanced Practice Sessions */}
			<AppStack.Screen
				name="AdaptivePracticeSession"
				component={AdaptivePracticeSession}
			/>
			<AppStack.Screen
				name="FocusedPracticeSession"
				component={FocusedPracticeSession}
			/>
			<AppStack.Screen
				name="QuickPracticeSession"
				component={QuickPracticeSession}
			/>
			{/* AI Tools */}
			<AppStack.Screen name="GrammarCoach" component={GrammarCoachScreen} />
			<AppStack.Screen
				name="PronunciationPro"
				component={PronunciationProScreen}
			/>
		</AppStack.Navigator>
	);
};

const LoadingScreen: React.FC = () => {
	return (
		<View style={styles.loadingContainer}>
			<ActivityIndicator size="large" color={theme.colors.primary} />
		</View>
	);
};

export const AppNavigation: React.FC = () => {
	const { user, loading } = useAuth();
	const navigationRef = useRef<any>(null);
	const [showSplash, setShowSplash] = React.useState(true);

	useEffect(() => {
		if (navigationRef.current) {
			deepLinkHandler.setNavigationRef(navigationRef.current);
		}
		// Splash logic
		if (showSplash) {
			setTimeout(() => {
				setShowSplash(false);
				// Simulate onboarding for new users
				if (!user && navigationRef.current) {
					navigationRef.current.navigate("Onboarding");
				}
			}, 1800);
		}
	}, [showSplash, user]);

	if (showSplash) {
		return <SplashScreen />;
	}

	if (loading) {
		return <LoadingScreen />;
	}

	return (
		<NavigationContainer ref={navigationRef}>
			{user ? <AppNavigator /> : <AuthNavigator />}
		</NavigationContainer>
	);
};

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.background,
	},
});
