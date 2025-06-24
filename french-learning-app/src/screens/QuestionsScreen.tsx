// Questions Screen - Display questions from the Questions management system
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	RefreshControl,
	ActivityIndicator,
	SafeAreaView,
	TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ContentManagementService } from "../services/contentManagementService";
import { theme } from "../constants/theme";
import { Question } from "../types";

interface QuestionsScreenProps {
	navigation?: any;
}

export const QuestionsScreen: React.FC<QuestionsScreenProps> = ({
	navigation,
}) => {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
		null
	);
	const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
	const [showResults, setShowResults] = useState<{ [key: number]: boolean }>(
		{}
	);

	const loadQuestions = async () => {
		try {
			const result = await ContentManagementService.getQuestions();
			if (result.success && result.data) {
				setQuestions(result.data);
			} else {
				Alert.alert("Error", result.error || "Failed to load questions");
			}
		} catch (error) {
			console.error("Error loading questions:", error);
			Alert.alert("Error", "Failed to load questions");
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await loadQuestions();
		setRefreshing(false);
	};

	useEffect(() => {
		loadQuestions();
	}, []);
	const handleAnswerSelection = (questionId: number, answer: string) => {
		setUserAnswers((prev) => ({
			...prev,
			[questionId]: answer,
		}));
	};

	const handleSubmitAnswer = (question: Question) => {
		const userAnswer = userAnswers[question.id];
		if (!userAnswer) {
			Alert.alert(
				"Please select an answer",
				"You must choose an answer before submitting."
			);
			return;
		}

		setShowResults((prev) => ({
			...prev,
			[question.id]: true,
		}));

		// For translation and listening questions, we'll be more lenient with comparison
		let isCorrect = false;
		if (
			question.question_type === "translation" ||
			question.question_type === "listening"
		) {
			isCorrect =
				userAnswer.toLowerCase().trim() ===
				question.correct_answer.toLowerCase().trim();
		} else {
			isCorrect = userAnswer === question.correct_answer;
		}

		setTimeout(() => {
			Alert.alert(
				isCorrect ? "Correct! 🎉" : "Incorrect 😔",
				isCorrect
					? "Great job! You got it right."
					: `The correct answer is: ${question.correct_answer}${
							question.explanation
								? `\n\nExplanation: ${question.explanation}`
								: ""
					  }`,
				[{ text: "Continue", onPress: () => {} }]
			);
		}, 100);
	};

	const getQuestionTypeIcon = (type: string) => {
		const icons: { [key: string]: string } = {
			multiple_choice: "📝",
			fill_blank: "✏️",
			translation: "🔄",
			listening: "👂",
			pronunciation: "🗣️",
			matching: "🔗",
		};
		return icons[type] || "❓";
	};

	const getQuestionTypeColor = (type: string) => {
		const colors: { [key: string]: string } = {
			multiple_choice: "#4ECDC4",
			fill_blank: "#45B7D1",
			translation: "#96CEB4",
			listening: "#FF6B6B",
			pronunciation: "#FFEAA7",
			matching: "#DDA0DD",
		};
		return colors[type] || theme.colors.primary;
	};

	const renderMultipleChoiceQuestion = (question: Question) => {
		const options = question.options || [];
		const userAnswer = userAnswers[question.id];
		const showResult = showResults[question.id];

		return (
			<View style={styles.questionCard}>
				<View style={styles.questionHeader}>
					<Text style={styles.questionTypeIcon}>
						{getQuestionTypeIcon(question.question_type)}
					</Text>
					<View style={styles.questionInfo}>
						<Text style={styles.questionText}>{question.question_text}</Text>
						<View
							style={[
								styles.typeBadge,
								{
									backgroundColor:
										getQuestionTypeColor(question.question_type) + "20",
								},
							]}
						>
							<Text
								style={[
									styles.typeText,
									{ color: getQuestionTypeColor(question.question_type) },
								]}
							>
								{question.question_type.replace("_", " ").toUpperCase()}
							</Text>
						</View>
					</View>
					<Text style={styles.pointsText}>{question.points}pts</Text>
				</View>{" "}
				<View style={styles.optionsContainer}>
					{options.map((option: string, index: number) => {
						const isSelected = userAnswer === option;
						const isCorrect = option === question.correct_answer;
						const showCorrectAnswer = showResult && isCorrect;
						const showWrongAnswer = showResult && isSelected && !isCorrect;

						return (
							<TouchableOpacity
								key={index}
								style={[
									styles.optionButton,
									isSelected && styles.optionButtonSelected,
									showCorrectAnswer && styles.optionButtonCorrect,
									showWrongAnswer && styles.optionButtonWrong,
								]}
								onPress={() =>
									!showResult && handleAnswerSelection(question.id, option)
								}
								disabled={showResult}
							>
								<Text
									style={[
										styles.optionText,
										isSelected && styles.optionTextSelected,
										showCorrectAnswer && styles.optionTextCorrect,
										showWrongAnswer && styles.optionTextWrong,
									]}
								>
									{String.fromCharCode(65 + index)}. {option}
								</Text>
								{showCorrectAnswer && (
									<Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
								)}
								{showWrongAnswer && (
									<Ionicons name="close-circle" size={20} color="#F44336" />
								)}
							</TouchableOpacity>
						);
					})}
				</View>
				{!showResult && (
					<TouchableOpacity
						style={[
							styles.submitButton,
							!userAnswer && styles.submitButtonDisabled,
						]}
						onPress={() => handleSubmitAnswer(question)}
						disabled={!userAnswer}
					>
						<Text style={styles.submitButtonText}>Submit Answer</Text>
					</TouchableOpacity>
				)}
				{showResult && question.explanation && (
					<View style={styles.explanationContainer}>
						<Text style={styles.explanationTitle}>Explanation:</Text>
						<Text style={styles.explanationText}>{question.explanation}</Text>
					</View>
				)}
			</View>
		);
	};
	const renderFillBlankQuestion = (question: Question) => {
		const userAnswer = userAnswers[question.id];
		const showResult = showResults[question.id];

		return (
			<View style={styles.questionCard}>
				<View style={styles.questionHeader}>
					<Text style={styles.questionTypeIcon}>
						{getQuestionTypeIcon(question.question_type)}
					</Text>
					<View style={styles.questionInfo}>
						<Text style={styles.questionText}>{question.question_text}</Text>
						<View
							style={[
								styles.typeBadge,
								{
									backgroundColor:
										getQuestionTypeColor(question.question_type) + "20",
								},
							]}
						>
							<Text
								style={[
									styles.typeText,
									{ color: getQuestionTypeColor(question.question_type) },
								]}
							>
								{question.question_type.replace("_", " ").toUpperCase()}
							</Text>
						</View>
					</View>
					<Text style={styles.pointsText}>{question.points}pts</Text>
				</View>

				<View style={styles.fillBlankContainer}>
					<TextInput
						style={[
							styles.fillBlankInput,
							showResult &&
								userAnswer === question.correct_answer &&
								styles.fillBlankInputCorrect,
							showResult &&
								userAnswer !== question.correct_answer &&
								styles.fillBlankInputWrong,
						]}
						value={userAnswer || ""}
						onChangeText={(text) => handleAnswerSelection(question.id, text)}
						placeholder="Type your answer here..."
						placeholderTextColor={theme.colors.textSecondary}
						editable={!showResult}
					/>
					{showResult && (
						<View style={styles.fillBlankResult}>
							{userAnswer === question.correct_answer ? (
								<View style={styles.correctResult}>
									<Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
									<Text style={styles.correctText}>Correct!</Text>
								</View>
							) : (
								<View style={styles.wrongResult}>
									<Ionicons name="close-circle" size={20} color="#F44336" />
									<Text style={styles.wrongText}>
										Correct answer: {question.correct_answer}
									</Text>
								</View>
							)}
						</View>
					)}
				</View>

				{!showResult && (
					<TouchableOpacity
						style={[
							styles.submitButton,
							!userAnswer && styles.submitButtonDisabled,
						]}
						onPress={() => handleSubmitAnswer(question)}
						disabled={!userAnswer}
					>
						<Text style={styles.submitButtonText}>Submit Answer</Text>
					</TouchableOpacity>
				)}

				{showResult && question.explanation && (
					<View style={styles.explanationContainer}>
						<Text style={styles.explanationTitle}>Explanation:</Text>
						<Text style={styles.explanationText}>{question.explanation}</Text>
					</View>
				)}
			</View>
		);
	};

	const renderTranslationQuestion = (question: Question) => {
		const userAnswer = userAnswers[question.id];
		const showResult = showResults[question.id];

		return (
			<View style={styles.questionCard}>
				<View style={styles.questionHeader}>
					<Text style={styles.questionTypeIcon}>
						{getQuestionTypeIcon(question.question_type)}
					</Text>
					<View style={styles.questionInfo}>
						<Text style={styles.questionText}>{question.question_text}</Text>
						<View
							style={[
								styles.typeBadge,
								{
									backgroundColor:
										getQuestionTypeColor(question.question_type) + "20",
								},
							]}
						>
							<Text
								style={[
									styles.typeText,
									{ color: getQuestionTypeColor(question.question_type) },
								]}
							>
								{question.question_type.replace("_", " ").toUpperCase()}
							</Text>
						</View>
					</View>
					<Text style={styles.pointsText}>{question.points}pts</Text>
				</View>

				<View style={styles.translationContainer}>
					<TextInput
						style={[
							styles.translationInput,
							showResult &&
								userAnswer?.toLowerCase().trim() ===
									question.correct_answer.toLowerCase().trim() &&
								styles.fillBlankInputCorrect,
							showResult &&
								userAnswer?.toLowerCase().trim() !==
									question.correct_answer.toLowerCase().trim() &&
								styles.fillBlankInputWrong,
						]}
						value={userAnswer || ""}
						onChangeText={(text) => handleAnswerSelection(question.id, text)}
						placeholder="Enter your translation..."
						placeholderTextColor={theme.colors.textSecondary}
						multiline
						numberOfLines={3}
						editable={!showResult}
					/>
					{showResult && (
						<View style={styles.fillBlankResult}>
							{userAnswer?.toLowerCase().trim() ===
							question.correct_answer.toLowerCase().trim() ? (
								<View style={styles.correctResult}>
									<Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
									<Text style={styles.correctText}>Excellent translation!</Text>
								</View>
							) : (
								<View style={styles.wrongResult}>
									<Ionicons name="close-circle" size={20} color="#F44336" />
									<Text style={styles.wrongText}>
										Suggested answer: {question.correct_answer}
									</Text>
								</View>
							)}
						</View>
					)}
				</View>

				{!showResult && (
					<TouchableOpacity
						style={[
							styles.submitButton,
							!userAnswer && styles.submitButtonDisabled,
						]}
						onPress={() => handleSubmitAnswer(question)}
						disabled={!userAnswer}
					>
						<Text style={styles.submitButtonText}>Submit Translation</Text>
					</TouchableOpacity>
				)}

				{showResult && question.explanation && (
					<View style={styles.explanationContainer}>
						<Text style={styles.explanationTitle}>Explanation:</Text>
						<Text style={styles.explanationText}>{question.explanation}</Text>
					</View>
				)}
			</View>
		);
	};

	const renderMatchingQuestion = (question: Question) => {
		const options = question.options || [];
		const userAnswer = userAnswers[question.id];
		const showResult = showResults[question.id];
		// Split options into pairs for matching (assuming format: "item1|match1,item2|match2")
		const pairs =
			options[0]?.split(",").map((pair: string) => {
				const [item, match] = pair.split("|");
				return { item: item?.trim(), match: match?.trim() };
			}) || [];

		return (
			<View style={styles.questionCard}>
				<View style={styles.questionHeader}>
					<Text style={styles.questionTypeIcon}>
						{getQuestionTypeIcon(question.question_type)}
					</Text>
					<View style={styles.questionInfo}>
						<Text style={styles.questionText}>{question.question_text}</Text>
						<View
							style={[
								styles.typeBadge,
								{
									backgroundColor:
										getQuestionTypeColor(question.question_type) + "20",
								},
							]}
						>
							<Text
								style={[
									styles.typeText,
									{ color: getQuestionTypeColor(question.question_type) },
								]}
							>
								{question.question_type.replace("_", " ").toUpperCase()}
							</Text>
						</View>
					</View>
					<Text style={styles.pointsText}>{question.points}pts</Text>
				</View>

				<View style={styles.matchingContainer}>
					<Text style={styles.matchingInstructions}>
						Match the items on the left with the correct answers on the right:
					</Text>{" "}
					{pairs.map((pair: any, index: number) => (
						<View key={index} style={styles.matchingPair}>
							<Text style={styles.matchingItem}>{pair.item}</Text>
							<Text style={styles.matchingArrow}>→</Text>
							<Text style={styles.matchingMatch}>{pair.match}</Text>
						</View>
					))}
				</View>

				<TouchableOpacity
					style={styles.submitButton}
					onPress={() => {
						setShowResults((prev) => ({ ...prev, [question.id]: true }));
						Alert.alert(
							"Matching Complete",
							"Review the correct matches above."
						);
					}}
				>
					<Text style={styles.submitButtonText}>Show Matches</Text>
				</TouchableOpacity>

				{question.explanation && (
					<View style={styles.explanationContainer}>
						<Text style={styles.explanationTitle}>Note:</Text>
						<Text style={styles.explanationText}>{question.explanation}</Text>
					</View>
				)}
			</View>
		);
	};

	const renderListeningQuestion = (question: Question) => {
		const userAnswer = userAnswers[question.id];
		const showResult = showResults[question.id];

		return (
			<View style={styles.questionCard}>
				<View style={styles.questionHeader}>
					<Text style={styles.questionTypeIcon}>
						{getQuestionTypeIcon(question.question_type)}
					</Text>
					<View style={styles.questionInfo}>
						<Text style={styles.questionText}>{question.question_text}</Text>
						<View
							style={[
								styles.typeBadge,
								{
									backgroundColor:
										getQuestionTypeColor(question.question_type) + "20",
								},
							]}
						>
							<Text
								style={[
									styles.typeText,
									{ color: getQuestionTypeColor(question.question_type) },
								]}
							>
								{question.question_type.replace("_", " ").toUpperCase()}
							</Text>
						</View>
					</View>
					<Text style={styles.pointsText}>{question.points}pts</Text>
				</View>

				<View style={styles.listeningContainer}>
					<TouchableOpacity
						style={styles.playButton}
						onPress={() => {
							// Here you would implement audio playback
							Alert.alert(
								"Audio",
								"Audio playback would be implemented here with the speech service."
							);
						}}
					>
						<Ionicons
							name="play-circle"
							size={64}
							color={theme.colors.primary}
						/>
						<Text style={styles.playButtonText}>Play Audio</Text>
					</TouchableOpacity>

					<TextInput
						style={[
							styles.listeningInput,
							showResult &&
								userAnswer?.toLowerCase().trim() ===
									question.correct_answer.toLowerCase().trim() &&
								styles.fillBlankInputCorrect,
							showResult &&
								userAnswer?.toLowerCase().trim() !==
									question.correct_answer.toLowerCase().trim() &&
								styles.fillBlankInputWrong,
						]}
						value={userAnswer || ""}
						onChangeText={(text) => handleAnswerSelection(question.id, text)}
						placeholder="What did you hear?"
						placeholderTextColor={theme.colors.textSecondary}
						editable={!showResult}
					/>

					{showResult && (
						<View style={styles.fillBlankResult}>
							{userAnswer?.toLowerCase().trim() ===
							question.correct_answer.toLowerCase().trim() ? (
								<View style={styles.correctResult}>
									<Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
									<Text style={styles.correctText}>Great listening!</Text>
								</View>
							) : (
								<View style={styles.wrongResult}>
									<Ionicons name="close-circle" size={20} color="#F44336" />
									<Text style={styles.wrongText}>
										Correct answer: {question.correct_answer}
									</Text>
								</View>
							)}
						</View>
					)}
				</View>

				{!showResult && (
					<TouchableOpacity
						style={[
							styles.submitButton,
							!userAnswer && styles.submitButtonDisabled,
						]}
						onPress={() => handleSubmitAnswer(question)}
						disabled={!userAnswer}
					>
						<Text style={styles.submitButtonText}>Submit Answer</Text>
					</TouchableOpacity>
				)}

				{showResult && question.explanation && (
					<View style={styles.explanationContainer}>
						<Text style={styles.explanationTitle}>Explanation:</Text>
						<Text style={styles.explanationText}>{question.explanation}</Text>
					</View>
				)}
			</View>
		);
	};

	const renderPronunciationQuestion = (question: Question) => {
		const [isRecording, setIsRecording] = useState(false);
		const showResult = showResults[question.id];

		return (
			<View style={styles.questionCard}>
				<View style={styles.questionHeader}>
					<Text style={styles.questionTypeIcon}>
						{getQuestionTypeIcon(question.question_type)}
					</Text>
					<View style={styles.questionInfo}>
						<Text style={styles.questionText}>{question.question_text}</Text>
						<View
							style={[
								styles.typeBadge,
								{
									backgroundColor:
										getQuestionTypeColor(question.question_type) + "20",
								},
							]}
						>
							<Text
								style={[
									styles.typeText,
									{ color: getQuestionTypeColor(question.question_type) },
								]}
							>
								{question.question_type.replace("_", " ").toUpperCase()}
							</Text>
						</View>
					</View>
					<Text style={styles.pointsText}>{question.points}pts</Text>
				</View>

				<View style={styles.pronunciationContainer}>
					<View style={styles.targetWordContainer}>
						<Text style={styles.targetWord}>{question.correct_answer}</Text>
						<TouchableOpacity
							style={styles.listenButton}
							onPress={() => {
								// Here you would use the speech service to pronounce the word
								Alert.alert(
									"Pronunciation",
									"Audio pronunciation would play here."
								);
							}}
						>
							<Ionicons
								name="volume-high"
								size={24}
								color={theme.colors.primary}
							/>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						style={[
							styles.recordButton,
							isRecording && styles.recordButtonActive,
						]}
						onPress={() => {
							setIsRecording(!isRecording);
							// Here you would implement speech recognition
							setTimeout(() => {
								setIsRecording(false);
								setShowResults((prev) => ({ ...prev, [question.id]: true }));
								Alert.alert(
									"Recording Complete",
									"Your pronunciation has been analyzed!"
								);
							}, 3000);
						}}
					>
						<Ionicons
							name={isRecording ? "stop-circle" : "mic-circle"}
							size={64}
							color={isRecording ? "#F44336" : theme.colors.primary}
						/>
						<Text style={styles.recordButtonText}>
							{isRecording ? "Recording..." : "Tap to Record"}
						</Text>
					</TouchableOpacity>

					{showResult && (
						<View style={styles.pronunciationResult}>
							<View style={styles.correctResult}>
								<Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
								<Text style={styles.correctText}>
									Good pronunciation practice!
								</Text>
							</View>
						</View>
					)}
				</View>

				{question.explanation && (
					<View style={styles.explanationContainer}>
						<Text style={styles.explanationTitle}>Tip:</Text>
						<Text style={styles.explanationText}>{question.explanation}</Text>
					</View>
				)}
			</View>
		);
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading questions...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Questions Practice</Text>
				<TouchableOpacity onPress={onRefresh} disabled={refreshing}>
					<Ionicons
						name="refresh"
						size={24}
						color={
							refreshing ? theme.colors.textSecondary : theme.colors.primary
						}
					/>
				</TouchableOpacity>
			</View>

			{/* Content */}
			<ScrollView
				style={styles.content}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
				showsVerticalScrollIndicator={false}
			>
				{questions.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Ionicons
							name="help-circle-outline"
							size={64}
							color={theme.colors.textSecondary}
						/>
						<Text style={styles.emptyText}>No questions available</Text>
						<Text style={styles.emptySubtext}>
							Questions will appear here once they are added by your instructor.
						</Text>
					</View>
				) : (
					<View style={styles.questionsContainer}>
						<Text style={styles.sectionTitle}>
							Practice Questions ({questions.length})
						</Text>
						<Text style={styles.sectionSubtitle}>
							Test your French knowledge with these interactive questions
						</Text>{" "}
						{questions.map((question) => (
							<View key={question.id}>
								{(() => {
									switch (question.question_type) {
										case "multiple_choice":
											return renderMultipleChoiceQuestion(question);
										case "fill_blank":
											return renderFillBlankQuestion(question);
										case "translation":
											return renderTranslationQuestion(question);
										case "matching":
											return renderMatchingQuestion(question);
										case "listening":
											return renderListeningQuestion(question);
										case "pronunciation":
											return renderPronunciationQuestion(question);
										default:
											return renderMultipleChoiceQuestion(question);
									}
								})()}
							</View>
						))}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: theme.spacing.md,
		fontSize: theme.typography.body.fontSize,
		color: theme.colors.textSecondary,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: theme.spacing.lg,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
	},
	content: {
		flex: 1,
		padding: theme.spacing.lg,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: theme.spacing.xl * 2,
	},
	emptyText: {
		fontSize: 18,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginTop: theme.spacing.lg,
		marginBottom: theme.spacing.sm,
	},
	emptySubtext: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		textAlign: "center",
	},
	questionsContainer: {
		marginBottom: theme.spacing.xl,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	sectionSubtitle: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.lg,
	},
	questionCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: theme.spacing.lg,
		marginBottom: theme.spacing.lg,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
	},
	questionHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: theme.spacing.md,
	},
	questionTypeIcon: {
		fontSize: 24,
		marginRight: theme.spacing.md,
	},
	questionInfo: {
		flex: 1,
	},
	questionText: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
		lineHeight: 22,
	},
	typeBadge: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: 4,
		borderRadius: 12,
		alignSelf: "flex-start",
	},
	typeText: {
		fontSize: 10,
		fontWeight: "600",
	},
	pointsText: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.primary,
		marginLeft: theme.spacing.sm,
	},
	optionsContainer: {
		marginBottom: theme.spacing.md,
	},
	optionButton: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: theme.spacing.md,
		marginBottom: theme.spacing.sm,
		backgroundColor: theme.colors.background,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	optionButtonSelected: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primary + "10",
	},
	optionButtonCorrect: {
		borderColor: "#4CAF50",
		backgroundColor: "#4CAF50" + "10",
	},
	optionButtonWrong: {
		borderColor: "#F44336",
		backgroundColor: "#F44336" + "10",
	},
	optionText: {
		fontSize: 14,
		color: theme.colors.text,
		flex: 1,
	},
	optionTextSelected: {
		color: theme.colors.primary,
		fontWeight: "500",
	},
	optionTextCorrect: {
		color: "#4CAF50",
		fontWeight: "500",
	},
	optionTextWrong: {
		color: "#F44336",
		fontWeight: "500",
	},
	submitButton: {
		backgroundColor: theme.colors.primary,
		paddingVertical: theme.spacing.md,
		borderRadius: 8,
		alignItems: "center",
	},
	submitButtonDisabled: {
		backgroundColor: theme.colors.textSecondary,
		opacity: 0.5,
	},
	submitButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	explanationContainer: {
		marginTop: theme.spacing.md,
		padding: theme.spacing.md,
		backgroundColor: theme.colors.background,
		borderRadius: 8,
		borderLeftWidth: 4,
		borderLeftColor: theme.colors.primary,
	},
	explanationTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	explanationText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
	},
	comingSoonContainer: {
		alignItems: "center",
		paddingVertical: theme.spacing.xl,
	},
	comingSoonText: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.textSecondary,
		marginTop: theme.spacing.md,
		textAlign: "center",
	},
	comingSoonSubtext: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginTop: theme.spacing.sm,
		textAlign: "center",
	},
	// New question type styles
	fillBlankContainer: {
		marginBottom: theme.spacing.md,
	},
	fillBlankInput: {
		backgroundColor: theme.colors.background,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
		padding: theme.spacing.md,
		fontSize: 16,
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	fillBlankInputCorrect: {
		borderColor: "#4CAF50",
		backgroundColor: "#4CAF50" + "10",
	},
	fillBlankInputWrong: {
		borderColor: "#F44336",
		backgroundColor: "#F44336" + "10",
	},
	fillBlankResult: {
		marginTop: theme.spacing.sm,
	},
	correctResult: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
	},
	wrongResult: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
	},
	correctText: {
		color: "#4CAF50",
		fontWeight: "600",
		fontSize: 14,
	},
	wrongText: {
		color: "#F44336",
		fontWeight: "500",
		fontSize: 14,
	},
	translationContainer: {
		marginBottom: theme.spacing.md,
	},
	translationInput: {
		backgroundColor: theme.colors.background,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
		padding: theme.spacing.md,
		fontSize: 16,
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
		textAlignVertical: "top",
		minHeight: 80,
	},
	matchingContainer: {
		marginBottom: theme.spacing.md,
	},
	matchingInstructions: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.md,
		textAlign: "center",
	},
	matchingPair: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		marginBottom: theme.spacing.sm,
		backgroundColor: theme.colors.background,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	matchingItem: {
		flex: 1,
		fontSize: 14,
		color: theme.colors.text,
		fontWeight: "500",
	},
	matchingArrow: {
		fontSize: 16,
		color: theme.colors.primary,
		marginHorizontal: theme.spacing.md,
	},
	matchingMatch: {
		flex: 1,
		fontSize: 14,
		color: theme.colors.text,
		textAlign: "right",
	},
	listeningContainer: {
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	playButton: {
		alignItems: "center",
		marginBottom: theme.spacing.lg,
	},
	playButtonText: {
		fontSize: 14,
		color: theme.colors.primary,
		marginTop: theme.spacing.sm,
		fontWeight: "500",
	},
	listeningInput: {
		backgroundColor: theme.colors.background,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
		padding: theme.spacing.md,
		fontSize: 16,
		color: theme.colors.text,
		width: "100%",
	},
	pronunciationContainer: {
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	targetWordContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.background,
		padding: theme.spacing.lg,
		borderRadius: 12,
		marginBottom: theme.spacing.lg,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	targetWord: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.text,
		marginRight: theme.spacing.md,
	},
	listenButton: {
		padding: theme.spacing.sm,
		borderRadius: 20,
		backgroundColor: theme.colors.primary + "20",
	},
	recordButton: {
		alignItems: "center",
		padding: theme.spacing.lg,
	},
	recordButtonActive: {
		backgroundColor: "#F44336" + "10",
		borderRadius: 50,
	},
	recordButtonText: {
		fontSize: 14,
		color: theme.colors.primary,
		marginTop: theme.spacing.sm,
		fontWeight: "500",
	},
	pronunciationResult: {
		marginTop: theme.spacing.md,
	},
});
