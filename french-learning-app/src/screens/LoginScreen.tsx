import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { theme } from "../constants/theme";

interface LoginScreenProps {
	navigation: any; // Will be properly typed with navigation types later
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const { signIn, loading } = useAuth();

	useEffect(() => {
		const checkRememberedUser = async () => {
			const savedEmail = await AsyncStorage.getItem("rememberedEmail");
			const savedPassword = await AsyncStorage.getItem("rememberedPassword");
			if (savedEmail && savedPassword) {
				setEmail(savedEmail);
				setPassword(savedPassword);
				// Automatically log in
				signIn(savedEmail, savedPassword);
			}
		};
		checkRememberedUser();
	}, []);

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		try {
			await signIn(email, password);
			if (rememberMe) {
				await AsyncStorage.setItem("rememberedEmail", email);
				await AsyncStorage.setItem("rememberedPassword", password);
			} else {
				await AsyncStorage.removeItem("rememberedEmail");
				await AsyncStorage.removeItem("rememberedPassword");
			}
		} catch (error) {
			Alert.alert(
				"Login Error",
				error instanceof Error ? error.message : "Unknown error occurred"
			);
		}
	};

	const navigateToRegister = () => {
		navigation.navigate("Register");
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView contentContainerStyle={styles.scrollContainer}>
				<View style={styles.headerContainer}>
					<Text style={styles.title}>Welcome Back!</Text>
					<Text style={styles.subtitle}>
						Sign in to continue your French learning journey
					</Text>
				</View>

				<View style={styles.formContainer}>
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Email</Text>
						<TextInput
							style={styles.input}
							value={email}
							onChangeText={setEmail}
							placeholder="Enter your email"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
						/>
					</View>

					<View style={styles.inputContainer}>
						<Text style={styles.label}>Password</Text>
						<TextInput
							style={styles.input}
							value={password}
							onChangeText={setPassword}
							placeholder="Enter your password"
							secureTextEntry
							autoCapitalize="none"
						/>
					</View>

					<View style={styles.rememberMeContainer}>
						<Switch
							value={rememberMe}
							onValueChange={setRememberMe}
						/>
						<Text style={styles.rememberMeText}>Remember Me</Text>
					</View>

					<TouchableOpacity
						style={[styles.button, loading && styles.buttonDisabled]}
						onPress={handleLogin}
						disabled={loading}
					>
						<Text style={styles.buttonText}>
							{loading ? "Signing In..." : "Sign In"}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.forgotPasswordContainer}
						onPress={() => navigation.navigate("ForgotPassword")}
					>
						<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
					</TouchableOpacity>

					<View style={styles.registerContainer}>
						<Text style={styles.registerText}>Don't have an account? </Text>
						<TouchableOpacity onPress={navigateToRegister}>
							<Text style={styles.registerLink}>Sign Up</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	scrollContainer: {
		flexGrow: 1,
		justifyContent: "center",
		padding: theme.spacing.lg,
	},
	headerContainer: {
		alignItems: "center",
		marginBottom: theme.spacing.xl,
	},
	title: {
		...theme.typography.heading,
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	subtitle: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		textAlign: "center",
	},
	formContainer: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.lg,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	inputContainer: {
		marginBottom: theme.spacing.md,
	},
	label: {
		...theme.typography.body,
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
		fontWeight: "600",
	},
	input: {
		borderWidth: 1,
		borderColor: "#E1E1E1",
		borderRadius: 8,
		padding: theme.spacing.md,
		fontSize: 16,
		backgroundColor: theme.colors.surface,
	},
	button: {
		backgroundColor: theme.colors.primary,
		padding: theme.spacing.md,
		borderRadius: 8,
		alignItems: "center",
		marginTop: theme.spacing.md,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: theme.colors.surface,
		fontSize: 16,
		fontWeight: "600",
	},
	forgotPasswordContainer: {
		marginTop: theme.spacing.sm,
		marginBottom: theme.spacing.md,
		alignItems: "center",
	},
	forgotPasswordText: {
		...theme.typography.body,
		color: theme.colors.primary,
		fontWeight: "600",
	},
	registerContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: theme.spacing.lg,
	},
	registerText: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
	},
	registerLink: {
		...theme.typography.body,
		color: theme.colors.primary,
		fontWeight: "600",
	},
	rememberMeContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	rememberMeText: {
		marginLeft: 8,
		...theme.typography.body,
		color: theme.colors.text,
	},
});
