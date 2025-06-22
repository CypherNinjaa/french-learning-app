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
	Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface ThemeSettingsScreenProps {
	navigation: any;
}

export const ThemeSettingsScreen: React.FC<ThemeSettingsScreenProps> = ({
	navigation,
}) => {
	const { theme, themeMode, isDark, setTheme, systemColorScheme } = useTheme();
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

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Current Theme Status */}
				<View style={styles.statusSection}>
					<View
						style={[
							styles.statusCard,
							{ backgroundColor: theme.colors.surface },
						]}
					>
						<View style={styles.statusHeader}>
							<View
								style={[
									styles.statusIconContainer,
									{ backgroundColor: isDark ? "#4A5568" : "#667eea" },
								]}
							>
								<Ionicons
									name={isDark ? "moon" : "sunny"}
									size={24}
									color="#fff"
								/>
							</View>
							<View style={styles.statusText}>
								<Text
									style={[styles.statusTitle, { color: theme.colors.text }]}
								>
									Current Theme
								</Text>
								<Text
									style={[
										styles.statusSubtitle,
										{ color: theme.colors.textSecondary },
									]}
								>
									{themeMode === "system"
										? `System (${systemColorScheme || "light"})`
										: themeMode.charAt(0).toUpperCase() +
										  themeMode.slice(1)}{" "}
									mode
								</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Theme Options */}
				<View style={styles.optionsSection}>
					<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
						Theme Options
					</Text>

					{/* Light Theme */}
					<TouchableOpacity
						style={[
							styles.optionCard,
							{ backgroundColor: theme.colors.surface },
							themeMode === "light" && {
								borderColor: theme.colors.primary,
								borderWidth: 2,
							},
						]}
						onPress={() => setTheme("light")}
						activeOpacity={0.7}
					>
						<View style={styles.optionContent}>
							<View style={styles.optionLeft}>
								<View
									style={[styles.iconContainer, { backgroundColor: "#FFF3CD" }]}
								>
									<Ionicons name="sunny" size={24} color="#F59E0B" />
								</View>
								<View style={styles.optionText}>
									<Text
										style={[styles.optionTitle, { color: theme.colors.text }]}
									>
										Light Mode
									</Text>
									<Text
										style={[
											styles.optionDescription,
											{ color: theme.colors.textSecondary },
										]}
									>
										Bright interface for daytime use
									</Text>
								</View>
							</View>
							{themeMode === "light" && (
								<Ionicons
									name="checkmark-circle"
									size={24}
									color={theme.colors.primary}
								/>
							)}
						</View>
					</TouchableOpacity>

					{/* Dark Theme */}
					<TouchableOpacity
						style={[
							styles.optionCard,
							{ backgroundColor: theme.colors.surface },
							themeMode === "dark" && {
								borderColor: theme.colors.primary,
								borderWidth: 2,
							},
						]}
						onPress={() => setTheme("dark")}
						activeOpacity={0.7}
					>
						<View style={styles.optionContent}>
							<View style={styles.optionLeft}>
								<View
									style={[styles.iconContainer, { backgroundColor: "#E2E8F0" }]}
								>
									<Ionicons name="moon" size={24} color="#4A5568" />
								</View>
								<View style={styles.optionText}>
									<Text
										style={[styles.optionTitle, { color: theme.colors.text }]}
									>
										Dark Mode
									</Text>
									<Text
										style={[
											styles.optionDescription,
											{ color: theme.colors.textSecondary },
										]}
									>
										Easy on the eyes for low-light use
									</Text>
								</View>
							</View>
							{themeMode === "dark" && (
								<Ionicons
									name="checkmark-circle"
									size={24}
									color={theme.colors.primary}
								/>
							)}
						</View>
					</TouchableOpacity>

					{/* System Theme */}
					<TouchableOpacity
						style={[
							styles.optionCard,
							{ backgroundColor: theme.colors.surface },
							themeMode === "system" && {
								borderColor: theme.colors.primary,
								borderWidth: 2,
							},
						]}
						onPress={() => setTheme("system")}
						activeOpacity={0.7}
					>
						<View style={styles.optionContent}>
							<View style={styles.optionLeft}>
								<View
									style={[styles.iconContainer, { backgroundColor: "#DBEAFE" }]}
								>
									<Ionicons name="phone-portrait" size={24} color="#3B82F6" />
								</View>
								<View style={styles.optionText}>
									<Text
										style={[styles.optionTitle, { color: theme.colors.text }]}
									>
										System Default
									</Text>
									<Text
										style={[
											styles.optionDescription,
											{ color: theme.colors.textSecondary },
										]}
									>
										Follows your device's theme setting
									</Text>
								</View>
							</View>
							{themeMode === "system" && (
								<Ionicons
									name="checkmark-circle"
									size={24}
									color={theme.colors.primary}
								/>
							)}
						</View>
					</TouchableOpacity>
				</View>

				{/* Theme Preview */}
				<View style={styles.previewSection}>
					<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
						Preview
					</Text>
					<View
						style={[
							styles.previewCard,
							{ backgroundColor: theme.colors.surface },
						]}
					>
						<View style={styles.previewContent}>
							<Text style={[styles.previewTitle, { color: theme.colors.text }]}>
								French Learning App
							</Text>
							<Text
								style={[
									styles.previewText,
									{ color: theme.colors.textSecondary },
								]}
							>
								This is how the app looks with the current theme. Colors,
								typography, and interface elements are optimized for readability
								and user experience.
							</Text>
							<View style={styles.previewButtons}>
								<View
									style={[
										styles.previewButton,
										{ backgroundColor: theme.colors.primary },
									]}
								>
									<Text
										style={[
											styles.previewButtonText,
											{ color: theme.colors.textOnPrimary },
										]}
									>
										Primary Button
									</Text>
								</View>
								<View
									style={[
										styles.previewButton,
										styles.previewButtonSecondary,
										{ borderColor: theme.colors.border },
									]}
								>
									<Text
										style={[
											styles.previewButtonText,
											{ color: theme.colors.text },
										]}
									>
										Secondary
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>

				{/* Additional Info */}
				<View style={styles.infoSection}>
					<View
						style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}
					>
						<Ionicons
							name="information-circle"
							size={20}
							color={theme.colors.info}
						/>
						<Text
							style={[styles.infoText, { color: theme.colors.textSecondary }]}
						>
							Theme changes are saved automatically and will persist when you
							restart the app.
						</Text>
					</View>
				</View>

				<View style={{ height: 40 }} />
			</ScrollView>
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

	// Status Section
	statusSection: {
		marginBottom: 24,
	},
	statusCard: {
		borderRadius: 16,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	statusHeader: {
		flexDirection: "row",
		alignItems: "center",
	},
	statusIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	statusText: {
		flex: 1,
	},
	statusTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 4,
	},
	statusSubtitle: {
		fontSize: 14,
		fontWeight: "400",
	},

	// Options Section
	optionsSection: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 16,
	},
	optionCard: {
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
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
		marginRight: 16,
	},
	optionText: {
		flex: 1,
	},
	optionTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	optionDescription: {
		fontSize: 14,
		fontWeight: "400",
	},

	// Preview Section
	previewSection: {
		marginBottom: 24,
	},
	previewCard: {
		borderRadius: 16,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
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
	previewButton: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: "center",
	},
	previewButtonSecondary: {
		borderWidth: 1,
	},
	previewButtonText: {
		fontSize: 14,
		fontWeight: "600",
	},

	// Info Section
	infoSection: {
		marginBottom: 24,
	},
	infoCard: {
		flexDirection: "row",
		alignItems: "flex-start",
		borderRadius: 12,
		padding: 16,
	},
	infoText: {
		fontSize: 14,
		marginLeft: 12,
		flex: 1,
		lineHeight: 20,
	},
});
