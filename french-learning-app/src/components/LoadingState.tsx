import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "../constants/theme";

export const LoadingState: React.FC = () => (
	<View style={styles.container}>
		<ActivityIndicator size="large" color={theme.colors.primary} />
	</View>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.background,
	},
});
