// Stage 7.1: Theme Settings Screen
// Modern UI for theme switching with animations

import React from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";

interface ThemeSettingsScreenProps {
	navigation: any;
}

export const ThemeSettingsScreen: React.FC<ThemeSettingsScreenProps> = ({
	navigation,
}) => {
	const themeMode = "light";
	const isDark = false;
	const theme = require("../constants/theme").theme;

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={[styles.headerTitle, { color: theme.colors.text }]}>
					Theme Settings
				</Text>
				<View style={styles.headerSpacer} />
			</View>

			<View style={styles.content}>
				<Text style={[styles.statusTitle, { color: theme.colors.text }]}>
					Theme
				</Text>
				<Text
					style={[styles.statusSubtitle, { color: theme.colors.textSecondary }]}
				>
					Light mode is always enabled.
				</Text>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	backButton: {
		padding: 8,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginLeft: 12,
	},
	headerSpacer: {
		flex: 1,
	},
	content: {
		flex: 1,
		padding: 16,
	},
	statusCard: {
		marginBottom: 24,
	},
	statusHeader: {
		flexDirection: "row",
		alignItems: "center",
	},
	statusText: {
		marginLeft: 16,
		flex: 1,
	},
	statusTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 4,
	},
	statusSubtitle: {
		fontSize: 14,
	},
	optionsContainer: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 16,
	},
	optionCard: {
		marginBottom: 12,
	},
	optionContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	optionLeft: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	optionText: {
		marginLeft: 16,
		flex: 1,
	},
	optionTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	optionDescription: {
		fontSize: 14,
	},
	quickToggleContainer: {
		marginBottom: 24,
	},
	quickToggleCard: {},
	quickToggleContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	quickToggleText: {
		flex: 1,
		marginRight: 16,
	},
	quickToggleTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	quickToggleDescription: {
		fontSize: 14,
	},
	previewContainer: {
		marginBottom: 32,
	},
	previewCard: {},
	previewContent: {},
	previewTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	previewText: {
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 16,
	},
	previewButtons: {
		flexDirection: "row",
		gap: 12,
	},
});
