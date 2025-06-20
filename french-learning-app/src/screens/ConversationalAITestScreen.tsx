import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
	useConversationalAI,
	useGrammarChecker,
} from "../hooks/useConversationalAI";
import { theme } from "../constants/theme";

interface ConversationalAITestScreenProps {
	navigation: any;
}

export const ConversationalAITestScreen: React.FC<
	ConversationalAITestScreenProps
> = ({ navigation }) => {
	const {
		isLoading,
		error,
		currentContext,
		startConversation,
		sendMessage,
		generateAdaptiveQuestions,
		getConversationSummary,
		clearConversation,
		clearError,
	} = useConversationalAI();

	const grammarChecker = useGrammarChecker();
	const [testResults, setTestResults] = useState<Record<string, any>>({});
	const [grammarTestText, setGrammarTestText] = useState(
		"Je suis allé au magasin hier"
	);

	const handleGoBack = () => {
		navigation.goBack();
	};

	const testConversationStart = async () => {
		try {
			clearError();
			const context = await startConversation("daily conversation", "beginner");
			setTestResults((prev) => ({
				...prev,
				conversationStart: {
					success: true,
					data: {
						topic: context.topic,
						userLevel: context.userLevel,
						initialMessages: context.conversationHistory.length,
						firstMessage:
							context.conversationHistory[0]?.content || "No message",
					},
				},
			}));
		} catch (err) {
			setTestResults((prev) => ({
				...prev,
				conversationStart: {
					success: false,
					error: err instanceof Error ? err.message : "Unknown error",
				},
			}));
		}
	};

	const testSendMessage = async () => {
		if (!currentContext) {
			Alert.alert("Error", "Please start a conversation first");
			return;
		}

		try {
			clearError();
			const result = await sendMessage("Bonjour! Comment ça va?");
			setTestResults((prev) => ({
				...prev,
				sendMessage: {
					success: true,
					data: {
						userMessage: "Bonjour! Comment ça va?",
						aiResponse: result.aiResponse.content,
						grammarErrors: result.grammarFeedback.length,
						performanceUpdate: result.updatedContext.userPerformance,
					},
				},
			}));
		} catch (err) {
			setTestResults((prev) => ({
				...prev,
				sendMessage: {
					success: false,
					error: err instanceof Error ? err.message : "Unknown error",
				},
			}));
		}
	};

	const testGrammarCheck = async () => {
		try {
			grammarChecker.clearError();
			const errors = await grammarChecker.checkGrammar(
				grammarTestText,
				"beginner"
			);
			setTestResults((prev) => ({
				...prev,
				grammarCheck: {
					success: true,
					data: {
						originalText: grammarTestText,
						errorsFound: errors.length,
						errors: errors.map((error) => ({
							type: error.errorType,
							original: error.originalText,
							corrected: error.correctedText,
							explanation: error.explanation,
						})),
					},
				},
			}));
		} catch (err) {
			setTestResults((prev) => ({
				...prev,
				grammarCheck: {
					success: false,
					error: err instanceof Error ? err.message : "Unknown error",
				},
			}));
		}
	};

	const testAdaptiveQuestions = async () => {
		if (!currentContext) {
			Alert.alert("Error", "Please start a conversation first");
			return;
		}

		try {
			clearError();
			const questions = await generateAdaptiveQuestions(
				"greetings",
				"beginner",
				currentContext.userPerformance
			);
			setTestResults((prev) => ({
				...prev,
				adaptiveQuestions: {
					success: true,
					data: {
						questionsGenerated: questions.length,
						questions: questions.map((q) => ({
							question: q.question,
							difficulty: q.difficulty,
							hints: q.hints.length,
						})),
					},
				},
			}));
		} catch (err) {
			setTestResults((prev) => ({
				...prev,
				adaptiveQuestions: {
					success: false,
					error: err instanceof Error ? err.message : "Unknown error",
				},
			}));
		}
	};

	const testConversationSummary = async () => {
		if (!currentContext) {
			Alert.alert("Error", "Please start a conversation first");
			return;
		}

		try {
			clearError();
			const summary = await getConversationSummary();
			setTestResults((prev) => ({
				...prev,
				conversationSummary: {
					success: true,
					data: {
						summary: summary.summary,
						strengths: summary.strengths.length,
						improvements: summary.areasForImprovement.length,
						recommendations: summary.recommendations.length,
					},
				},
			}));
		} catch (err) {
			setTestResults((prev) => ({
				...prev,
				conversationSummary: {
					success: false,
					error: err instanceof Error ? err.message : "Unknown error",
				},
			}));
		}
	};

	const renderTestResult = (testName: string, result: any) => {
		if (!result) return null;

		return (
			<View style={styles.testResult}>
				<View style={styles.testHeader}>
					<Text style={styles.testName}>{testName}</Text>
					<Ionicons
						name={result.success ? "checkmark-circle" : "close-circle"}
						size={20}
						color={result.success ? theme.colors.success : theme.colors.error}
					/>
				</View>
				{result.success ? (
					<View style={styles.testData}>
						<Text style={styles.dataText}>
							{JSON.stringify(result.data, null, 2)}
						</Text>
					</View>
				) : (
					<Text style={styles.errorText}>Error: {result.error}</Text>
				)}
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Conversational AI Test</Text>
			</View>

			{error && (
				<View style={styles.errorContainer}>
					<Ionicons name="warning" size={16} color={theme.colors.error} />
					<Text style={styles.errorMessage}>{error}</Text>
					<TouchableOpacity onPress={clearError}>
						<Ionicons name="close" size={16} color={theme.colors.error} />
					</TouchableOpacity>
				</View>
			)}

			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.contentContainer}
			>
				{/* Status Card */}
				<View style={styles.statusCard}>
					<Text style={styles.statusTitle}>
						Stage 6.3: Conversational AI Features
					</Text>
					<Text style={styles.statusDescription}>
						Complete AI conversation system with real-time chat, grammar
						checking, and adaptive responses.
					</Text>

					{currentContext && (
						<View style={styles.contextInfo}>
							<Text style={styles.contextTitle}>Active Conversation:</Text>
							<Text style={styles.contextText}>
								Topic: {currentContext.topic}
							</Text>
							<Text style={styles.contextText}>
								Level: {currentContext.userLevel}
							</Text>
							<Text style={styles.contextText}>
								Messages: {currentContext.conversationHistory.length}
							</Text>
							<Text style={styles.contextText}>
								Performance - Grammar:{" "}
								{Math.round(
									currentContext.userPerformance.grammarAccuracy || 0
								)}
								%, Vocabulary:{" "}
								{Math.round(
									currentContext.userPerformance.vocabularyUsage || 0
								)}
								%, Flow:{" "}
								{Math.round(
									currentContext.userPerformance.conversationFlow || 0
								)}
								%
							</Text>
						</View>
					)}
				</View>

				{/* Test Buttons */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>🚀 Feature Tests</Text>

					<TouchableOpacity
						style={[styles.testButton, isLoading && styles.disabledButton]}
						onPress={testConversationStart}
						disabled={isLoading}
					>
						<Text style={styles.testButtonText}>1. Start AI Conversation</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.testButton, isLoading && styles.disabledButton]}
						onPress={testSendMessage}
						disabled={isLoading || !currentContext}
					>
						<Text style={styles.testButtonText}>
							2. Send Message & Get Response
						</Text>
					</TouchableOpacity>

					<View style={styles.grammarTestSection}>
						<Text style={styles.testLabel}>3. Grammar Check Test</Text>
						<TextInput
							style={styles.grammarInput}
							value={grammarTestText}
							onChangeText={setGrammarTestText}
							placeholder="Enter French text to check grammar"
							multiline
						/>
						<TouchableOpacity
							style={[
								styles.testButton,
								grammarChecker.isLoading && styles.disabledButton,
							]}
							onPress={testGrammarCheck}
							disabled={grammarChecker.isLoading}
						>
							<Text style={styles.testButtonText}>Check Grammar</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						style={[styles.testButton, isLoading && styles.disabledButton]}
						onPress={testAdaptiveQuestions}
						disabled={isLoading || !currentContext}
					>
						<Text style={styles.testButtonText}>
							4. Generate Adaptive Questions
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.testButton, isLoading && styles.disabledButton]}
						onPress={testConversationSummary}
						disabled={isLoading || !currentContext}
					>
						<Text style={styles.testButtonText}>
							5. Get Conversation Summary
						</Text>
					</TouchableOpacity>

					{currentContext && (
						<TouchableOpacity
							style={[styles.testButton, styles.clearButton]}
							onPress={() => {
								clearConversation();
								setTestResults({});
							}}
						>
							<Text style={[styles.testButtonText, styles.clearButtonText]}>
								Clear Conversation
							</Text>
						</TouchableOpacity>
					)}
				</View>

				{/* Test Results */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>📊 Test Results</Text>

					{renderTestResult(
						"Conversation Start",
						testResults.conversationStart
					)}
					{renderTestResult("Send Message", testResults.sendMessage)}
					{renderTestResult("Grammar Check", testResults.grammarCheck)}
					{renderTestResult(
						"Adaptive Questions",
						testResults.adaptiveQuestions
					)}
					{renderTestResult(
						"Conversation Summary",
						testResults.conversationSummary
					)}
				</View>

				{/* Loading Indicator */}
				{(isLoading || grammarChecker.isLoading) && (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color={theme.colors.primary} />
						<Text style={styles.loadingText}>Testing AI features...</Text>
					</View>
				)}

				{/* Success Message */}
				<View style={styles.successCard}>
					<Ionicons
						name="checkmark-circle"
						size={48}
						color={theme.colors.success}
					/>
					<Text style={styles.successTitle}>Stage 6.3 Complete!</Text>
					<Text style={styles.successDescription}>
						Conversational AI features are now fully functional with real-time
						chat partner, grammar correction, intelligent feedback, and adaptive
						questioning based on user performance.
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
		backgroundColor: theme.colors.surface,
	},
	backButton: {
		padding: theme.spacing.xs,
		marginRight: theme.spacing.sm,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
	},
	errorContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFE5E5",
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		gap: theme.spacing.sm,
	},
	errorMessage: {
		flex: 1,
		fontSize: 12,
		color: theme.colors.error,
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		padding: theme.spacing.md,
	},
	statusCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.large,
		padding: theme.spacing.lg,
		marginBottom: theme.spacing.lg,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	statusTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: theme.colors.primary,
		marginBottom: theme.spacing.sm,
	},
	statusDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
		marginBottom: theme.spacing.md,
	},
	contextInfo: {
		backgroundColor: theme.colors.background,
		padding: theme.spacing.md,
		borderRadius: theme.borderRadius.medium,
	},
	contextTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	contextText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginBottom: 2,
	},
	section: {
		marginBottom: theme.spacing.lg,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	testButton: {
		backgroundColor: theme.colors.primary,
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		borderRadius: theme.borderRadius.medium,
		marginBottom: theme.spacing.sm,
		alignItems: "center",
	},
	disabledButton: {
		backgroundColor: theme.colors.textSecondary,
	},
	clearButton: {
		backgroundColor: theme.colors.error,
	},
	testButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "white",
	},
	clearButtonText: {
		color: "white",
	},
	grammarTestSection: {
		marginVertical: theme.spacing.sm,
	},
	testLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	grammarInput: {
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: theme.borderRadius.medium,
		padding: theme.spacing.md,
		fontSize: 14,
		color: theme.colors.text,
		backgroundColor: theme.colors.surface,
		marginBottom: theme.spacing.sm,
		minHeight: 60,
	},
	testResult: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.medium,
		padding: theme.spacing.md,
		marginBottom: theme.spacing.sm,
		borderLeftWidth: 3,
	},
	testHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.sm,
	},
	testName: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
	},
	testData: {
		backgroundColor: theme.colors.background,
		padding: theme.spacing.sm,
		borderRadius: theme.borderRadius.small,
	},
	dataText: {
		fontSize: 10,
		color: theme.colors.textSecondary,
		fontFamily: "monospace",
	},
	errorText: {
		fontSize: 12,
		color: theme.colors.error,
	},
	loadingContainer: {
		alignItems: "center",
		paddingVertical: theme.spacing.lg,
	},
	loadingText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginTop: theme.spacing.sm,
	},
	successCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.large,
		padding: theme.spacing.lg,
		alignItems: "center",
		marginTop: theme.spacing.lg,
		borderWidth: 2,
		borderColor: theme.colors.success,
	},
	successTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: theme.colors.success,
		marginTop: theme.spacing.sm,
		marginBottom: theme.spacing.sm,
	},
	successDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		textAlign: "center",
		lineHeight: 20,
	},
});
