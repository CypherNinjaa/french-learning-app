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
import { LevelsManagement } from "../screens/admin/LevelsManagement";
import { ModulesManagement } from "../screens/admin/ModulesManagement";
import { LessonsManagement } from "../screens/admin/LessonsManagement";
import { VocabularyManagement } from "../screens/admin/VocabularyManagement";
import { GrammarManagement } from "../screens/admin/GrammarManagement";
import { QuestionsManagement } from "../screens/admin/QuestionsManagement";
import { PronunciationWordsManagement } from "../screens/admin/PronunciationWordsManagement";
import { LessonListScreen } from "../screens/LessonListScreen";
import { LessonScreen } from "../screens/LessonScreen";
import { PronunciationTestScreen } from "../screens/PronunciationTestScreen";
import { AITestScreen } from "../screens/AITestScreen";
import { PersonalizedLearningScreen } from "../screens/PersonalizedLearningScreen";
import { ConversationalAIScreen } from "../screens/ConversationalAIScreen";
import { ConversationalAITestScreen } from "../screens/ConversationalAITestScreen";
import { ThemeSettingsScreen } from "../screens/ThemeSettingsScreen";
import { GamificationScreen } from "../screens/GamificationScreen";
import { LevelsScreen } from "../screens/LevelsScreen";
import { ModulesScreen } from "../screens/ModulesScreen";
import { VocabularyScreen } from "../screens/VocabularyScreen";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "../constants/theme";
import { deepLinkHandler } from "../utils/deepLinkHandler";
import { SplashScreen } from "../screens/SplashScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { TabNavigation } from "./TabNavigation";
import { VocabularyPracticeScreen } from "../screens/VocabularyPracticeScreen";

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

	// Admin & Content
	AdminDashboard: undefined;
	ContentManagementDashboard: undefined;
	LevelsManagement: undefined;
	ModulesManagement: undefined;
	LessonsManagement: undefined;
	VocabularyManagement: undefined;
	GrammarManagement: undefined;
	QuestionsManagement: undefined;
	PronunciationWordsManagement: undefined;
	// Learning & Practice
	Levels: undefined;
	Modules: { levelId: number; levelName: string; userId: string };
	LessonList: { moduleId: number; moduleName: string; userId: string };
	Lesson: { lessonId: number; lessonTitle: string; userId: string };
	Vocabulary: undefined;
	VocabularyPractice: { words: any[]; userId: string };
	PronunciationTest: undefined;
	PersonalizedLearning: undefined;

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

	// Fallback
	// Removed NotFound screen
	// Add more screens as they are created
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
			<AppStack.Screen name="LevelsManagement" component={LevelsManagement} />
			<AppStack.Screen name="ModulesManagement" component={ModulesManagement} />
			<AppStack.Screen name="LessonsManagement" component={LessonsManagement} />
			<AppStack.Screen
				name="VocabularyManagement"
				component={VocabularyManagement}
			/>
			<AppStack.Screen name="GrammarManagement" component={GrammarManagement} />
			<AppStack.Screen
				name="QuestionsManagement"
				component={QuestionsManagement}
			/>
			<AppStack.Screen
				name="PronunciationWordsManagement"
				component={PronunciationWordsManagement}
			/>

			{/* Detail screens accessible from anywhere */}
			<AppStack.Screen name="Lesson" component={LessonScreen} />
			<AppStack.Screen name="LessonList" component={LessonListScreen} />
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
			{/* Add other detail screens as needed */}
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
