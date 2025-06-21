import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ModernButton } from "./ModernUI";
import { theme } from "../constants/theme";

interface ErrorStateProps {
	title?: string;
	description?: string;
	onRetry?: () => void;
	buttonText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
	title = "Oops! Something went wrong.",
	description = "We couldn't load your data. Please check your connection or try again.",
	onRetry,
	buttonText = "Retry",
}) => (
	<View style={styles.container}>
		<Text style={styles.title}>{title}</Text>
		<Text style={styles.description}>{description}</Text>
		{onRetry && (
			<ModernButton
				title={buttonText}
				onPress={onRetry}
				variant="primary"
				style={styles.button}
			/>
		)}
	</View>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
		color: theme.colors.error,
		marginBottom: 8,
		textAlign: "center",
	},
	description: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		marginBottom: 20,
		textAlign: "center",
	},
	button: {
		marginTop: 8,
	},
});
