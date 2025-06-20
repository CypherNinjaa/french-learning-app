// Reset Password Screen
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { SupabaseService } from "../services/supabaseService";
import { theme } from "../constants/theme";

interface ResetPasswordScreenProps {
	navigation: any;
	route: any;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
	navigation,
	route,
}) => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleResetPassword = async () => {
		if (!password || !confirmPassword) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert("Error", "Passwords do not match");
			return;
		}

		if (password.length < 6) {
			Alert.alert("Error", "Password must be at least 6 characters long");
			return;
		}
		setLoading(true);
		try {
			const token = route.params?.token;
			const type = route.params?.type;

			if (!token || type !== "recovery") {
				Alert.alert(
					"Error",
					"Invalid reset link. Please request a new password reset."
				);
				return;
			}

			console.log("🔐 Processing password reset with token");

			// First verify the reset token and update password
			const result = await SupabaseService.resetPasswordWithToken(
				token,
				password
			);

			if (result.success) {
				Alert.alert("Success", "Your password has been reset successfully!", [
					{
						text: "OK",
						onPress: () => navigation.navigate("Login"),
					},
				]);
			} else {
				Alert.alert("Error", result.error || "Failed to reset password");
			}
		} catch (error) {
			console.error("❌ Password reset error:", error);
			Alert.alert("Error", "Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<View style={styles.content}>
				<Text style={styles.title}>Reset Your Password</Text>
				<Text style={styles.subtitle}>Enter your new password below</Text>

				<View style={styles.inputContainer}>
					<Text style={styles.label}>New Password</Text>
					<TextInput
						style={styles.input}
						value={password}
						onChangeText={setPassword}
						placeholder="Enter new password"
						secureTextEntry
						autoCapitalize="none"
					/>
				</View>

				<View style={styles.inputContainer}>
					<Text style={styles.label}>Confirm Password</Text>
					<TextInput
						style={styles.input}
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						placeholder="Confirm new password"
						secureTextEntry
						autoCapitalize="none"
					/>
				</View>

				<TouchableOpacity
					style={[styles.resetButton, loading && styles.buttonDisabled]}
					onPress={handleResetPassword}
					disabled={loading}
				>
					<Text style={styles.resetButtonText}>
						{loading ? "Resetting..." : "Reset Password"}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.navigate("Login")}
				>
					<Text style={styles.backButtonText}>Back to Login</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		padding: theme.spacing.lg,
	},
	title: {
		...theme.typography.heading,
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
		textAlign: "center",
	},
	subtitle: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginBottom: theme.spacing.xl,
	},
	inputContainer: {
		marginBottom: theme.spacing.lg,
	},
	label: {
		...theme.typography.body,
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
		fontWeight: "600",
	},
	input: {
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: "#E5E5EA",
		borderRadius: theme.borderRadius.medium,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.md,
		fontSize: 16,
	},
	resetButton: {
		backgroundColor: theme.colors.primary,
		paddingVertical: theme.spacing.md,
		borderRadius: theme.borderRadius.medium,
		marginBottom: theme.spacing.lg,
	},
	resetButtonText: {
		color: theme.colors.white,
		...theme.typography.button,
		textAlign: "center",
	},
	backButton: {
		paddingVertical: theme.spacing.md,
	},
	backButtonText: {
		color: theme.colors.primary,
		...theme.typography.button,
		textAlign: "center",
	},
	buttonDisabled: {
		opacity: 0.5,
	},
});
