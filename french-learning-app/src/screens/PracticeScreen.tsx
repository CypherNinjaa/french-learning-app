import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../constants/theme";
import { ThemeSwitchButton } from "../components/ModernUI";

export const PracticeScreen: React.FC = () => {
	return (
		<View style={styles.container}>
			<View style={styles.headerRow}>
				<Text style={styles.title}>Practice & AI</Text>
				<ThemeSwitchButton />
			</View>
			<Text style={styles.subtitle}>
				Access AI tools, quizzes, and gamification features here.
			</Text>
			{/* TODO: Add cards for AI Conversation, Gamification, Quizzes, etc. */}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: theme.colors.background, padding: 24 },
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
});
