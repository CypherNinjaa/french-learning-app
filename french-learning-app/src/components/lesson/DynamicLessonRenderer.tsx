// Dynamic Lesson Renderer Component for Stage 4.1
import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	BackHandler,
	Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
	Lesson,
	UserProgress,
	LessonState,
	LessonAction,
	LessonSection,
	SectionProgress,
} from "../../types/LessonTypes";
import { LessonService } from "../../services/lessonService";
import { SpeechService } from "../../services/speechService";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { EmptyState } from "../../components/EmptyState";
import { FillInBlankRenderer } from "./question-types/FillInBlankRenderer";
import { useGamification } from "../../hooks/useGamification";

// Lesson state reducer
const lessonReducer = (
	state: LessonState,
	action: LessonAction
): LessonState => {
	switch (action.type) {
		case "LOAD_LESSON_START":
			return { ...state, loading: true, error: null };

		case "LOAD_LESSON_SUCCESS":
			return {
				...state,
				loading: false,
				lesson: action.payload.lesson,
				userProgress: action.payload.progress,
				currentSection: 0,
				sessionStartTime: Date.now(),
			};

		case "LOAD_LESSON_ERROR":
			return { ...state, loading: false, error: action.payload };
		case "SECTION_COMPLETE":
			if (!state.userProgress) return state;

			const updatedProgress = { ...state.userProgress };
			if (!updatedProgress.section_progress) {
				updatedProgress.section_progress = [];
			}

			const sectionIndex = updatedProgress.section_progress.findIndex(
				(sp) => sp.section_id === action.payload.sectionId
			);

			if (sectionIndex >= 0) {
				updatedProgress.section_progress[sectionIndex] = {
					...updatedProgress.section_progress[sectionIndex],
					completed: true,
					score: action.payload.score,
					time_spent: action.payload.timeSpent,
					completed_at: new Date().toISOString(),
				};
			} else {
				updatedProgress.section_progress.push({
					section_id: action.payload.sectionId,
					completed: true,
					score: action.payload.score,
					time_spent: action.payload.timeSpent,
					attempts: 1,
					completed_at: new Date().toISOString(),
				});
			}

			return {
				...state,
				userProgress: updatedProgress,
				canProceed: true,
			};

		case "LESSON_COMPLETE":
			return {
				...state,
				isCompleted: true,
				userProgress: state.userProgress
					? {
							...state.userProgress,
							status: "completed",
							score: action.payload.score,
							time_spent: action.payload.timeSpent,
							completed_at: new Date().toISOString(),
					  }
					: null,
			};

		case "NEXT_SECTION":
			return {
				...state,
				currentSection: Math.min(
					state.currentSection + 1,
					(state.lesson?.content.sections?.length ?? 1) - 1
				),
				canProceed: false,
			};

		case "PREVIOUS_SECTION":
			return {
				...state,
				currentSection: Math.max(state.currentSection - 1, 0),
			};

		case "UPDATE_TIME":
			return {
				...state,
				timeSpent: Math.floor((Date.now() - state.sessionStartTime) / 1000),
			};

		case "RESET_LESSON":
			return {
				lesson: null,
				userProgress: null,
				currentSection: 0,
				loading: false,
				error: null,
				isCompleted: false,
				canProceed: false,
				timeSpent: 0,
				sessionStartTime: Date.now(),
			};

		default:
			return state;
	}
};

interface DynamicLessonRendererProps {
	lessonId: number;
	userId: string;
	onComplete: (score: number, timeSpent: number) => void;
	onExit: () => void;
}

