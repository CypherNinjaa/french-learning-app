import React, { useState, useRef, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	Alert,
	ActivityIndicator,
	Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useConversationalAI } from "../hooks/useConversationalAI";
import { ChatMessage, GrammarError } from "../services/conversationalAIService";
import { theme } from "../constants/theme";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { useGamification } from "../hooks/useGamification";
import { useAuth } from "../contexts/AuthContext";

interface ConversationalAIScreenProps {
	navigation: any;
}

export const ConversationalAIScreen: React.FC<ConversationalAIScreenProps> = ({
	navigation,
}) => {
	const { user } = useAuth();
	const { completeActivity } = useGamification();
	const {
		isLoading,
		error,
		currentContext,
		startConversation,
		sendMessage,
		getConversationSummary,
		clearConversation,
		clearError,
	} = useConversationalAI();

	const [inputMessage, setInputMessage] = useState("");
	const [showGrammarDetails, setShowGrammarDetails] = useState(false);
	const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
		null
	);
	const [conversationStarted, setConversationStarted] = useState(false);
	const [selectedTopic, setSelectedTopic] = useState("daily conversation");
	const [selectedLevel, setSelectedLevel] = useState("beginner");

	const scrollViewRef = useRef<ScrollView>(null);
	const fadeAnim = useRef(new Animated.Value(0)).current;

	const topics = [
		"daily conversation",
		"food and dining",
		"travel and transportation",
		"shopping and commerce",
		"family and relationships",
		"work and career",
		"hobbies and interests",
		"health and fitness",
	];

	const levels = [
		{ value: "beginner", label: "Beginner (A1-A2)" },
		{ value: "intermediate", label: "Intermediate (B1-B2)" },
		{ value: "advanced", label: "Advanced (C1-C2)" },
	];

	useEffect(() => {
		if (conversationStarted) {
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 500,
				useNativeDriver: true,
			}).start();
		}
	}, [conversationStarted, fadeAnim]);

	useEffect(() => {
		if (currentContext && currentContext.conversationHistory.length > 0) {
			scrollViewRef.current?.scrollToEnd({ animated: true });
		}
	}, [currentContext]);

	const handleStartConversation = useCallback(async () => {
		try {
			clearError();
			await startConversation(selectedTopic, selectedLevel);
			setConversationStarted(true);
		} catch (err) {
			Alert.alert("Error", "Failed to start conversation. Please try again.");
		}
	}, [selectedTopic, selectedLevel, startConversation, clearError]);

	const handleSendMessage = useCallback(async () => {
		if (!inputMessage.trim() || isLoading) return;

		const messageToSend = inputMessage.trim();
		setInputMessage("");

		try {
			clearError();
			await sendMessage(messageToSend);
		} catch (err) {
			Alert.alert("Error", "Failed to send message. Please try again.");
			setInputMessage(messageToSend); // Restore message on error
		}
	}, [inputMessage, isLoading, sendMessage, clearError]);

	const handleShowGrammarDetails = useCallback((message: ChatMessage) => {
		setSelectedMessage(message);
		setShowGrammarDetails(true);
	}, []);

	const handleEndConversation = useCallback(async () => {
		if (!currentContext) return;

		try {
			const summary = await getConversationSummary();

			Alert.alert(
				"Conversation Summary",
				`${summary.summary}\n\nStrengths: ${summary.strengths.join(
					", "
				)}\n\nAreas for improvement: ${summary.areasForImprovement.join(", ")}`,
				[
					{ text: "Continue", style: "cancel" },
					{
						text: "End Conversation",
						style: "destructive",
						onPress: () => {
							clearConversation();
							setConversationStarted(false);
							setSelectedMessage(null);
							setShowGrammarDetails(false);
						},
					},
				]
			); // Complete the conversation practice task with gamification integration
			if (
				user &&
				currentContext &&
				currentContext.conversationHistory.length >= 5
			) {
				const conversationLength = currentContext.conversationHistory.length;
				const exchangeCount = Math.floor(conversationLength / 2); // Approximate exchanges

				// Award points for conversation practice
				await completeActivity("conversation_practice", 75, {
					exchangeCount,
					conversationTopic: selectedTopic,
					difficultyLevel: selectedLevel,
					messageCount: conversationLength,
				});
			}
		} catch (err) {
			Alert.alert("Error", "Failed to get conversation summary.");
		}
	}, [
		currentContext,
		getConversationSummary,
		clearConversation,
		completeActivity,
		user,
		selectedTopic,
		selectedLevel,
	]);
	const handleGoBack = () => {
		const goBackSafely = () => {
			if (navigation.canGoBack()) {
				navigation.goBack();
			} else {
				// Fallback to navigate to Practice tab if no back stack
				navigation.navigate("MainTabs", { screen: "Practice" });
			}
		};

		if (
			conversationStarted &&
			currentContext &&
			currentContext.conversationHistory.length > 2
		) {
			Alert.alert(
				"End Conversation?",
				"You have an active conversation. Are you sure you want to leave?",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Leave",
						style: "destructive",
						onPress: () => {
							clearConversation();
							goBackSafely();
						},
					},
				]
			);
		} else {
			goBackSafely();
		}
	};

	const renderGrammarError = (error: GrammarError, index: number) => (
		<View key={index} style={styles.grammarError}>
			<View style={styles.grammarErrorHeader}>
				<Ionicons name="warning" size={16} color={theme.colors.warning} />
				<Text style={styles.grammarErrorType}>{error.errorType}</Text>
			</View>
			<Text style={styles.grammarErrorOriginal}>
				Original: <Text style={styles.errorText}>{error.originalText}</Text>
			</Text>
			<Text style={styles.grammarErrorCorrected}>
				Corrected: <Text style={styles.correctText}>{error.correctedText}</Text>
			</Text>
			<Text style={styles.grammarErrorExplanation}>{error.explanation}</Text>
		</View>
	);

	const renderChatMessage = (message: ChatMessage, index: number) => (
		<View
			key={message.id}
			style={[
				styles.messageContainer,
				message.isUser ? styles.userMessage : styles.aiMessage,
			]}
		>
			<View
				style={[
					styles.messageBubble,
					message.isUser ? styles.userBubble : styles.aiBubble,
				]}
			>
				<Text
					style={[
						styles.messageText,
						message.isUser ? styles.userMessageText : styles.aiMessageText,
					]}
				>
					{message.content}
				</Text>
				<Text style={styles.messageTime}>
					{message.timestamp.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</Text>
			</View>
			{message.isUser &&
				message.grammarErrors &&
				message.grammarErrors.length > 0 && (
					<View style={styles.grammarFeedbackContainer}>
						<View style={styles.grammarHeader}>
							<Ionicons name="warning" size={16} color={theme.colors.warning} />
							<Text style={styles.grammarHeaderText}>
								{`Grammar Feedback (${message.grammarErrors.length} ${
									message.grammarErrors.length === 1 ? "issue" : "issues"
								})`}
							</Text>
						</View>
						{message.grammarErrors.map((error, index) => (
							<View key={index} style={styles.grammarErrorItem}>
								<View style={styles.grammarErrorHeader}>
									<Text style={styles.grammarErrorType}>
										{`${
											error.errorType.charAt(0).toUpperCase() +
											error.errorType.slice(1)
										} Error`}
									</Text>
								</View>
								<View style={styles.grammarErrorContent}>
									<Text style={styles.grammarErrorLabel}>Original:</Text>
									<Text style={styles.grammarErrorOriginal}>
										"{error.originalText}"
									</Text>
								</View>
								<View style={styles.grammarErrorContent}>
									<Text style={styles.grammarErrorLabel}>Correction:</Text>
									<Text style={styles.grammarErrorCorrected}>
										"{error.correctedText}"
									</Text>
								</View>
								{error.explanation && (
									<View style={styles.grammarErrorContent}>
										<Text style={styles.grammarErrorLabel}>Explanation:</Text>
										<Text style={styles.grammarErrorExplanation}>
											{error.explanation}
										</Text>
									</View>
								)}
							</View>
						))}
					</View>
				)}
			{message.isUser &&
				message.correctedVersion &&
				message.correctedVersion !== message.content && (
					<View style={styles.correctionContainer}>
						<Text style={styles.correctionLabel}>✅ Complete correction:</Text>
						<Text style={styles.correctionText}>
							{message.correctedVersion}
						</Text>
					</View>
				)}
		</View>
	);

	if (error && !conversationStarted) {
		return (
			<ErrorState
				title="AI Conversation Error"
				description={error}
				onRetry={clearError}
			/>
		);
	}

	if (
		!conversationStarted &&
		(!currentContext || !currentContext.conversationHistory.length)
	) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>AI Conversation Partner</Text>
				</View>
				<EmptyState
					title="No Conversation Started"
					description="Start a new conversation to practice your French with AI!"
				/>
				<View style={{ alignItems: "center", marginTop: 24 }}>
					<TouchableOpacity
						style={styles.startButton}
						onPress={handleStartConversation}
					>
						<Text style={styles.startButtonText}>Start Conversation</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<View style={styles.headerInfo}>
					<Text style={styles.headerTitle}>AI Chat Partner</Text>
					<Text style={styles.headerSubtitle}>
						{selectedTopic} • {selectedLevel}
					</Text>
				</View>
				<TouchableOpacity
					onPress={handleEndConversation}
					style={styles.endButton}
				>
					<Ionicons name="stop" size={20} color={theme.colors.error} />
				</TouchableOpacity>
			</View>

			{error && (
				<View style={styles.errorContainer}>
					<Ionicons name="warning" size={16} color={theme.colors.error} />
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity onPress={clearError}>
						<Ionicons name="close" size={16} color={theme.colors.error} />
					</TouchableOpacity>
				</View>
			)}

			{currentContext && (
				<View style={styles.performanceBar}>
					<View style={styles.performanceItem}>
						<Text style={styles.performanceLabel}>Grammar</Text>
						<Text style={styles.performanceValue}>
							{Math.round(currentContext.userPerformance.grammarAccuracy || 0)}%
						</Text>
					</View>
					<View style={styles.performanceItem}>
						<Text style={styles.performanceLabel}>Vocabulary</Text>
						<Text style={styles.performanceValue}>
							{Math.round(currentContext.userPerformance.vocabularyUsage || 0)}%
						</Text>
					</View>
					<View style={styles.performanceItem}>
						<Text style={styles.performanceLabel}>Flow</Text>
						<Text style={styles.performanceValue}>
							{Math.round(currentContext.userPerformance.conversationFlow || 0)}
							%
						</Text>
					</View>
				</View>
			)}

			<KeyboardAvoidingView
				style={styles.chatContainer}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<Animated.View
					style={[styles.messagesContainer, { opacity: fadeAnim }]}
				>
					<ScrollView
						ref={scrollViewRef}
						style={styles.messagesList}
						contentContainerStyle={styles.messagesContent}
						showsVerticalScrollIndicator={false}
					>
						{currentContext?.conversationHistory.map(renderChatMessage)}
						{isLoading && (
							<View style={styles.typingIndicator}>
								<ActivityIndicator size="small" color={theme.colors.primary} />
								<Text style={styles.typingText}>AI is typing...</Text>
							</View>
						)}
					</ScrollView>
				</Animated.View>

				<View style={styles.inputContainer}>
					<TextInput
						style={styles.messageInput}
						value={inputMessage}
						onChangeText={setInputMessage}
						placeholder="Type your message in French..."
						placeholderTextColor={theme.colors.textSecondary}
						multiline
						maxLength={500}
						editable={!isLoading}
					/>
					<TouchableOpacity
						style={[
							styles.sendButton,
							(!inputMessage.trim() || isLoading) && styles.disabledSendButton,
						]}
						onPress={handleSendMessage}
						disabled={!inputMessage.trim() || isLoading}
					>
						<Ionicons name="send" size={20} color="white" />
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>

			{/* Grammar Details Modal */}
			{showGrammarDetails && selectedMessage && (
				<View style={styles.modalOverlay}>
					<View style={styles.grammarModal}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Grammar Feedback</Text>
							<TouchableOpacity onPress={() => setShowGrammarDetails(false)}>
								<Ionicons name="close" size={24} color={theme.colors.text} />
							</TouchableOpacity>
						</View>

						<ScrollView style={styles.modalContent}>
							<Text style={styles.originalMessage}>Original message:</Text>
							<Text style={styles.originalMessageText}>
								{selectedMessage.content}
							</Text>

							{selectedMessage.correctedVersion && (
								<>
									<Text style={styles.correctedMessage}>
										Corrected version:
									</Text>
									<Text style={styles.correctedMessageText}>
										{selectedMessage.correctedVersion}
									</Text>
								</>
							)}

							{selectedMessage.grammarErrors?.map(renderGrammarError)}
						</ScrollView>
					</View>
				</View>
			)}
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
		justifyContent: "space-between",
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
		backgroundColor: theme.colors.surface,
	},
	backButton: {
		padding: theme.spacing.xs,
	},
	headerInfo: {
		flex: 1,
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
	},
	headerSubtitle: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginTop: 2,
	},
	endButton: {
		padding: theme.spacing.xs,
	},
	setupContainer: {
		flex: 1,
	},
	setupContent: {
		padding: theme.spacing.lg,
	},
	welcomeCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.large,
		padding: theme.spacing.lg,
		alignItems: "center",
		marginBottom: theme.spacing.lg,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	welcomeTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: theme.colors.text,
		marginTop: theme.spacing.md,
		marginBottom: theme.spacing.sm,
	},
	welcomeDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		textAlign: "center",
		lineHeight: 20,
	},
	setupSection: {
		marginBottom: theme.spacing.lg,
	},
	setupSectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	topicsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.sm,
	},
	topicButton: {
		backgroundColor: theme.colors.surface,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: theme.borderRadius.medium,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	selectedTopicButton: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	topicButtonText: {
		fontSize: 12,
		color: theme.colors.text,
		textTransform: "capitalize",
	},
	selectedTopicButtonText: {
		color: "white",
	},
	levelButton: {
		backgroundColor: theme.colors.surface,
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		borderRadius: theme.borderRadius.medium,
		borderWidth: 1,
		borderColor: theme.colors.border,
		marginBottom: theme.spacing.sm,
	},
	selectedLevelButton: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	levelButtonText: {
		fontSize: 14,
		color: theme.colors.text,
		textAlign: "center",
	},
	selectedLevelButtonText: {
		color: "white",
	},
	startButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 36,
		marginTop: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 4,
		elevation: 2,
	},
	disabledButton: {
		backgroundColor: theme.colors.textSecondary,
	},
	startButtonText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
		letterSpacing: 0.5,
	},
	errorContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFE5E5", // Light red background for errors
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		gap: theme.spacing.sm,
	},
	errorText: {
		flex: 1,
		fontSize: 12,
		color: theme.colors.error,
	},
	performanceBar: {
		flexDirection: "row",
		backgroundColor: theme.colors.surface,
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	performanceItem: {
		flex: 1,
		alignItems: "center",
	},
	performanceLabel: {
		fontSize: 10,
		color: theme.colors.textSecondary,
		marginBottom: 2,
	},
	performanceValue: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.primary,
	},
	chatContainer: {
		flex: 1,
	},
	messagesContainer: {
		flex: 1,
	},
	messagesList: {
		flex: 1,
	},
	messagesContent: {
		padding: theme.spacing.md,
		paddingBottom: theme.spacing.lg,
	},
	messageContainer: {
		marginBottom: theme.spacing.md,
	},
	userMessage: {
		alignItems: "flex-end",
	},
	aiMessage: {
		alignItems: "flex-start",
	},
	messageBubble: {
		maxWidth: "80%",
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: theme.borderRadius.large,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	userBubble: {
		backgroundColor: theme.colors.primary,
		borderBottomRightRadius: theme.borderRadius.small,
	},
	aiBubble: {
		backgroundColor: theme.colors.surface,
		borderBottomLeftRadius: theme.borderRadius.small,
	},
	messageText: {
		fontSize: 14,
		lineHeight: 20,
	},
	userMessageText: {
		color: "white",
	},
	aiMessageText: {
		color: theme.colors.text,
	},
	messageTime: {
		fontSize: 10,
		marginTop: theme.spacing.xs,
		opacity: 0.7,
	},
	grammarIndicator: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFF3E0", // Light orange background for warnings
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: theme.borderRadius.small,
		marginTop: theme.spacing.xs,
		gap: theme.spacing.xs,
	},
	grammarIndicatorText: {
		fontSize: 10,
		color: theme.colors.warning,
	},
	correctionContainer: {
		backgroundColor: "#E8F5E8", // Light green background for success
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: theme.borderRadius.small,
		marginTop: theme.spacing.xs,
	},
	correctionLabel: {
		fontSize: 10,
		color: theme.colors.success,
		fontWeight: "500",
		marginBottom: 2,
	},
	correctionText: {
		fontSize: 12,
		color: theme.colors.success,
		fontStyle: "italic",
	},
	typingIndicator: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: theme.spacing.md,
		gap: theme.spacing.sm,
	},
	typingText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		backgroundColor: theme.colors.surface,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
		gap: theme.spacing.sm,
	},
	messageInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: theme.borderRadius.large,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		fontSize: 14,
		color: theme.colors.text,
		backgroundColor: theme.colors.background,
		maxHeight: 100,
	},
	sendButton: {
		backgroundColor: theme.colors.primary,
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	disabledSendButton: {
		backgroundColor: theme.colors.textSecondary,
	},
	modalOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	grammarModal: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.large,
		margin: theme.spacing.lg,
		maxHeight: "70%",
		width: "90%",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
	},
	modalContent: {
		padding: theme.spacing.lg,
	},
	originalMessage: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
	},
	originalMessageText: {
		fontSize: 14,
		color: theme.colors.text,
		backgroundColor: "#FFE5E5", // Light red background for errors
		padding: theme.spacing.sm,
		borderRadius: theme.borderRadius.small,
		marginBottom: theme.spacing.md,
	},
	correctedMessage: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
	},
	correctedMessageText: {
		fontSize: 14,
		color: theme.colors.text,
		backgroundColor: "#E8F5E8", // Light green background for success
		padding: theme.spacing.sm,
		borderRadius: theme.borderRadius.small,
		marginBottom: theme.spacing.md,
	},
	grammarError: {
		backgroundColor: theme.colors.background,
		padding: theme.spacing.md,
		borderRadius: theme.borderRadius.small,
		marginBottom: theme.spacing.sm,
		borderLeftWidth: 3,
		borderLeftColor: theme.colors.warning,
	},
	grammarErrorHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.xs,
		gap: theme.spacing.xs,
	},
	grammarErrorType: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.warning,
		textTransform: "capitalize",
	},
	correctText: {
		color: theme.colors.success,
		fontWeight: "500",
	},
	// New grammar feedback styles
	grammarFeedbackContainer: {
		backgroundColor: "#FFF9F0", // Light orange background
		borderRadius: theme.borderRadius.small,
		padding: theme.spacing.sm,
		marginTop: theme.spacing.xs,
		borderLeftWidth: 3,
		borderLeftColor: theme.colors.warning,
	},
	grammarHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.sm,
		gap: theme.spacing.xs,
	},
	grammarHeaderText: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.warning,
	},
	grammarErrorItem: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.small,
		padding: theme.spacing.sm,
		marginBottom: theme.spacing.xs,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	grammarErrorContent: {
		marginBottom: theme.spacing.xs,
	},
	grammarErrorLabel: {
		fontSize: 11,
		fontWeight: "600",
		color: theme.colors.textSecondary,
		marginBottom: 2,
	},
	grammarErrorOriginal: {
		fontSize: 12,
		color: "#D32F2F", // Red for original text
		fontStyle: "italic",
		marginBottom: theme.spacing.xs,
	},
	grammarErrorCorrected: {
		fontSize: 12,
		color: "#2E7D32", // Green for corrected text
		fontWeight: "500",
		marginBottom: theme.spacing.xs,
	},
	grammarErrorExplanation: {
		fontSize: 11,
		color: theme.colors.text,
		lineHeight: 16,
		fontStyle: "italic",
	},
});
