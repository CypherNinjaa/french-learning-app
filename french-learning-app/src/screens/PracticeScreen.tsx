import React from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
} from "react-native";
import { theme } from "../constants/theme";
import { ThemeSwitchButton } from "../components/ModernUI";
import {
	Ionicons,
	MaterialCommunityIcons,
	FontAwesome5,
} from "@expo/vector-icons";

const aiTools = [
	{
		key: "ai_conversation",
		title: "AI Conversation",
		description:
			"Chat with an AI tutor to practice real-life French conversations.",
		icon: (
			<Ionicons
				name="chatbubbles-outline"
				size={32}
				color={theme.colors.primary}
			/>
		),
		screen: "AIConversationScreen",
	},
	{
		key: "grammar_correction",
		title: "Grammar Correction",
		description:
			"Get instant feedback and corrections on your French sentences.",
		icon: (
			<MaterialCommunityIcons
				name="spellcheck"
				size={32}
				color={theme.colors.primary}
			/>
		),
		screen: "GrammarCorrectionScreen",
	},
	{
		key: "vocab_quiz",
		title: "Vocabulary Quiz",
		description: "Test and expand your vocabulary with smart AI quizzes.",
		icon: (
			<FontAwesome5
				name="question-circle"
				size={32}
				color={theme.colors.primary}
			/>
		),
		screen: "VocabularyQuizScreen",
	},
	{
		key: "pronunciation_coach",
		title: "Pronunciation Coach",
		description: "AI-powered feedback on your French pronunciation.",
		icon: (
			<Ionicons name="mic-outline" size={32} color={theme.colors.primary} />
		),
		screen: "PronunciationCoachScreen",
	},
	// Add more tools as needed
];

export const PracticeScreen: React.FC<{ navigation?: any }> = ({
	navigation,
}) => {
	const handleToolPress = (screen: string, title: string) => {
		if (navigation && navigation.navigate) {
			navigation.navigate(screen);
		} else {
			Alert.alert(title, "This feature is coming soon!");
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.headerRow}>
				<Text style={styles.title}>Practice & AI</Text>
				<ThemeSwitchButton />
			</View>
			<Text style={styles.subtitle}>
				Access AI tools, quizzes, and gamification features here.
			</Text>
			<ScrollView
				contentContainerStyle={styles.toolsList}
				showsVerticalScrollIndicator={false}
			>
				{aiTools.map((tool) => (
					<View key={tool.key} style={styles.toolCard}>
						<View style={styles.toolIcon}>{tool.icon}</View>
						<Text style={styles.toolTitle}>{tool.title}</Text>
						<Text style={styles.toolDescription}>{tool.description}</Text>
						<TouchableOpacity
							style={styles.toolButton}
							onPress={() => handleToolPress(tool.screen, tool.title)}
						>
							<Text style={styles.toolButtonText}>Open</Text>
						</TouchableOpacity>
					</View>
				))}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
		padding: 24,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	title: { fontSize: 24, fontWeight: "700", color: theme.colors.text },
	subtitle: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		marginBottom: 24,
	},
	toolsList: {
		paddingBottom: 32,
	},
	toolCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: 22,
		marginBottom: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
	},
	toolIcon: {
		marginBottom: 14,
	},
	toolTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: theme.colors.primary,
		marginBottom: 7,
		textAlign: "center",
	},
	toolDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: 16,
		textAlign: "center",
	},
	toolButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 32,
	},
	toolButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 15,
		letterSpacing: 0.5,
	},
});
