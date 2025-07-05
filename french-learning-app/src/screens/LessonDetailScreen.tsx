import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { LearningService } from "../services/LearningService";
import {
	LearningLesson,
	ContentSection,
	LessonExample,
} from "../types/LearningTypes";

const { width } = Dimensions.get("window");

interface LessonDetailScreenProps {
	navigation: any;
	route: {
		params: {
			lessonId: number;
			bookId: number;
		};
	};
}

export const LessonDetailScreen: React.FC<LessonDetailScreenProps> = ({
	navigation,
	route,
}) => {
	const { lessonId, bookId } = route.params;
	const { user } = useAuth();
	const scrollViewRef = useRef<ScrollView>(null);

	const [lesson, setLesson] = useState<LearningLesson | null>(null);
	const [loading, setLoading] = useState(true);
	const [currentSection, setCurrentSection] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentlyPlayingAudio, setCurrentlyPlayingAudio] =
		useState<Audio.Sound | null>(null);
	const [readingProgress, setReadingProgress] = useState(0);

	useEffect(() => {
		loadLessonDetails();
		return () => {
			// Cleanup audio when component unmounts
			if (currentlyPlayingAudio) {
				currentlyPlayingAudio.unloadAsync();
			}
		};
	}, [lessonId]);

	const loadLessonDetails = async () => {
		try {
			setLoading(true);
			const response = await LearningService.getLesson(lessonId, user?.id);

			if (response.success && response.data) {
				setLesson(response.data);
				// Mark lesson as started
				await LearningService.updateLessonProgress(user?.id || "", {
					lesson_id: lessonId,
					action: "start_lesson",
				});
			} else {
				Alert.alert("Error", "Failed to load lesson details.");
				navigation.goBack();
			}
		} catch (error) {
			console.error("Error loading lesson:", error);
			Alert.alert("Error", "Failed to load lesson. Please try again.");
			navigation.goBack();
		} finally {
			setLoading(false);
		}
	};

	const playAudio = async (audioUrl: string, text?: string) => {
		try {
			// Stop any currently playing audio
			if (currentlyPlayingAudio) {
				await currentlyPlayingAudio.stopAsync();
				await currentlyPlayingAudio.unloadAsync();
			}

			setIsPlaying(true);

			if (audioUrl && audioUrl.startsWith("http")) {
				// Play from URL
				const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
				setCurrentlyPlayingAudio(sound);

				sound.setOnPlaybackStatusUpdate((status) => {
					if (status.isLoaded && status.didJustFinish) {
						setIsPlaying(false);
						setCurrentlyPlayingAudio(null);
					}
				});

				await sound.playAsync();
			} else if (text) {
				// Use text-to-speech as fallback
				Speech.speak(text, {
					language: "fr-FR",
					pitch: 1.0,
					rate: 0.8,
					onDone: () => setIsPlaying(false),
					onError: () => setIsPlaying(false),
				});
			}
		} catch (error) {
			console.error("Error playing audio:", error);
			setIsPlaying(false);

			// Fallback to text-to-speech
			if (text) {
				Speech.speak(text, {
					language: "fr-FR",
					pitch: 1.0,
					rate: 0.8,
					onDone: () => setIsPlaying(false),
					onError: () => setIsPlaying(false),
				});
			}
		}
	};

	const stopAudio = async () => {
		try {
			if (currentlyPlayingAudio) {
				await currentlyPlayingAudio.stopAsync();
				await currentlyPlayingAudio.unloadAsync();
				setCurrentlyPlayingAudio(null);
			}
			Speech.stop();
			setIsPlaying(false);
		} catch (error) {
			console.error("Error stopping audio:", error);
		}
	};

	const handleCompleteLesson = async () => {
		try {
			await LearningService.updateLessonProgress(user?.id || "", {
				lesson_id: lessonId,
				action: "complete_lesson",
			});

			Alert.alert(
				"Lesson Complete!",
				"Great job! You've completed this lesson. Ready to take the test?",
				[
					{ text: "Not Yet", style: "cancel" },
					{
						text: "Take Test",
						onPress: () =>
							navigation.navigate("LessonTest", {
								lessonId,
								bookId,
							}),
					},
				]
			);
		} catch (error) {
			console.error("Error completing lesson:", error);
			Alert.alert("Error", "Failed to mark lesson as complete.");
		}
	};

	const renderContentSection = (section: ContentSection, index: number) => {
		const isActive = index === currentSection;

		return (
			<View
				key={section.id}
				style={[styles.contentSection, isActive && styles.activeSect]}
			>
				{section.title && (
					<Text style={styles.sectionTitle}>{section.title}</Text>
				)}

				<Text style={styles.sectionContent}>{section.content}</Text>

				{(section.audio_url || section.content) && (
					<TouchableOpacity
						style={styles.audioButton}
						onPress={() =>
							isPlaying
								? stopAudio()
								: playAudio(section.audio_url || "", section.content)
						}
					>
						<Ionicons
							name={isPlaying ? "pause-circle" : "play-circle"}
							size={24}
							color={theme.colors.primary}
						/>
						<Text style={styles.audioButtonText}>
							{isPlaying ? "Stop Audio" : "Listen"}
						</Text>
					</TouchableOpacity>
				)}

				{section.interactive_elements &&
					section.interactive_elements.length > 0 && (
						<View style={styles.interactiveSection}>
							<Text style={styles.interactiveTitle}>Try it yourself:</Text>
							{section.interactive_elements.map((element, idx) => (
								<TouchableOpacity
									key={idx}
									style={styles.interactiveElement}
									onPress={() => {
										if (
											element.type === "click_to_hear" &&
											element.data?.text
										) {
											playAudio("", element.data.text);
										}
									}}
								>
									<Ionicons
										name="volume-high"
										size={20}
										color={theme.colors.primary}
									/>
									<Text style={styles.interactiveText}>
										{element.data?.text || "Interactive element"}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
			</View>
		);
	};

	const renderExample = (example: LessonExample, index: number) => (
		<View key={index} style={styles.exampleCard}>
			<View style={styles.exampleHeader}>
				<Text style={styles.exampleTitle}>Example {index + 1}</Text>
				{(example.audio_url || example.french_text) && (
					<TouchableOpacity
						style={styles.exampleAudioBtn}
						onPress={() =>
							playAudio(example.audio_url || "", example.french_text)
						}
					>
						<Ionicons
							name="volume-high"
							size={20}
							color={theme.colors.primary}
						/>
					</TouchableOpacity>
				)}
			</View>

			<View style={styles.exampleContent}>
				<Text style={styles.frenchText}>{example.french_text}</Text>
				<Text style={styles.englishText}>{example.english_translation}</Text>

				{example.context && (
					<Text style={styles.contextNote}>{example.context}</Text>
				)}
			</View>
		</View>
	);

	const renderVocabulary = () => {
		if (!lesson?.vocabulary_words || lesson.vocabulary_words.length === 0) {
			return null;
		}

		return (
			<View style={styles.vocabularySection}>
				<Text style={styles.sectionHeader}>Key Vocabulary</Text>
				<View style={styles.vocabularyGrid}>
					{lesson.vocabulary_words.map((word, index) => (
						<TouchableOpacity
							key={index}
							style={styles.vocabularyCard}
							onPress={() => playAudio("", word)}
						>
							<Text style={styles.vocabularyWord}>{word}</Text>
							<Ionicons
								name="volume-high"
								size={16}
								color={theme.colors.primary}
							/>
						</TouchableOpacity>
					))}
				</View>
			</View>
		);
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading lesson...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (!lesson) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.errorContainer}>
					<Ionicons
						name="alert-circle-outline"
						size={64}
						color={theme.colors.error}
					/>
					<Text style={styles.errorTitle}>Lesson Not Found</Text>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => navigation.goBack()}
					>
						<Text style={styles.backButtonText}>Go Back</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backBtn}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle} numberOfLines={1}>
					{lesson.title}
				</Text>
				<TouchableOpacity
					style={styles.audioToggle}
					onPress={isPlaying ? stopAudio : () => {}}
				>
					<Ionicons
						name={isPlaying ? "pause" : "volume-high"}
						size={24}
						color={theme.colors.text}
					/>
				</TouchableOpacity>
			</View>

			<ScrollView
				ref={scrollViewRef}
				style={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Lesson Introduction */}
				{lesson.content.introduction && (
					<View style={styles.introSection}>
						<Text style={styles.introTitle}>Introduction</Text>
						<Text style={styles.introText}>{lesson.content.introduction}</Text>
						<TouchableOpacity
							style={styles.audioButton}
							onPress={() =>
								playAudio(lesson.audio_url || "", lesson.content.introduction)
							}
						>
							<Ionicons
								name="play-circle"
								size={24}
								color={theme.colors.primary}
							/>
							<Text style={styles.audioButtonText}>Listen to Introduction</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Main Content Sections */}
				{lesson.content.main_content &&
					lesson.content.main_content.length > 0 && (
						<View style={styles.mainContent}>
							<Text style={styles.sectionHeader}>Lesson Content</Text>
							{lesson.content.main_content.map((section, index) =>
								renderContentSection(section, index)
							)}
						</View>
					)}

				{/* Examples */}
				{lesson.examples && lesson.examples.length > 0 && (
					<View style={styles.examplesSection}>
						<Text style={styles.sectionHeader}>Examples</Text>
						{lesson.examples.map((example, index) =>
							renderExample(example, index)
						)}
					</View>
				)}

				{/* Vocabulary */}
				{renderVocabulary()}

				{/* Key Points */}
				{lesson.content.key_points && lesson.content.key_points.length > 0 && (
					<View style={styles.keyPointsSection}>
						<Text style={styles.sectionHeader}>Key Points</Text>
						{lesson.content.key_points.map((point, index) => (
							<View key={index} style={styles.keyPoint}>
								<Ionicons
									name="checkmark-circle"
									size={20}
									color={theme.colors.primary}
								/>
								<Text style={styles.keyPointText}>{point}</Text>
							</View>
						))}
					</View>
				)}

				{/* Cultural Notes */}
				{lesson.content.cultural_notes &&
					lesson.content.cultural_notes.length > 0 && (
						<View style={styles.culturalSection}>
							<Text style={styles.sectionHeader}>Cultural Notes</Text>
							{lesson.content.cultural_notes.map((note, index) => (
								<View key={index} style={styles.culturalNote}>
									<Ionicons
										name="information-circle"
										size={20}
										color={theme.colors.info}
									/>
									<Text style={styles.culturalNoteText}>{note}</Text>
								</View>
							))}
						</View>
					)}

				{/* Summary */}
				{lesson.content.summary && (
					<View style={styles.summarySection}>
						<Text style={styles.sectionHeader}>Summary</Text>
						<Text style={styles.summaryText}>{lesson.content.summary}</Text>
					</View>
				)}

				{/* Complete Lesson Button */}
				<View style={styles.completeSection}>
					<TouchableOpacity
						style={styles.completeButton}
						onPress={handleCompleteLesson}
					>
						<Ionicons name="checkmark-circle" size={24} color="white" />
						<Text style={styles.completeButtonText}>
							Complete Lesson & Take Test
						</Text>
					</TouchableOpacity>
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
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	backBtn: {
		padding: 4,
	},
	headerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		marginHorizontal: 16,
	},
	audioToggle: {
		padding: 4,
	},
	content: {
		flex: 1,
	},
	introSection: {
		padding: 20,
		backgroundColor: theme.colors.surface,
		margin: 20,
		borderRadius: 12,
	},
	introTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 12,
	},
	introText: {
		fontSize: 16,
		color: theme.colors.text,
		lineHeight: 24,
		marginBottom: 16,
	},
	mainContent: {
		paddingHorizontal: 20,
	},
	sectionHeader: {
		fontSize: 22,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 16,
		marginTop: 20,
	},
	contentSection: {
		marginBottom: 20,
		padding: 16,
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	activeSect: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primaryLight,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 8,
	},
	sectionContent: {
		fontSize: 16,
		color: theme.colors.text,
		lineHeight: 24,
		marginBottom: 12,
	},
	audioButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		gap: 8,
	},
	audioButtonText: {
		fontSize: 16,
		color: theme.colors.primary,
		fontWeight: "500",
	},
	interactiveSection: {
		marginTop: 16,
		padding: 12,
		backgroundColor: theme.colors.primaryLight,
		borderRadius: 8,
	},
	interactiveTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.primary,
		marginBottom: 8,
	},
	interactiveElement: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		gap: 8,
	},
	interactiveText: {
		fontSize: 16,
		color: theme.colors.text,
		fontStyle: "italic",
	},
	examplesSection: {
		paddingHorizontal: 20,
	},
	exampleCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	exampleHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	exampleTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.primary,
	},
	exampleAudioBtn: {
		padding: 4,
	},
	exampleContent: {
		gap: 8,
	},
	frenchText: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
	},
	englishText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	phoneticText: {
		fontSize: 14,
		color: theme.colors.info,
		fontFamily: "monospace",
	},
	contextNote: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		backgroundColor: theme.colors.primaryLight,
		padding: 8,
		borderRadius: 6,
	},
	vocabularySection: {
		paddingHorizontal: 20,
	},
	vocabularyGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	vocabularyCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: theme.colors.border,
		gap: 6,
	},
	vocabularyWord: {
		fontSize: 14,
		color: theme.colors.text,
		fontWeight: "500",
	},
	keyPointsSection: {
		paddingHorizontal: 20,
	},
	keyPoint: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 8,
		gap: 8,
	},
	keyPointText: {
		flex: 1,
		fontSize: 16,
		color: theme.colors.text,
		lineHeight: 22,
	},
	culturalSection: {
		paddingHorizontal: 20,
	},
	culturalNote: {
		flexDirection: "row",
		alignItems: "flex-start",
		backgroundColor: theme.colors.primaryLight,
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
		gap: 8,
	},
	culturalNoteText: {
		flex: 1,
		fontSize: 15,
		color: theme.colors.text,
		lineHeight: 21,
	},
	summarySection: {
		paddingHorizontal: 20,
	},
	summaryText: {
		fontSize: 16,
		color: theme.colors.text,
		lineHeight: 24,
		backgroundColor: theme.colors.surface,
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	completeSection: {
		padding: 20,
		paddingBottom: 40,
	},
	completeButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.primary,
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
	},
	completeButtonText: {
		fontSize: 18,
		fontWeight: "600",
		color: "white",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: theme.colors.textSecondary,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 40,
	},
	errorTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.text,
		marginTop: 16,
		marginBottom: 24,
	},
	backButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	backButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "white",
	},
});
