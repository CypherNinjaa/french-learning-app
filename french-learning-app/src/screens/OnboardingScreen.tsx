import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { ModernButton } from "../components/ModernUI";
import { theme } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";

export const OnboardingScreen: React.FC<{ navigation?: any }> = ({
	navigation,
}) => {
	const nav = navigation || useNavigation();
	return (
		<View style={styles.container}>
			<Image
				source={require("../../assets/splash-icon.png")}
				style={styles.image}
				resizeMode="contain"
			/>
			<Text style={styles.title}>Welcome to FrenchMaster!</Text>
			<Text style={styles.subtitle}>
				Your journey to mastering French starts here. Track your progress,
				practice with AI, and enjoy gamified learning!
			</Text>
			<ModernButton
				title="Get Started"
				variant="primary"
				onPress={() => (nav && nav.replace ? nav.replace("Home") : null)}
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
		backgroundColor: theme.colors.background,
		padding: 32,
	},
	image: {
		width: 120,
		height: 120,
		marginBottom: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: theme.colors.primary,
		marginBottom: 12,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		marginBottom: 32,
		textAlign: "center",
	},
	button: {
		marginTop: 12,
		width: "100%",
	},
});
