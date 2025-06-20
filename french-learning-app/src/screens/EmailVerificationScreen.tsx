// Email Verification Screen
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	TouchableOpacity,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { SupabaseService } from "../services/supabaseService";
import { theme } from "../constants/theme";

interface EmailVerificationScreenProps {
	navigation: any;
	route: any;
}

export const EmailVerificationScreen: React.FC<
	EmailVerificationScreenProps
> = ({ navigation, route }) => {
	const [loading, setLoading] = useState(true);
	const [verified, setVerified] = useState(false);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		handleEmailVerification();
	}, [route.params]);

	const handleEmailVerification = async () => {
		try {
			console.log("📧 Email verification params:", route.params);

			// Check if we have a token from the deep link
			const token = route.params?.token;
			const type = route.params?.type;

			if (token && type === "signup") {
				console.log("🔐 Processing email verification with token");

				// Verify the email with Supabase using the token
				const result = await SupabaseService.verifyEmail(token);

				if (result.success) {
					setVerified(true);
					setLoading(false);

					// Auto-redirect to login after 3 seconds
					setTimeout(() => {
						navigation.navigate("Login");
					}, 3000);
				} else {
					throw new Error(result.error || "Verification failed");
				}
			} else {
				// No token provided - assume verification is complete
				setVerified(true);
				setLoading(false);

				// Auto-redirect to login after 3 seconds
				setTimeout(() => {
					navigation.navigate("Login");
				}, 3000);
			}
		} catch (err) {
			console.error("❌ Email verification error:", err);
			setError("Email verification failed. Please try again.");
			setLoading(false);
		}
	};

	const handleResendVerification = async () => {
		// Implementation for resending verification email
		try {
			setLoading(true);
			// Add resend logic here
			setLoading(false);
		} catch (err) {
			setError("Failed to resend verification email.");
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color={theme.colors.primary} />
				<Text style={styles.loadingText}>Verifying your email...</Text>
			</View>
		);
	}

	if (verified) {
		return (
			<View style={styles.container}>
				<View style={styles.successIcon}>
					<Text style={styles.checkmark}>✅</Text>
				</View>
				<Text style={styles.title}>Email Verified!</Text>
				<Text style={styles.message}>
					Your email has been successfully verified. You can now sign in to your
					account.
				</Text>
				<TouchableOpacity
					style={styles.button}
					onPress={() => navigation.navigate("Login")}
				>
					<Text style={styles.buttonText}>Continue to Login</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Verification Failed</Text>
			<Text style={styles.errorText}>{error}</Text>
			<TouchableOpacity
				style={styles.button}
				onPress={handleResendVerification}
				disabled={loading}
			>
				<Text style={styles.buttonText}>
					{loading ? "Sending..." : "Resend Verification Email"}
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.secondaryButton}
				onPress={() => navigation.navigate("Login")}
			>
				<Text style={styles.secondaryButtonText}>Back to Login</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: theme.spacing.lg,
		backgroundColor: theme.colors.background,
	},
	successIcon: {
		marginBottom: theme.spacing.xl,
	},
	checkmark: {
		fontSize: 64,
	},
	title: {
		...theme.typography.heading,
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
		textAlign: "center",
	},
	message: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginBottom: theme.spacing.xl,
		lineHeight: 24,
	},
	loadingText: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		marginTop: theme.spacing.md,
	},
	errorText: {
		...theme.typography.body,
		color: theme.colors.error,
		textAlign: "center",
		marginBottom: theme.spacing.lg,
	},
	button: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		borderRadius: theme.borderRadius.medium,
		marginBottom: theme.spacing.md,
		minWidth: 200,
	},
	buttonText: {
		color: theme.colors.white,
		...theme.typography.button,
		textAlign: "center",
	},
	secondaryButton: {
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
	},
	secondaryButtonText: {
		color: theme.colors.primary,
		...theme.typography.button,
		textAlign: "center",
	},
});
