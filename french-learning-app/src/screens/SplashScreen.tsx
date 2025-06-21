import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { theme } from "../constants/theme";

export const SplashScreen: React.FC<{ onFinish?: () => void }> = ({
	onFinish,
}) => {
	const scale = React.useRef(new Animated.Value(0.7)).current;
	const opacity = React.useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(scale, {
				toValue: 1,
				duration: 900,
				easing: Easing.out(Easing.exp),
				useNativeDriver: true,
			}),
			Animated.timing(opacity, {
				toValue: 1,
				duration: 900,
				easing: Easing.out(Easing.exp),
				useNativeDriver: true,
			}),
		]).start(() => {
			setTimeout(() => {
				onFinish && onFinish();
			}, 900);
		});
	}, []);

	return (
		<View style={styles.container}>
			<Animated.View style={{ transform: [{ scale }], opacity }}>
				<Text style={styles.logo}>🇫🇷</Text>
				<Text style={styles.title}>FrenchMaster</Text>
				<Text style={styles.subtitle}>Learn French. Master Life.</Text>
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.primary,
	},
	logo: {
		fontSize: 72,
		textAlign: "center",
		marginBottom: 12,
	},
	title: {
		fontSize: 36,
		fontWeight: "bold",
		color: "#fff",
		textAlign: "center",
	},
	subtitle: {
		fontSize: 18,
		color: "#fff",
		textAlign: "center",
		marginTop: 8,
	},
});
