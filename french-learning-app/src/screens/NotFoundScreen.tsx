import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ModernButton } from "../components/ModernUI";
import { theme } from "../constants/theme";

export const NotFoundScreen: React.FC<{ navigation?: any }> = ({
	navigation,
}) => {
	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<Text style={[styles.title, { color: theme.colors.error }]}>404</Text>
			<Text style={[styles.subtitle, { color: theme.colors.text }]}>
				Screen Not Found
			</Text>
			<Text style={[styles.description, { color: theme.colors.textSecondary }]}>
				The page you are looking for does not exist or is coming soon.
			</Text>
			<ModernButton
				title="Go Home"
				variant="primary"
				onPress={() =>
					navigation?.navigate ? navigation.navigate("Home") : null
				}
				style={styles.button}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
	},
	title: {
		fontSize: 64,
		fontWeight: "bold",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 24,
		fontWeight: "600",
		marginBottom: 8,
	},
	description: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 24,
	},
	button: {
		marginTop: 12,
	},
});
