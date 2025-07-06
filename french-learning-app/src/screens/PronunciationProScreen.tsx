import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { theme } from "../constants/theme";

interface PronunciationProScreenProps {
	navigation: any;
}

interface PronunciationWord {
	id: string;
	word: string;
	phonetic: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	meaning: string;
	audioUrl?: string;
}

interface PronunciationExercise {
	id: string;
	title: string;
	words: PronunciationWord[];
	type: "word" | "sentence" | "tongue-twister";
}

export const PronunciationProScreen: React.FC<PronunciationProScreenProps> = ({
	navigation,
}) => {
	const [currentTab, setCurrentTab] = useState<
		"practice" | "test" | "progress"
	>("practice");
	const [isRecording, setIsRecording] = useState(false);
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [currentWord, setCurrentWord] = useState<PronunciationWord | null>(
		null
	);
	const [wordIndex, setWordIndex] = useState(0);
	const [scores, setScores] = useState<{ [key: string]: number }>({});
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [lastScore, setLastScore] = useState<number | null>(null);

	const waveAnimation = useRef(new Animated.Value(0)).current;

	// Mock data for pronunciation exercises
	const exercises: PronunciationExercise[] = [
		{
			id: "1",
			title: "Basic Vowels",
			type: "word",
			words: [
				{
					id: "1",
					word: "eau",
					phonetic: "/o/",
					difficulty: "beginner",
					meaning: "water",
				},
				{
					id: "2",
					word: "rue",
					phonetic: "/ʁy/",
					difficulty: "beginner",
					meaning: "street",
				},
				{
					id: "3",
					word: "cœur",
					phonetic: "/kœʁ/",
					difficulty: "intermediate",
					meaning: "heart",
				},
			],
		},
		{
			id: "2",
			title: "French R Sound",
			type: "word",
			words: [
				{
					id: "4",
					word: "rouge",
					phonetic: "/ʁuʒ/",
					difficulty: "intermediate",
					meaning: "red",
				},
				{
					id: "5",
					word: "très",
					phonetic: "/tʁɛ/",
					difficulty: "intermediate",
					meaning: "very",
				},
				{
					id: "6",
					word: "parler",
					phonetic: "/paʁ.le/",
					difficulty: "advanced",
					meaning: "to speak",
				},
			],
		},
	];

	const [currentExercise, setCurrentExercise] = useState(exercises[0]);

	useEffect(() => {
		if (currentExercise.words.length > 0) {
			setCurrentWord(currentExercise.words[0]);
		}

		return () => {
			if (sound) {
				sound.unloadAsync();
			}
		};
	}, [currentExercise]);

	useEffect(() => {
		if (isRecording) {
			startWaveAnimation();
		} else {
			stopWaveAnimation();
		}
	}, [isRecording]);

	const startWaveAnimation = () => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(waveAnimation, {
					toValue: 1,
					duration: 500,
					useNativeDriver: true,
				}),
				Animated.timing(waveAnimation, {
					toValue: 0,
					duration: 500,
					useNativeDriver: true,
				}),
			])
		).start();
	};

	const stopWaveAnimation = () => {
		waveAnimation.setValue(0);
	};

	const playExampleAudio = async () => {
		try {
			// TODO: Implement actual audio playback with real pronunciation files
			Alert.alert("Playing Audio", `Pronunciation: ${currentWord?.phonetic}`);
		} catch (error) {
			Alert.alert("Error", "Could not play audio");
		}
	};

	const startRecording = async () => {
		try {
			const { status } = await Audio.requestPermissionsAsync();
			if (status !== "granted") {
				Alert.alert("Permission", "Audio recording permission is required");
				return;
			}

			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});

			const { recording } = await Audio.Recording.createAsync(
				Audio.RecordingOptionsPresets.HIGH_QUALITY
			);

			setRecording(recording);
			setIsRecording(true);
		} catch (error) {
			Alert.alert("Error", "Failed to start recording");
		}
	};

	const stopRecording = async () => {
		if (!recording) return;

		setIsRecording(false);
		await recording.stopAndUnloadAsync();

		const uri = recording.getURI();
		setRecording(null);

		if (uri) {
			await analyzePronunciation(uri);
		}
	};

	const analyzePronunciation = async (audioUri: string) => {
		setIsAnalyzing(true);

		// TODO: Integrate with Groq API or pronunciation analysis service
		setTimeout(() => {
			const mockScore = Math.floor(Math.random() * 40) + 60; // Score between 60-100
			setLastScore(mockScore);

			if (currentWord) {
				setScores((prev) => ({
					...prev,
					[currentWord.id]: mockScore,
				}));
			}

			setIsAnalyzing(false);

			if (mockScore >= 80) {
				Alert.alert("Great!", "Excellent pronunciation!");
			} else if (mockScore >= 60) {
				Alert.alert(
					"Good",
					"Good effort! Try focusing on the emphasized sounds."
				);
			} else {
				Alert.alert("Keep Practicing", "Listen to the example and try again.");
			}
		}, 2000);
	};

	const nextWord = () => {
		if (wordIndex < currentExercise.words.length - 1) {
			const nextIndex = wordIndex + 1;
			setWordIndex(nextIndex);
			setCurrentWord(currentExercise.words[nextIndex]);
			setLastScore(null);
		} else {
			Alert.alert("Exercise Complete!", "Great job practicing pronunciation!", [
				{ text: "OK", onPress: () => setWordIndex(0) },
			]);
		}
	};

	const previousWord = () => {
		if (wordIndex > 0) {
			const prevIndex = wordIndex - 1;
			setWordIndex(prevIndex);
			setCurrentWord(currentExercise.words[prevIndex]);
			setLastScore(null);
		}
	};

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "beginner":
				return theme.colors.success;
			case "intermediate":
				return theme.colors.warning;
			case "advanced":
				return theme.colors.error;
			default:
				return theme.colors.primary;
		}
	};

	const getScoreColor = (score: number) => {
		if (score >= 80) return theme.colors.success;
		if (score >= 60) return theme.colors.warning;
		return theme.colors.error;
	};

	const renderPracticeTab = () => (
		<ScrollView style={styles.tabContent}>
			{/* Exercise Selection */}
			<View style={styles.exerciseSelector}>
				<Text style={styles.sectionTitle}>Choose Exercise</Text>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{exercises.map((exercise) => (
						<TouchableOpacity
							key={exercise.id}
							style={[
								styles.exerciseCard,
								currentExercise.id === exercise.id &&
									styles.selectedExerciseCard,
							]}
							onPress={() => {
								setCurrentExercise(exercise);
								setWordIndex(0);
								setLastScore(null);
							}}
						>
							<Text style={styles.exerciseTitle}>{exercise.title}</Text>
							<Text style={styles.exerciseType}>{exercise.type}</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			{/* Current Word Practice */}
			{currentWord && (
				<View style={styles.practiceContainer}>
					<View style={styles.wordHeader}>
						<Text style={styles.wordCounter}>
							{wordIndex + 1} of {currentExercise.words.length}
						</Text>
						<View
							style={[
								styles.difficultyBadge,
								{ backgroundColor: getDifficultyColor(currentWord.difficulty) },
							]}
						>
							<Text style={styles.difficultyText}>
								{currentWord.difficulty}
							</Text>
						</View>
					</View>

					<View style={styles.wordDisplay}>
						<Text style={styles.currentWordText}>{currentWord.word}</Text>
						<Text style={styles.phoneticText}>{currentWord.phonetic}</Text>
						<Text style={styles.meaningText}>{currentWord.meaning}</Text>
					</View>

					{lastScore && (
						<View
							style={[
								styles.scoreDisplay,
								{ backgroundColor: getScoreColor(lastScore) },
							]}
						>
							<Text style={styles.scoreText}>{lastScore}%</Text>
						</View>
					)}

					<View style={styles.audioControls}>
						<TouchableOpacity
							style={styles.playButton}
							onPress={playExampleAudio}
						>
							<Ionicons name="volume-high" size={24} color="white" />
							<Text style={styles.playButtonText}>Listen</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.recordButton,
								isRecording && styles.recordingButton,
							]}
							onPressIn={startRecording}
							onPressOut={stopRecording}
							disabled={isAnalyzing}
						>
							{isAnalyzing ? (
								<ActivityIndicator color="white" size="large" />
							) : (
								<>
									<Animated.View
										style={[
											styles.recordIcon,
											{
												transform: [
													{
														scale: waveAnimation.interpolate({
															inputRange: [0, 1],
															outputRange: [1, 1.2],
														}),
													},
												],
											},
										]}
									>
										<Ionicons
											name={isRecording ? "stop" : "mic"}
											size={32}
											color="white"
										/>
									</Animated.View>
									<Text style={styles.recordButtonText}>
										{isRecording ? "Recording..." : "Hold to Record"}
									</Text>
								</>
							)}
						</TouchableOpacity>
					</View>

					<View style={styles.navigationButtons}>
						<TouchableOpacity
							style={[
								styles.navButton,
								wordIndex === 0 && styles.disabledButton,
							]}
							onPress={previousWord}
							disabled={wordIndex === 0}
						>
							<Ionicons
								name="chevron-back"
								size={20}
								color={wordIndex === 0 ? "#ccc" : "white"}
							/>
							<Text
								style={[
									styles.navButtonText,
									wordIndex === 0 && styles.disabledButtonText,
								]}
							>
								Previous
							</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.navButton} onPress={nextWord}>
							<Text style={styles.navButtonText}>Next</Text>
							<Ionicons name="chevron-forward" size={20} color="white" />
						</TouchableOpacity>
					</View>
				</View>
			)}
		</ScrollView>
	);

	const renderTestTab = () => (
		<View style={styles.tabContent}>
			<Text style={styles.comingSoonTitle}>Pronunciation Test</Text>
			<Text style={styles.comingSoonText}>
				Take a comprehensive pronunciation test to assess your skills across
				different French sounds and receive detailed feedback.
			</Text>
			<TouchableOpacity style={styles.comingSoonButton}>
				<Ionicons name="flask-outline" size={24} color="white" />
				<Text style={styles.comingSoonButtonText}>
					Start Test (Coming Soon)
				</Text>
			</TouchableOpacity>
		</View>
	);

	const renderProgressTab = () => (
		<ScrollView style={styles.tabContent}>
			<Text style={styles.sectionTitle}>Your Progress</Text>

			<View style={styles.progressOverview}>
				<View style={styles.progressCard}>
					<Text style={styles.progressNumber}>
						{Object.keys(scores).length}
					</Text>
					<Text style={styles.progressLabel}>Words Practiced</Text>
				</View>

				<View style={styles.progressCard}>
					<Text style={styles.progressNumber}>
						{Object.values(scores).length > 0
							? Math.round(
									Object.values(scores).reduce((a, b) => a + b, 0) /
										Object.values(scores).length
							  )
							: 0}
						%
					</Text>
					<Text style={styles.progressLabel}>Average Score</Text>
				</View>
			</View>

			<Text style={styles.sectionTitle}>Recent Scores</Text>
			{Object.entries(scores).map(([wordId, score]) => {
				const word = exercises
					.flatMap((e) => e.words)
					.find((w) => w.id === wordId);
				return word ? (
					<View key={wordId} style={styles.scoreItem}>
						<View>
							<Text style={styles.scoreItemWord}>{word.word}</Text>
							<Text style={styles.scoreItemPhonetic}>{word.phonetic}</Text>
						</View>
						<View
							style={[
								styles.scoreItemScore,
								{ backgroundColor: getScoreColor(score) },
							]}
						>
							<Text style={styles.scoreItemScoreText}>{score}%</Text>
						</View>
					</View>
				) : null;
			})}

			{Object.keys(scores).length === 0 && (
				<Text style={styles.emptyProgressText}>
					Start practicing to see your progress here!
				</Text>
			)}
		</ScrollView>
	);

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient colors={["#f093fb", "#f5576c"]} style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={24} color="white" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Pronunciation Pro</Text>
				<View style={styles.headerRight} />
			</LinearGradient>

			<View style={styles.tabBar}>
				{[
					{ key: "practice", title: "Practice", icon: "mic-outline" },
					{ key: "test", title: "Test", icon: "trophy-outline" },
					{ key: "progress", title: "Progress", icon: "analytics-outline" },
				].map((tab) => (
					<TouchableOpacity
						key={tab.key}
						style={[styles.tab, currentTab === tab.key && styles.activeTab]}
						onPress={() => setCurrentTab(tab.key as any)}
					>
						<Ionicons
							name={tab.icon as any}
							size={20}
							color={
								currentTab === tab.key
									? theme.colors.primary
									: theme.colors.textSecondary
							}
						/>
						<Text
							style={[
								styles.tabText,
								currentTab === tab.key && styles.activeTabText,
							]}
						>
							{tab.title}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{currentTab === "practice" && renderPracticeTab()}
			{currentTab === "test" && renderTestTab()}
			{currentTab === "progress" && renderProgressTab()}
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
		paddingVertical: 15,
	},
	backButton: {
		padding: 5,
	},
	headerTitle: {
		flex: 1,
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
		textAlign: "center",
	},
	headerRight: {
		width: 34,
	},
	tabBar: {
		flexDirection: "row",
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	tab: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 15,
		gap: 5,
	},
	activeTab: {
		borderBottomWidth: 2,
		borderBottomColor: theme.colors.primary,
	},
	tabText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
	},
	activeTabText: {
		color: theme.colors.primary,
		fontWeight: "600",
	},
	tabContent: {
		flex: 1,
		padding: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 16,
	},
	exerciseSelector: {
		marginBottom: 24,
	},
	exerciseCard: {
		backgroundColor: "white",
		borderRadius: 12,
		padding: 16,
		marginRight: 12,
		minWidth: 120,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	selectedExerciseCard: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primaryLight,
	},
	exerciseTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 4,
	},
	exerciseType: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		textTransform: "capitalize",
	},
	practiceContainer: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	wordHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	wordCounter: {
		fontSize: 14,
		color: theme.colors.textSecondary,
	},
	difficultyBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	difficultyText: {
		fontSize: 12,
		color: "white",
		fontWeight: "600",
		textTransform: "capitalize",
	},
	wordDisplay: {
		alignItems: "center",
		marginBottom: 20,
	},
	currentWordText: {
		fontSize: 32,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 8,
	},
	phoneticText: {
		fontSize: 18,
		color: theme.colors.primary,
		fontStyle: "italic",
		marginBottom: 8,
	},
	meaningText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
	},
	scoreDisplay: {
		alignSelf: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginBottom: 20,
	},
	scoreText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "white",
	},
	audioControls: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 24,
	},
	playButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		flex: 1,
		marginRight: 8,
	},
	playButtonText: {
		color: "white",
		fontWeight: "600",
		marginTop: 4,
	},
	recordButton: {
		backgroundColor: theme.colors.error,
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		flex: 1,
		marginLeft: 8,
		minHeight: 80,
		justifyContent: "center",
	},
	recordingButton: {
		backgroundColor: "#ff4444",
	},
	recordIcon: {
		marginBottom: 4,
	},
	recordButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 12,
	},
	navigationButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	navButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		paddingHorizontal: 20,
		paddingVertical: 12,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	disabledButton: {
		backgroundColor: "#ccc",
	},
	navButtonText: {
		color: "white",
		fontWeight: "600",
	},
	disabledButtonText: {
		color: "#888",
	},
	comingSoonTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.text,
		textAlign: "center",
		marginTop: 40,
		marginBottom: 16,
	},
	comingSoonText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		lineHeight: 24,
		marginBottom: 32,
	},
	comingSoonButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		opacity: 0.7,
	},
	comingSoonButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 16,
	},
	progressOverview: {
		flexDirection: "row",
		gap: 16,
		marginBottom: 24,
	},
	progressCard: {
		flex: 1,
		backgroundColor: "white",
		borderRadius: 12,
		padding: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	progressNumber: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.primary,
		marginBottom: 4,
	},
	progressLabel: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		textAlign: "center",
	},
	scoreItem: {
		backgroundColor: "white",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	scoreItemWord: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
	},
	scoreItemPhonetic: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	scoreItemScore: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	scoreItemScoreText: {
		fontSize: 14,
		fontWeight: "bold",
		color: "white",
	},
	emptyProgressText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		fontStyle: "italic",
		marginTop: 32,
	},
});