export const DynamicLessonRenderer: React.FC<DynamicLessonRendererProps> = ({
	lessonId,
	userId,
	onComplete,
	onExit,
}) => {
	const { completeActivity, refreshAll } = useGamification();

	const [state, dispatch] = useReducer(lessonReducer, {
		lesson: null,
		userProgress: null,
		currentSection: 0,
		loading: true,
		error: null,
		isCompleted: false,
		canProceed: false,
		timeSpent: 0,
		sessionStartTime: Date.now(),
	});

	// Timer for tracking time spent
	useEffect(() => {
		const timer = setInterval(() => {
			dispatch({ type: "UPDATE_TIME" });
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	// Handle back button
	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			() => {
				handleExit();
				return true;
			}
		);

		return () => backHandler.remove();
	}, []);

	// Load lesson data
	useEffect(() => {
		loadLesson();
	}, [lessonId, userId]);
	const loadLesson = async () => {
		try {
			dispatch({ type: "LOAD_LESSON_START" });

			const lesson = await LessonService.getLessonById(lessonId);
			console.log("Loaded lesson data:", JSON.stringify(lesson, null, 2));

			if (!lesson) {
				dispatch({ type: "LOAD_LESSON_ERROR", payload: "Lesson not found" });
				return;
			} // Validate lesson content structure
			if (!lesson.content) {
				console.warn("Lesson has no content, creating default structure");
				lesson.content = {
					introduction: lesson.title || "Welcome to this lesson",
					sections: [
						{
							id: "default-section",
							type: "text",
							title: lesson.title,
							content: "This lesson will help you learn French.",
							order_index: 0,
							is_required: true,
						},
					],
				};
			} else if (
				!lesson.content.sections ||
				lesson.content.sections.length === 0
			) {
				console.warn(
					"Lesson content has no sections, creating default section"
				);
				lesson.content.sections = [
					{
						id: "default-section",
						type: "text",
						title: lesson.title,
						content:
							lesson.content.introduction ||
							"This lesson will help you learn French.",
						order_index: 0,
						is_required: true,
					},
				];
			}

			// Ensure all sections have required properties
			lesson.content.sections = (lesson.content.sections ?? []).map(
				(section, index) => ({
					id: section.id || `section-${index}`,
					type: section.type || "text",
					title: section.title || `Section ${index + 1}`,
					content: section.content || "No content available",
					order_index: section.order_index ?? index,
					is_required: section.is_required ?? true,
				})
			);

			console.log("Processed lesson data:", JSON.stringify(lesson, null, 2));

			const progress = await LessonService.initializeProgress(userId, lessonId);

			dispatch({
				type: "LOAD_LESSON_SUCCESS",
				payload: { lesson, progress },
			});
		} catch (error) {
			console.error("Error loading lesson:", error);
			dispatch({
				type: "LOAD_LESSON_ERROR",
				payload: "Failed to load lesson",
			});
		}
	};

	const handleSectionComplete = useCallback(
		async (sectionId: string, score: number, timeSpent: number) => {
			dispatch({
				type: "SECTION_COMPLETE",
				payload: { sectionId, score, timeSpent },
			});

			// Update progress in database
			if (state.userProgress) {
				const updatedSectionProgress = [...state.userProgress.section_progress];
				const sectionIndex = updatedSectionProgress.findIndex(
					(sp) => sp.section_id === sectionId
				);

				if (sectionIndex >= 0) {
					updatedSectionProgress[sectionIndex] = {
						...updatedSectionProgress[sectionIndex],
						completed: true,
						score,
						time_spent: timeSpent,
						completed_at: new Date().toISOString(),
					};
				} else {
					updatedSectionProgress.push({
						section_id: sectionId,
						completed: true,
						score,
						time_spent: timeSpent,
						attempts: 1,
						completed_at: new Date().toISOString(),
					});
				}

				await LessonService.updateProgress(userId, lessonId, {
					section_progress: updatedSectionProgress,
				});
			}
		},
		[state.userProgress, userId, lessonId]
	);
	const handleLessonComplete = useCallback(
		async (finalScore: number, totalTime: number) => {
			try {
				dispatch({
					type: "LESSON_COMPLETE",
					payload: { score: finalScore, timeSpent: totalTime },
				});

				// Complete lesson in database with gamification integration
				await LessonService.completeLesson(
					userId,
					lessonId,
					finalScore,
					totalTime
				);

				// Trigger gamification activity completion for UI feedback
				const gamificationResult = await completeActivity(
					"lesson_completion",
					50, // Base points as per gamification rules
					{
						lessonId,
						score: finalScore,
						timeSpent: totalTime,
						isPerfectScore: finalScore >= 100,
						difficulty: state.lesson?.difficulty_level || "beginner",
					}
				);

				// Show achievement/points feedback if any were earned
				if (
					gamificationResult?.pointsEarned &&
					gamificationResult.pointsEarned.total_points > 0
				) {
					Alert.alert(
						"🎉 Lesson Complete!",
						`Great job! You earned ${gamificationResult.pointsEarned.total_points} points!` +
							(gamificationResult.newAchievements.length > 0
								? `\n\n🏆 New Achievement${
										gamificationResult.newAchievements.length > 1 ? "s" : ""
								  } Unlocked!`
								: ""),
						[
							{
								text: "Continue",
								onPress: () => onComplete(finalScore, totalTime),
							},
						]
					);
				} else {
					// Call parent completion handler
					onComplete(finalScore, totalTime);
				}
			} catch (error) {
				console.error("Error completing lesson:", error);
				Alert.alert("Error", "Failed to complete lesson. Please try again.");
			}
		},
		[userId, lessonId, onComplete, completeActivity, state.lesson]
	);

	const handleNextSection = () => {
		if (state.canProceed && state.lesson) {
			if (
				state.currentSection <
				(state.lesson.content.sections?.length ?? 0) - 1
			) {
				dispatch({ type: "NEXT_SECTION" });
			} else {
				// Last section completed - complete lesson
				const finalScore = calculateFinalScore();
				handleLessonComplete(finalScore, state.timeSpent);
			}
		}
	};

	const handlePreviousSection = () => {
		if (state.currentSection > 0) {
			dispatch({ type: "PREVIOUS_SECTION" });
		}
	};

	const handleExit = () => {
		Alert.alert(
			"Exit Lesson",
			"Are you sure you want to exit? Your progress will be saved.",
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Exit", onPress: onExit },
			]
		);
	};

	const calculateFinalScore = (): number => {
		if (!state.userProgress?.section_progress.length) return 0;

		const completedSections = state.userProgress.section_progress.filter(
			(sp) => sp.completed
		);
		if (completedSections.length === 0) return 0;

		const totalScore = completedSections.reduce(
			(sum, sp) => sum + (sp.score || 0),
			0
		);
		return Math.round(totalScore / completedSections.length);
	};

	const renderProgressBar = () => {
		if (!state.lesson) return null;

		const totalSections = state.lesson.content.sections?.length ?? 0;
		const progress = ((state.currentSection + 1) / totalSections) * 100;

		return (
			<View style={styles.progressContainer}>
				<View style={styles.progressBar}>
					<View style={[styles.progressFill, { width: `${progress}%` }]} />
				</View>
				<Text style={styles.progressText}>
					{state.currentSection + 1} / {totalSections}
				</Text>
			</View>
		);
	};

	const renderCurrentSection = () => {
		if (!state.lesson) return null;

		const currentSection = (state.lesson.content.sections ?? [])[
			state.currentSection
		];
		if (!currentSection) return null;

		// This will be expanded to render different section types
		return (
			<LessonSectionRenderer
				section={currentSection}
				onComplete={(score, timeSpent) =>
					handleSectionComplete(currentSection.id, score, timeSpent)
				}
			/>
		);
	};

	const renderNavigationButtons = () => {
		const isFirstSection = state.currentSection === 0;
		const isLastSection = state.lesson
			? state.currentSection ===
			  (state.lesson.content.sections?.length ?? 0) - 1
			: false;

		return (
			<View style={styles.navigationContainer}>
				<TouchableOpacity
					style={[styles.navButton, isFirstSection && styles.navButtonDisabled]}
					onPress={handlePreviousSection}
					disabled={isFirstSection}
				>
					<Ionicons
						name="chevron-back"
						size={24}
						color={isFirstSection ? "#ccc" : "#007AFF"}
					/>
					<Text
						style={[
							styles.navButtonText,
							isFirstSection && styles.navButtonTextDisabled,
						]}
					>
						Previous
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.navButton,
						!state.canProceed && styles.navButtonDisabled,
					]}
					onPress={handleNextSection}
					disabled={!state.canProceed}
				>
					<Text
						style={[
							styles.navButtonText,
							!state.canProceed && styles.navButtonTextDisabled,
						]}
					>
						{isLastSection ? "Complete" : "Next"}
					</Text>
					<Ionicons
						name={isLastSection ? "checkmark" : "chevron-forward"}
						size={24}
						color={!state.canProceed ? "#ccc" : "#007AFF"}
					/>
				</TouchableOpacity>
			</View>
		);
	};
	// Enhanced Book-style lesson renderer with speech functionality
	const renderBookStyleLesson = (lesson: Lesson) => {
		const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
		const [sectionTimeSpent, setSectionTimeSpent] = useState(0);

		const sections = lesson.content.sections ?? [];
		const currentSection = sections[currentSectionIndex];

		useEffect(() => {
			const timer = setInterval(() => {
				setSectionTimeSpent(prev => prev + 1);
			}, 1000);
			return () => clearInterval(timer);
		}, []);

		const handleNextSection = () => {
			if (currentSectionIndex < sections.length - 1) {
				setCurrentSectionIndex(prev => prev + 1);
				setSectionTimeSpent(0);
			} else {
				// Complete lesson
				const finalScore = 100; // You can implement scoring logic here
				handleLessonComplete(finalScore, state.timeSpent);
			}
		};

		const handlePreviousSection = () => {
			if (currentSectionIndex > 0) {
				setCurrentSectionIndex(prev => prev - 1);
				setSectionTimeSpent(0);
			}
		};

		const handleSpeak = (text: string) => {
			SpeechService.speakVocabulary(text);
		};

		if (!currentSection) {
			return (
				<View style={styles.container}>
					<Text style={styles.errorText}>No content available</Text>
				</View>
			);
		}

		const sectionContent = currentSection.content as any;

		return (
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={handleExit}>
						<Ionicons name="arrow-back" size={24} color="#333" />
					</TouchableOpacity>
					<Text style={styles.lessonTitle}>{lesson.title}</Text>
					<Text style={styles.timeDisplay}>
						{Math.floor(state.timeSpent / 60)}:{(state.timeSpent % 60).toString().padStart(2, '0')}
					</Text>
				</View>

				{/* Progress */}
				<View style={styles.progressContainer}>
					<View style={styles.progressBar}>
						<View style={[styles.progressFill, { width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }]} />
					</View>
					<Text style={styles.progressText}>
						{currentSectionIndex + 1} / {sections.length}
					</Text>
				</View>

				{/* Content */}
				<ScrollView style={styles.content}>
					<View style={styles.bookContainer}>
						{/* Introduction Section */}
						{sectionContent?.introduction_title && (
							<View style={styles.bookSection}>
								<View style={styles.titleRow}>
									<Text style={styles.bookSectionTitle}>{sectionContent.introduction_title}</Text>
									<TouchableOpacity 
										style={styles.speakButton}
										onPress={() => handleSpeak(sectionContent.introduction_content)}
									>
										<Ionicons name="volume-high" size={20} color="#007AFF" />
									</TouchableOpacity>
								</View>
								<Text style={styles.bookSectionContent}>{sectionContent.introduction_content}</Text>
							</View>
						)}

						{/* Explanation Section */}
						{sectionContent?.explanation_title && (
							<View style={styles.bookSection}>
								<View style={styles.titleRow}>
									<Text style={styles.bookSectionTitle}>{sectionContent.explanation_title}</Text>
									<TouchableOpacity 
										style={styles.speakButton}
										onPress={() => handleSpeak(sectionContent.explanation_content)}
									>
										<Ionicons name="volume-high" size={20} color="#007AFF" />
									</TouchableOpacity>
								</View>
								<Text style={styles.bookSectionContent}>{sectionContent.explanation_content}</Text>
							</View>
						)}

						{/* Example Section */}
						{sectionContent?.example && (
							<View style={styles.bookSection}>
								<View style={styles.titleRow}>
									<Text style={styles.bookSectionTitle}>Example</Text>
									<TouchableOpacity 
										style={styles.speakButton}
										onPress={() => handleSpeak(sectionContent.example)}
									>
										<Ionicons name="volume-high" size={20} color="#007AFF" />
									</TouchableOpacity>
								</View>
								<Text style={styles.exampleText}>{sectionContent.example}</Text>
							</View>
						)}
					</View>
				</ScrollView>

				{/* Navigation */}
				<View style={styles.navigationContainer}>
					<TouchableOpacity
						style={[styles.navButton, currentSectionIndex === 0 && styles.navButtonDisabled]}
						onPress={handlePreviousSection}
						disabled={currentSectionIndex === 0}
					>
						<Ionicons name="chevron-back" size={20} color={currentSectionIndex === 0 ? "#ccc" : "#007AFF"} />
						<Text style={[styles.navButtonText, currentSectionIndex === 0 && styles.navButtonTextDisabled]}>
							Previous
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.navButton}
						onPress={handleNextSection}
					>
						<Text style={styles.navButtonText}>
							{currentSectionIndex === sections.length - 1 ? "Complete" : "Next"}
						</Text>
						<Ionicons name="chevron-forward" size={20} color="#007AFF" />
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	if (state.loading) return <LoadingState />;
	if (state.error)
		return (
			<ErrorState
				title="Error"
				description={state.error}
				onRetry={loadLesson}
			/>
		);
	if (!state.lesson)
		return (
			<EmptyState
				title="Lesson not found."
				description="This lesson could not be loaded."
			/>
		);
	// Book-style lesson rendering - check if any section has book-style content
	const hasBookStyleContent = state.lesson.content.sections?.some(section => {
		const sectionContent = section.content as any;
		return sectionContent?.introduction_title || 
			   sectionContent?.explanation_title || 
			   sectionContent?.example;
	});

	if (hasBookStyleContent) {
		return renderBookStyleLesson(state.lesson);
	}

	if (
		!state.lesson.content.sections ||
		state.lesson.content.sections.length === 0
	) {
		return (
			<EmptyState
				title="No Content"
				description="This lesson has no sections yet. Please check back later!"
			/>
		);
	}

	if (state.isCompleted && state.userProgress) {
		// Calculate points and streaks dynamically
		const points = state.userProgress.score ?? 0;
		// Placeholder: streak = 1 for this lesson; replace with real streak logic if available
		const streak = 1;
		return (
			<View style={styles.completionContainer}>
				<Text style={styles.completionTitle}>Lesson Complete!</Text>
				<Text style={styles.completionScore}>Score: {points}</Text>
				<Text style={styles.completionScore}>Streak: {streak} 🔥</Text>
				<Text style={styles.completionTime}>
					Time: {state.userProgress.time_spent ?? 0} sec
				</Text>
				<TouchableOpacity style={styles.continueButton} onPress={onExit}>
					<Text style={styles.continueButtonText}>Continue</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={handleExit}>
					<Ionicons name="close" size={24} color="#007AFF" />
				</TouchableOpacity>
				<Text style={styles.lessonTitle}>{state.lesson?.title}</Text>
				{/* Timer hidden from UI, but still tracked in state */}
			</View>

			{renderProgressBar()}

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{renderCurrentSection()}
			</ScrollView>

			{renderNavigationButtons()}
		</SafeAreaView>
	);
};

// Enhanced section renderer that handles different content types
const LessonSectionRenderer: React.FC<{
	section: LessonSection;
	onComplete: (score: number, timeSpent: number) => void;
}> = ({ section, onComplete }) => {
	const [sectionStartTime] = useState(Date.now());

	// Pass score from child (e.g., quiz, fill-in-the-blank, etc.)
	const handleSectionComplete = (score = 100) => {
		const timeSpent = Math.floor((Date.now() - sectionStartTime) / 1000);
		onComplete(score, timeSpent);
	}; // Replace renderSectionContent with a dynamic renderer
	const renderSectionContent = () => {
		console.log("Rendering section:", JSON.stringify(section, null, 2));

		if (!section) {
			console.warn("Section is null or undefined");
			return (
				<View style={styles.sectionContent}>
					<Text style={styles.errorText}>No section data available</Text>
					<Text style={styles.sectionText}>
						This lesson may not have been properly configured.
					</Text>
				</View>
			);
		}

		if (!section.type) {
			console.warn("Section type is missing:", section);
			// Try to infer section type from content
			const inferredType =
				section.content?.words || section.content?.colors
					? "vocabulary"
					: section.content?.pronouns
					? "grammar"
					: "text";

			return (
				<View style={styles.sectionContent}>
					<Text style={styles.sectionText}>
						{typeof section.content === "string"
							? section.content
							: section.content?.introduction ||
							  section.content?.explanation ||
							  "This section contains learning content."}
					</Text>
					{inferredType === "vocabulary" &&
						section.content &&
						renderVocabularySection(section.content)}
					{inferredType === "grammar" &&
						section.content &&
						renderGrammarSection(section.content)}
				</View>
			);
		}

		try {
			switch (section.type) {
				case "vocabulary":
					return renderVocabularySection(section.content);
				case "grammar":
					return renderGrammarSection(section.content);
				case "practice": // Use 'practice' for fill-in-the-blank sections
					return (
						<FillInBlankRenderer
							question={section.content}
							onAnswer={(answers, isAllCorrect, timeSpent) =>
								handleSectionComplete(isAllCorrect ? 100 : 0)
							}
							isAnswered={false}
							userAnswer={[]}
							showCorrectAnswer={false}
							disabled={false}
							timeUp={false}
						/>
					);
				// Add more dynamic types as needed (e.g., quiz, pronunciation, etc.)
				case "text":
				default:
					return renderTextSection(section.content);
			}
		} catch (error) {
			console.error("Error rendering section content:", error);
			return (
				<View style={styles.sectionContent}>
					<Text style={styles.errorText}>Error loading section content</Text>
					<Text style={styles.sectionText}>
						Please try refreshing the lesson.
					</Text>
				</View>
			);
		}
	};
	const renderVocabularySection = (content: any) => {
		if (typeof content === "string") {
			return <Text style={styles.sectionText}>{content}</Text>;
		}

		if (!content) {
			return (
				<Text style={styles.sectionText}>No vocabulary content available</Text>
			);
		}

		const words =
			content.words ||
			content.colors ||
			content.numbers ||
			content.foods ||
			content.travel_words ||
			[];
		const explanation = content.explanation || "";

		return (
			<View>
				{explanation && (
					<Text style={styles.explanationText}>{explanation}</Text>
				)}
				<View style={styles.vocabularyGrid}>
					{words
						.map((word: any, index: number) => {
							// Safety check for word object
							if (!word || (!word.french && !word.text)) {
								return null;
							}

							const frenchWord = word.french || word.text || "";
							const englishWord = word.english || word.translation || "";

							return (
								<View key={index} style={styles.vocabularyCard}>
									{/* Listen button top-right */}
									<TouchableOpacity
										style={styles.listenButtonCard}
										onPress={() => SpeechService.speakVocabulary(frenchWord)}
										accessibilityLabel={`Listen to pronunciation of ${frenchWord}`}
									>
										<Ionicons name="volume-high" size={22} color="#007AFF" />
									</TouchableOpacity>
									<Text style={styles.frenchWord}>{frenchWord}</Text>
									<Text style={styles.englishWord}>{englishWord}</Text>
									{word.pronunciation && (
										<Text style={styles.pronunciationText}>
											/{word.pronunciation}/
										</Text>
									)}
									{word.example && (
										<Text style={styles.exampleText}>{word.example}</Text>
									)}
								</View>
							);
						})
						.filter(Boolean)}
				</View>
			</View>
		);
	};
	const renderGrammarSection = (content: any) => {
		if (typeof content === "string") {
			return <Text style={styles.sectionText}>{content}</Text>;
		}

		if (!content) {
			return (
				<Text style={styles.sectionText}>No grammar content available</Text>
			);
		}

		const pronouns = content.pronouns || [];
		const explanation = content.explanation || "";

		return (
			<View>
				{explanation && (
					<Text style={styles.explanationText}>{explanation}</Text>
				)}
				<View style={styles.grammarList}>
					{pronouns
						.map((pronoun: any, index: number) => {
							// Safety check for pronoun object
							if (!pronoun || (!pronoun.french && !pronoun.text)) {
								return null;
							}

							const frenchPronoun = pronoun.french || pronoun.text || "";
							const englishPronoun =
								pronoun.english || pronoun.translation || "";

							return (
								<View key={index} style={styles.grammarItem}>
									<TouchableOpacity
										style={styles.listenButtonCard}
										onPress={() => SpeechService.speakVocabulary(frenchPronoun)}
										accessibilityLabel={`Listen to pronunciation of ${frenchPronoun}`}
									>
										<Ionicons name="volume-high" size={22} color="#007AFF" />
									</TouchableOpacity>
									<Text style={styles.frenchWord}>{frenchPronoun}</Text>
									<Text style={styles.englishWord}>{englishPronoun}</Text>
									{pronoun.example && (
										<Text style={styles.exampleText}>"{pronoun.example}"</Text>
									)}
								</View>
							);
						})
						.filter(Boolean)}
				</View>
			</View>
		);
	};
	const renderTextSection = (content: any) => {
		if (typeof content === "string") {
			return <Text style={styles.sectionText}>{content}</Text>;
		}

		if (!content) {
			return <Text style={styles.sectionText}>No content available</Text>;
		}

		const text =
			content.text ||
			content.explanation ||
			content.introduction ||
			(typeof content === "object" ? JSON.stringify(content) : String(content));

		return <Text style={styles.sectionText}>{text}</Text>;
	};

	return (
		<View style={styles.sectionContainer}>
			{section.title && (
				<Text style={styles.sectionTitle}>{section.title}</Text>
			)}

			<View style={styles.sectionContent}>{renderSectionContent()}</View>

			<TouchableOpacity
				style={styles.completeButton}
				onPress={() => handleSectionComplete()}
			>
				<Text style={styles.completeButtonText}>Complete Section</Text>
			</TouchableOpacity>
		</View>
	);
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	lessonTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		flex: 1,
		textAlign: "center",
		marginHorizontal: 16,
	},
	timeDisplay: {
		fontSize: 16,
		color: "#666",
		fontWeight: "500",
	},
	progressContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	progressBar: {
		flex: 1,
		height: 6,
		backgroundColor: "#e0e0e0",
		borderRadius: 3,
		marginRight: 12,
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#007AFF",
		borderRadius: 3,
	},
	progressText: {
		fontSize: 14,
		color: "#666",
		fontWeight: "500",
	},
	content: {
		flex: 1,
		padding: 16,
	},
	sectionContainer: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#333",
		marginBottom: 8,
	},
	sectionType: {
		fontSize: 14,
		color: "#666",
		marginBottom: 16,
		textTransform: "capitalize",
	},
	sectionContent: {
		marginVertical: 16,
	},
	completeButton: {
		backgroundColor: "#007AFF",
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 24,
		alignItems: "center",
		marginTop: 16,
	},
	completeButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	navigationContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
	},
	navButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		backgroundColor: "#f0f0f0",
	},
	navButtonDisabled: {
		opacity: 0.5,
	},
	navButtonText: {
		fontSize: 16,
		color: "#007AFF",
		fontWeight: "600",
		marginHorizontal: 8,
	},
	navButtonTextDisabled: {
		color: "#ccc",
	},
	// Enhanced section styles
	sectionText: {
		fontSize: 16,
		lineHeight: 24,
		color: "#333",
		marginBottom: 16,
	},
	explanationText: {
		fontSize: 14,
		lineHeight: 20,
		color: "#666",
		fontStyle: "italic",
		marginBottom: 16,
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
	},
	vocabularyGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	vocabularyCard: {
		width: "48%",
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 18,
		marginBottom: 18,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
		position: "relative",
	},
	listenButtonCard: {
		position: "absolute",
		top: 10,
		right: 10,
		zIndex: 2,
		backgroundColor: "#f0f4ff",
		borderRadius: 20,
		padding: 6,
		// subtle shadow
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 2,
		elevation: 1,
	},
	grammarItem: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 18,
		marginBottom: 14,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 3,
		elevation: 2,
		position: "relative",
	},
	frenchWord: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#007AFF",
		marginBottom: 2,
		marginTop: 8,
	},
	englishWord: {
		fontSize: 16,
		color: "#333",
		marginBottom: 2,
	},
	pronunciationText: {
		fontSize: 14,
		color: "#666",
		fontStyle: "italic",
		marginBottom: 8,
	},
	exampleText: {
		fontSize: 14,
		color: "#666",
		lineHeight: 18,
		borderLeftWidth: 3,
		borderLeftColor: "#007AFF",
		paddingLeft: 8,
		marginTop: 6,
	},
	grammarList: {
		marginTop: 8,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		fontSize: 18,
		color: "#666",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
	errorText: {
		fontSize: 16,
		color: "#FF3B30",
		textAlign: "center",
		marginBottom: 24,
	},
	retryButton: {
		backgroundColor: "#007AFF",
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 24,
	},
	retryButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	completionContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
	completionTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: "#333",
		marginTop: 16,
		marginBottom: 8,
	},
	completionScore: {
		fontSize: 18,
		color: "#34C759",
		fontWeight: "600",
		marginBottom: 8,
	},
	completionTime: {
		fontSize: 16,
		color: "#666",
		marginBottom: 32,
	},
	continueButton: {
		backgroundColor: "#007AFF",
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 32,
	},
	continueButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},	listenButton: {
		marginLeft: 4,
		padding: 4,
		borderRadius: 16,
		backgroundColor: "#007AFF20",
		alignItems: "center",
		justifyContent: "center",
	},
	listenButtonText: {
		fontSize: 18,
		color: "#007AFF",
	},
	// Book-style lesson styles
	bookContainer: {
		padding: 20,
		backgroundColor: "#fff",
	},
	bookSection: {
		marginBottom: 24,
		backgroundColor: "#f8f9fa",
		borderRadius: 12,
		padding: 16,
		borderLeftWidth: 4,
		borderLeftColor: "#007AFF",
	},
	titleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	bookSectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		flex: 1,
	},
	bookSectionContent: {
		fontSize: 16,
		lineHeight: 24,
		color: "#444",
	},
	speakButton: {
		padding: 8,
		borderRadius: 20,
		backgroundColor: "#e3f2fd",
		marginLeft: 12,
	},
});
