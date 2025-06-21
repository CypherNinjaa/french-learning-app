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
import { useTheme } from "../contexts/ThemeContext";
import { ModernCard, ModernButton } from "../components/ModernUI";

interface ThemeSettingsScreenProps {
	navigation: any;
}

export const ThemeSettingsScreen: React.FC<ThemeSettingsScreenProps> = ({
	navigation,
}) => {
	const { theme, isDark, themeMode, setTheme, toggleTheme } = useTheme();

	const themeOptions = [
		{
			key: "light" as const,
			title: "Light Mode",
			description: "Classic light theme for daytime use",
			icon: "sunny" as keyof typeof Ionicons.glyphMap,
			color: "#007AFF",
		},
		{
			key: "dark" as const,
			title: "Dark Mode",
			description: "Easy on the eyes for nighttime use",
			icon: "moon" as keyof typeof Ionicons.glyphMap,
			color: "#5856D6",
		},
		{
			key: "system" as const,
			title: "System Default",
			description: "Follow your device theme setting",
			icon: "phone-portrait" as keyof typeof Ionicons.glyphMap,
			color: "#34C759",
		},
	];

	const handleThemeChange = (selectedTheme: "light" | "dark" | "system") => {
		setTheme(selectedTheme);

		// Show feedback
		const themeNames = {
			light: "Light Mode",
			dark: "Dark Mode",
			system: "System Default",
		};

		Alert.alert("Theme Changed", `Switched to ${themeNames[selectedTheme]}`, [
			{ text: "OK", style: "default" },
		]);
	};

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
				<ModernCard style={styles.statusCard}>
					<View style={styles.statusHeader}>
						<Ionicons
							name={isDark ? "moon" : "sunny"}
							size={32}
							color={theme.colors.primary}
						/>
						<View style={styles.statusText}>
							<Text style={[styles.statusTitle, { color: theme.colors.text }]}>
								Current Theme
							</Text>
							<Text
								style={[
									styles.statusSubtitle,
									{ color: theme.colors.textSecondary },
								]}
							>
								{themeMode === "system"
									? `System Default (${isDark ? "Dark" : "Light"})`
									: themeMode === "dark"
									? "Dark Mode"
									: "Light Mode"}
							</Text>
						</View>
					</View>
				</ModernCard>

				{/* Theme Options */}
				<View style={styles.optionsContainer}>
					<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
						Choose Theme
					</Text>
					{themeOptions.map((option) => {
						const isSelected = themeMode === option.key;
						const cardStyles = isSelected
							? {
									...styles.optionCard,
									borderWidth: 2,
									borderColor: theme.colors.primary,
									backgroundColor: isDark
										? theme.colors.surfaceSecondary
										: `${theme.colors.primaryLight}20`,
							  }
							: styles.optionCard;

						return (
							<ModernCard
								key={option.key}
								style={cardStyles}
								onPress={() => handleThemeChange(option.key)}
							>
								<View style={styles.optionContent}>
									<View style={styles.optionLeft}>
										<View
											style={[
												styles.iconContainer,
												{
													backgroundColor: option.color + "20",
												},
											]}
										>
											<Ionicons
												name={option.icon}
												size={24}
												color={option.color}
											/>
										</View>
										<View style={styles.optionText}>
											<Text
												style={[
													styles.optionTitle,
													{ color: theme.colors.text },
												]}
											>
												{option.title}
											</Text>
											<Text
												style={[
													styles.optionDescription,
													{ color: theme.colors.textSecondary },
												]}
											>
												{option.description}
											</Text>
										</View>
									</View>

									{themeMode === option.key && (
										<Ionicons
											name="checkmark-circle"
											size={24}
											color={theme.colors.primary}
										/>
									)}
								</View>
							</ModernCard>
						);
					})}
				</View>

				{/* Quick Toggle */}
				<View style={styles.quickToggleContainer}>
					<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
						Quick Toggle
					</Text>

					<ModernCard style={styles.quickToggleCard}>
						<View style={styles.quickToggleContent}>
							<View style={styles.quickToggleText}>
								<Text
									style={[
										styles.quickToggleTitle,
										{ color: theme.colors.text },
									]}
								>
									Quick Theme Switch
								</Text>
								<Text
									style={[
										styles.quickToggleDescription,
										{ color: theme.colors.textSecondary },
									]}
								>
									Quickly switch between light and dark mode
								</Text>
							</View>

							<ModernButton
								title={isDark ? "Switch to Light" : "Switch to Dark"}
								variant="outline"
								size="small"
								icon={isDark ? "sunny" : "moon"}
								onPress={toggleTheme}
							/>
						</View>
					</ModernCard>
				</View>

				{/* Theme Preview */}
				<View style={styles.previewContainer}>
					<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
						Theme Preview
					</Text>

					<ModernCard style={styles.previewCard}>
						<View style={styles.previewContent}>
							<Text style={[styles.previewTitle, { color: theme.colors.text }]}>
								Sample Card
							</Text>
							<Text
								style={[
									styles.previewText,
									{ color: theme.colors.textSecondary },
								]}
							>
								This is how your app will look with the current theme. Colors,
								shadows, and styling will be applied consistently throughout the
								app.
							</Text>

							<View style={styles.previewButtons}>
								<ModernButton
									title="Primary Button"
									variant="primary"
									size="small"
									onPress={() => {}}
								/>
								<ModernButton
									title="Secondary"
									variant="secondary"
									size="small"
									onPress={() => {}}
								/>
							</View>
						</View>
					</ModernCard>
				</View>
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
