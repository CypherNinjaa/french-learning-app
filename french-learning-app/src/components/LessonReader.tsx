import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	SafeAreaView,
	Modal,
	StatusBar,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import { SpeechService } from "../services/speechService";
import { theme } from "../constants/theme";

const { width, height } = Dimensions.get("window");

interface LessonReaderProps {
	lesson: any;
	onClose: () => void;
	onComplete?: () => void;
}

interface ReadingProgress {
	lesson_id: string;
	current_section: number;
	scroll_position: number;
	completion_percentage: number;
	last_read_at: string;
}

export const LessonReader: React.FC<LessonReaderProps> = ({
	lesson,
	onClose,
	onComplete,
}) => {
	const [currentSection, setCurrentSection] = useState(0);
	const [readingProgress, setReadingProgress] =
		useState<ReadingProgress | null>(null);
	const [showTableOfContents, setShowTableOfContents] = useState(false);
	const [bookmarks, setBookmarks] = useState<any[]>([]);
	const [showBookmarks, setShowBookmarks] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [speechRate, setSpeechRate] = useState(0.75);

	useEffect(() => {
		loadReadingProgress();
		loadBookmarks();

		// Cleanup speech when component unmounts
		return () => {
			if (isSpeaking) {
				SpeechService.stopSpeaking();
			}
		};
	}, [lesson.id]);

	const loadReadingProgress = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data, error } = await supabase
				.from("lesson_reading_progress")
				.select("*")
				.eq("user_id", user.id)
				.eq("lesson_id", lesson.id)
				.single();

			if (data && !error) {
				setReadingProgress(data);
				setCurrentSection(data.current_section || 0);
			}
		} catch (error) {
			console.error("Error loading reading progress:", error);
		}
	};

	const loadBookmarks = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data, error } = await supabase
				.from("lesson_bookmarks")
				.select("*")
				.eq("user_id", user.id)
				.eq("lesson_id", lesson.id)
				.order("created_at", { ascending: false });

			if (data && !error) {
				setBookmarks(data);
			}
		} catch (error) {
			console.error("Error loading bookmarks:", error);
		}
	};

	const saveProgress = async (
		sectionIndex: number,
		scrollPosition: number = 0
	) => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const sections = lesson.content?.sections || [];
			const completionPercentage =
				sections.length > 0
					? Math.round(((sectionIndex + 1) / sections.length) * 100)
					: 100;

			const progressData = {
				user_id: user.id,
				lesson_id: lesson.id,
				current_section: sectionIndex,
				scroll_position: scrollPosition,
				completion_percentage: completionPercentage,
				last_read_at: new Date().toISOString(),
			};

			const { error } = await supabase
				.from("lesson_reading_progress")
				.upsert(progressData);

			if (!error) {
				setReadingProgress(progressData);

				// Mark lesson as completed if reached 100%
				if (completionPercentage === 100 && onComplete) {
					onComplete();
				}
			}
		} catch (error) {
			console.error("Error saving progress:", error);
		}
	};

	// Speech functionality
	const handleSpeakText = async (text: string, language: string = "fr-FR") => {
		try {
			if (isSpeaking) {
				await SpeechService.stopSpeaking();
				setIsSpeaking(false);
				return;
			}

			setIsSpeaking(true);
			await SpeechService.speakFrench(text, {
				language: language,
				rate: speechRate,
				pitch: 1.0,
				onStart: () => setIsSpeaking(true),
				onDone: () => setIsSpeaking(false),
				onStopped: () => setIsSpeaking(false),
				onError: (error) => {
					console.error("Speech error:", error);
					setIsSpeaking(false);
					Alert.alert(
						"Speech Error",
						"Could not play audio. Please try again."
					);
				},
			});
		} catch (error) {
			console.error("Speech service error:", error);
			setIsSpeaking(false);
			Alert.alert("Speech Error", "Speech service is not available.");
		}
	};

	const changeSpeechRate = () => {
		const rates = [0.5, 0.75, 1.0, 1.25];
		const rateLabels = ["Slow", "Normal", "Fast", "Very Fast"];
		const currentIndex = rates.indexOf(speechRate);
		const nextIndex = (currentIndex + 1) % rates.length;
		setSpeechRate(rates[nextIndex]);

		Alert.alert(
			"Speech Rate Changed",
			`Speech rate set to: ${rateLabels[nextIndex]}`,
			[{ text: "OK" }]
		);
	};

	const addBookmark = async (sectionIndex: number, note: string = "") => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const sections = lesson.content?.sections || [];
			const section = sections[sectionIndex];

			const bookmarkData = {
				user_id: user.id,
				lesson_id: lesson.id,
				section_index: sectionIndex,
				section_title: section?.title || `Section ${sectionIndex + 1}`,
				note: note,
				created_at: new Date().toISOString(),
			};

			const { error } = await supabase
				.from("lesson_bookmarks")
				.insert([bookmarkData]);

			if (!error) {
				loadBookmarks();
			}
		} catch (error) {
			console.error("Error adding bookmark:", error);
		}
	};

	const navigateToSection = (sectionIndex: number) => {
		setCurrentSection(sectionIndex);
		saveProgress(sectionIndex);
		setShowTableOfContents(false);
	};

	const goToNextSection = () => {
		const sections = lesson.content?.sections || [];
		if (currentSection < sections.length - 1) {
			const nextSection = currentSection + 1;
			setCurrentSection(nextSection);
			saveProgress(nextSection);
		}
	};

	const goToPreviousSection = () => {
		if (currentSection > 0) {
			const prevSection = currentSection - 1;
			setCurrentSection(prevSection);
			saveProgress(prevSection);
		}
	};

	const renderSection = (section: any, index: number) => {
		return (
			<View key={index} style={styles.sectionContainer}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>{section.title}</Text>
					{section.title && (
						<TouchableOpacity
							style={styles.speakButton}
							onPress={() => handleSpeakText(section.title, "fr-FR")}
						>
							<Ionicons
								name={isSpeaking ? "stop-circle" : "volume-high"}
								size={24}
								color={theme.colors.primary}
							/>
						</TouchableOpacity>
					)}
				</View>

				{section.content && (
					<View style={styles.contentSection}>
						<Text style={styles.sectionContent}>{section.content}</Text>
						<TouchableOpacity
							style={styles.speakButton}
							onPress={() => handleSpeakText(section.content, "en-US")}
						>
							<Ionicons
								name={isSpeaking ? "stop-circle" : "volume-high"}
								size={20}
								color={theme.colors.secondary}
							/>
						</TouchableOpacity>
					</View>
				)}

				{section.examples && section.examples.length > 0 && (
					<View style={styles.examplesContainer}>
						<Text style={styles.examplesTitle}>Examples:</Text>
						{section.examples.map((example: any, exIndex: number) => (
							<View key={exIndex} style={styles.exampleItem}>
								<View style={styles.exampleRow}>
									<Text style={styles.exampleFrench}>{example.french}</Text>
									<TouchableOpacity
										style={styles.speakButtonSmall}
										onPress={() => handleSpeakText(example.french, "fr-FR")}
									>
										<Ionicons
											name={isSpeaking ? "stop-circle" : "volume-high"}
											size={16}
											color={theme.colors.primary}
										/>
									</TouchableOpacity>
								</View>
								<Text style={styles.exampleEnglish}>{example.english}</Text>
								{example.pronunciation && (
									<Text style={styles.examplePronunciation}>
										🔊 {example.pronunciation}
									</Text>
								)}
								{example.context && (
									<Text style={styles.exampleContext}>
										💡 {example.context}
									</Text>
								)}
							</View>
						))}
					</View>
				)}
			</View>
		);
	};

	const renderTableOfContents = () => {
		const sections = lesson.content?.sections || [];

		return (
			<Modal
				visible={showTableOfContents}
				animationType="slide"
				presentationStyle="pageSheet"
			>
				<SafeAreaView style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>Table of Contents</Text>
						<TouchableOpacity onPress={() => setShowTableOfContents(false)}>
							<Ionicons name="close" size={24} color="#333" />
						</TouchableOpacity>
					</View>
					<ScrollView style={styles.modalContent}>
						{sections.map((section: any, index: number) => (
							<TouchableOpacity
								key={index}
								style={[
									styles.tocItem,
									currentSection === index && styles.tocItemActive,
								]}
								onPress={() => navigateToSection(index)}
							>
								<Text
									style={[
										styles.tocText,
										currentSection === index && styles.tocTextActive,
									]}
								>
									{index + 1}. {section.title}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</SafeAreaView>
			</Modal>
		);
	};

	const renderBookmarks = () => {
		return (
			<Modal
				visible={showBookmarks}
				animationType="slide"
				presentationStyle="pageSheet"
			>
				<SafeAreaView style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>Bookmarks</Text>
						<TouchableOpacity onPress={() => setShowBookmarks(false)}>
							<Ionicons name="close" size={24} color="#333" />
						</TouchableOpacity>
					</View>
					<ScrollView style={styles.modalContent}>
						{bookmarks.length === 0 ? (
							<View style={styles.emptyBookmarks}>
								<Ionicons name="bookmark-outline" size={48} color="#ccc" />
								<Text style={styles.emptyBookmarksText}>No bookmarks yet</Text>
							</View>
						) : (
							bookmarks.map((bookmark: any, index: number) => (
								<TouchableOpacity
									key={index}
									style={styles.bookmarkItem}
									onPress={() => {
										navigateToSection(bookmark.section_index);
										setShowBookmarks(false);
									}}
								>
									<Text style={styles.bookmarkTitle}>
										{bookmark.section_title}
									</Text>
									{bookmark.note && (
										<Text style={styles.bookmarkNote}>{bookmark.note}</Text>
									)}
									<Text style={styles.bookmarkDate}>
										{new Date(bookmark.created_at).toLocaleDateString()}
									</Text>
								</TouchableOpacity>
							))
						)}
					</ScrollView>
				</SafeAreaView>
			</Modal>
		);
	};

	const sections = lesson.content?.sections || [];
	const currentSectionData = sections[currentSection];

	return (
		<Modal visible={true} animationType="slide" presentationStyle="fullScreen">
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />
			<SafeAreaView style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={onClose} style={styles.closeButton}>
						<Ionicons name="arrow-back" size={24} color="#333" />
					</TouchableOpacity>
					<Text style={styles.lessonTitle} numberOfLines={1}>
						{lesson.title}
					</Text>
					<View style={styles.headerActions}>
						<TouchableOpacity
							onPress={changeSpeechRate}
							style={styles.headerButton}
						>
							<Ionicons name="speedometer" size={20} color="#333" />
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setShowTableOfContents(true)}
							style={styles.headerButton}
						>
							<Ionicons name="list" size={20} color="#333" />
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setShowBookmarks(true)}
							style={styles.headerButton}
						>
							<Ionicons name="bookmark" size={20} color="#333" />
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => addBookmark(currentSection)}
							style={styles.headerButton}
						>
							<Ionicons name="bookmark-outline" size={20} color="#333" />
						</TouchableOpacity>
					</View>
				</View>

				{/* Progress Bar */}
				{sections.length > 0 && (
					<View style={styles.progressContainer}>
						<View style={styles.progressBar}>
							<View
								style={[
									styles.progressFill,
									{
										width: `${((currentSection + 1) / sections.length) * 100}%`,
									},
								]}
							/>
						</View>
						<Text style={styles.progressText}>
							{currentSection + 1} of {sections.length}
						</Text>
					</View>
				)}

				{/* Content */}
				<ScrollView
					style={styles.contentContainer}
					showsVerticalScrollIndicator={false}
				>
					{/* Introduction */}
					{lesson.content?.introduction && currentSection === 0 && (
						<View style={styles.introductionContainer}>
							<View style={styles.sectionHeader}>
								<Text style={styles.introductionTitle}>Introduction</Text>
								<TouchableOpacity
									style={styles.speakButton}
									onPress={() =>
										handleSpeakText(lesson.content.introduction, "en-US")
									}
								>
									<Ionicons
										name={isSpeaking ? "stop-circle" : "volume-high"}
										size={20}
										color={theme.colors.secondary}
									/>
								</TouchableOpacity>
							</View>
							<Text style={styles.introductionText}>
								{lesson.content.introduction}
							</Text>
						</View>
					)}

					{/* Current Section */}
					{currentSectionData &&
						renderSection(currentSectionData, currentSection)}

					{/* Summary */}
					{lesson.content?.summary &&
						currentSection === sections.length - 1 && (
							<View style={styles.summaryContainer}>
								<View style={styles.sectionHeader}>
									<Text style={styles.summaryTitle}>Summary</Text>
									<TouchableOpacity
										style={styles.speakButton}
										onPress={() =>
											handleSpeakText(lesson.content.summary, "en-US")
										}
									>
										<Ionicons
											name={isSpeaking ? "stop-circle" : "volume-high"}
											size={20}
											color={theme.colors.secondary}
										/>
									</TouchableOpacity>
								</View>
								<Text style={styles.summaryText}>{lesson.content.summary}</Text>
							</View>
						)}
				</ScrollView>

				{/* Navigation */}
				<View style={styles.navigationContainer}>
					<TouchableOpacity
						onPress={goToPreviousSection}
						disabled={currentSection === 0}
						style={[
							styles.navButton,
							currentSection === 0 && styles.navButtonDisabled,
						]}
					>
						<Ionicons
							name="chevron-back"
							size={20}
							color={currentSection === 0 ? "#ccc" : "#007AFF"}
						/>
						<Text
							style={[
								styles.navButtonText,
								currentSection === 0 && styles.navButtonTextDisabled,
							]}
						>
							Previous
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={goToNextSection}
						disabled={currentSection === sections.length - 1}
						style={[
							styles.navButton,
							currentSection === sections.length - 1 &&
								styles.navButtonDisabled,
						]}
					>
						<Text
							style={[
								styles.navButtonText,
								currentSection === sections.length - 1 &&
									styles.navButtonTextDisabled,
							]}
						>
							Next
						</Text>
						<Ionicons
							name="chevron-forward"
							size={20}
							color={
								currentSection === sections.length - 1 ? "#ccc" : "#007AFF"
							}
						/>
					</TouchableOpacity>
				</View>

				{/* Table of Contents Modal */}
				{renderTableOfContents()}

				{/* Bookmarks Modal */}
				{renderBookmarks()}
			</SafeAreaView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
		backgroundColor: "#fff",
	},
	closeButton: {
		padding: 8,
		marginRight: 8,
	},
	lessonTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginRight: 8,
	},
	headerActions: {
		flexDirection: "row",
		alignItems: "center",
	},
	headerButton: {
		padding: 8,
		marginHorizontal: 4,
	},
	progressContainer: {
		padding: 16,
		paddingBottom: 8,
	},
	progressBar: {
		height: 4,
		backgroundColor: "#e0e0e0",
		borderRadius: 2,
		overflow: "hidden",
		marginBottom: 8,
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#007AFF",
	},
	progressText: {
		fontSize: 12,
		color: "#666",
		textAlign: "center",
	},
	contentContainer: {
		flex: 1,
		paddingHorizontal: 20,
	},
	sectionContainer: {
		marginBottom: 24,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#333",
		flex: 1,
		marginRight: 12,
	},
	contentSection: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 16,
	},
	sectionContent: {
		fontSize: 16,
		lineHeight: 24,
		color: "#444",
		flex: 1,
		marginRight: 12,
	},
	speakButton: {
		padding: 8,
		borderRadius: 20,
		backgroundColor: "rgba(0, 122, 255, 0.1)",
	},
	speakButtonSmall: {
		padding: 4,
		borderRadius: 12,
		backgroundColor: "rgba(0, 122, 255, 0.1)",
		marginLeft: 8,
	},
	examplesContainer: {
		marginTop: 16,
		padding: 16,
		backgroundColor: "#f8f9fa",
		borderRadius: 12,
	},
	examplesTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 12,
	},
	exampleItem: {
		marginBottom: 16,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e9ecef",
	},
	exampleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	exampleFrench: {
		fontSize: 16,
		fontWeight: "600",
		color: "#0066cc",
		flex: 1,
	},
	exampleEnglish: {
		fontSize: 14,
		color: "#666",
		fontStyle: "italic",
		marginBottom: 4,
	},
	examplePronunciation: {
		fontSize: 12,
		color: "#888",
		marginBottom: 4,
	},
	exampleContext: {
		fontSize: 12,
		color: "#28a745",
		fontStyle: "italic",
	},
	introductionContainer: {
		marginBottom: 24,
		padding: 16,
		backgroundColor: "#e8f4fd",
		borderRadius: 12,
	},
	introductionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		flex: 1,
		marginRight: 12,
	},
	introductionText: {
		fontSize: 16,
		lineHeight: 24,
		color: "#444",
	},
	summaryContainer: {
		marginTop: 24,
		padding: 16,
		backgroundColor: "#f0f8f0",
		borderRadius: 12,
	},
	summaryTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		flex: 1,
		marginRight: 12,
	},
	summaryText: {
		fontSize: 16,
		lineHeight: 24,
		color: "#444",
	},
	navigationContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
		backgroundColor: "#fff",
	},
	navButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
		minWidth: 100,
		justifyContent: "center",
	},
	navButtonDisabled: {
		opacity: 0.5,
	},
	navButtonText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#007AFF",
		marginHorizontal: 4,
	},
	navButtonTextDisabled: {
		color: "#ccc",
	},
	modalContainer: {
		flex: 1,
		backgroundColor: "#fff",
	},
	modalHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
	},
	modalContent: {
		flex: 1,
		padding: 16,
	},
	tocItem: {
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
	},
	tocItemActive: {
		backgroundColor: "#e8f4fd",
	},
	tocText: {
		fontSize: 16,
		color: "#333",
	},
	tocTextActive: {
		color: "#007AFF",
		fontWeight: "600",
	},
	emptyBookmarks: {
		alignItems: "center",
		justifyContent: "center",
		padding: 40,
	},
	emptyBookmarksText: {
		fontSize: 16,
		color: "#666",
		marginTop: 12,
	},
	bookmarkItem: {
		padding: 16,
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
		marginBottom: 12,
	},
	bookmarkTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 4,
	},
	bookmarkNote: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8,
	},
	bookmarkDate: {
		fontSize: 12,
		color: "#999",
	},
});
