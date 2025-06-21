import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	SafeAreaView,
	RefreshControl,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { ModernCard, ModernButton } from "../components/ModernUI";
import { ContentManagementService } from "../services/contentManagementService";
import { SpeechService } from "../services/speechService";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";

interface VocabularyWord {
	id: number;
	french_word: string;
	english_translation: string;
	pronunciation?: string;
	audio_url?: string;
	example_sentence_french?: string;
	example_sentence_english?: string;
	difficulty_level: string;
	category: string;
	mastery_level?: number;
}

interface VocabularyScreenProps {
	navigation: any;
}

export const VocabularyScreen: React.FC<VocabularyScreenProps> = ({
	navigation,
}) => {
	const { user } = useAuth();
	const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
	const [showTranslations, setShowTranslations] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const categories = [
		"all",
		"basic",
		"food",
		"travel",
		"family",
		"work",
		"hobbies",
	];
	const difficulties = ["all", "beginner", "intermediate", "advanced"];

	const fetchVocabulary = async () => {
		try {
			setError(null);
			const response = await ContentManagementService.getVocabulary();
			const words = response.data || [];
			setVocabulary(words as VocabularyWord[]);
		} catch (error) {
			console.error("Error fetching vocabulary:", error);
			setError("Failed to load vocabulary. Please try again.");
			Alert.alert("Error", "Failed to load vocabulary. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchVocabulary();
	}, []);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchVocabulary();
		setRefreshing(false);
	};

	const getFilteredVocabulary = () => {
		return vocabulary.filter((word) => {
			const categoryMatch =
				selectedCategory === "all" || word.category === selectedCategory;
			const difficultyMatch =
				selectedDifficulty === "all" ||
				word.difficulty_level === selectedDifficulty;
			return categoryMatch && difficultyMatch;
		});
	};

	const getMasteryColor = (level: number = 0) => {
		if (level >= 4) return theme.colors.success;
		if (level >= 2) return theme.colors.warning;
		return theme.colors.error;
	};

	const getMasteryLabel = (level: number = 0) => {
		if (level >= 4) return "Mastered";
		if (level >= 2) return "Learning";
		return "New";
	};

	const startPracticeSession = () => {
		const filteredWords = getFilteredVocabulary();
		if (filteredWords.length === 0) {
			Alert.alert(
				"No Words",
				"No vocabulary words found for the selected filters."
			);
			return;
		}

		navigation.navigate("VocabularyPractice", {
			words: filteredWords.slice(0, 10), // Practice with 10 words
			userId: user?.id,
		});
	};

	const renderFilterButton = (
		options: string[],
		selected: string,
		onSelect: (value: string) => void,
		title: string
	) => (
		<View style={styles.filterSection}>
			<Text style={[styles.filterTitle, { color: theme.colors.text }]}>
				{title}
			</Text>
			<View style={styles.filterButtons}>
				{options.map((option) => (
					<TouchableOpacity
						key={option}
						style={[
							styles.filterButton,
							{
								backgroundColor:
									selected === option
										? theme.colors.primary
										: theme.colors.border,
							},
						]}
						onPress={() => onSelect(option)}
					>
						<Text
							style={[
								styles.filterButtonText,
								{
									color: selected === option ? "white" : theme.colors.text,
								},
							]}
						>
							{option.charAt(0).toUpperCase() + option.slice(1)}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);

	const renderVocabularyCard = ({ item }: { item: VocabularyWord }) => (
		<ModernCard style={styles.card}>
			<View style={styles.cardHeader}>
				<View style={styles.wordInfo}>
					<Text style={[styles.frenchWord, { color: theme.colors.text }]}>
						{item.french_word}
					</Text>
					{showTranslations && (
						<Text
							style={[
								styles.englishWord,
								{ color: theme.colors.textSecondary },
							]}
						>
							{item.english_translation}
						</Text>
					)}
				</View>
				<View style={styles.cardActions}>
					<View
						style={[
							styles.masteryBadge,
							{ backgroundColor: getMasteryColor(item.mastery_level) },
						]}
					>
						<Text style={styles.masteryText}>
							{getMasteryLabel(item.mastery_level || 0)}
						</Text>
					</View>
					<TouchableOpacity
						style={styles.pronunciationButton}
						onPress={() => SpeechService.speakFrench(item.french_word)}
					>
						<Ionicons
							name="volume-high"
							size={20}
							color={theme.colors.primary}
						/>
					</TouchableOpacity>
				</View>
			</View>

			{item.pronunciation && (
				<Text
					style={[styles.pronunciation, { color: theme.colors.textSecondary }]}
				>
					[{item.pronunciation}]
				</Text>
			)}

			{item.example_sentence_french && (
				<View style={styles.exampleSection}>
					<Text
						style={[styles.exampleLabel, { color: theme.colors.textSecondary }]}
					>
						Example:
					</Text>
					<Text style={[styles.exampleFrench, { color: theme.colors.text }]}>
						{item.example_sentence_french}
					</Text>
					{showTranslations && item.example_sentence_english && (
						<Text
							style={[
								styles.exampleEnglish,
								{ color: theme.colors.textSecondary },
							]}
						>
							{item.example_sentence_english}
						</Text>
					)}
				</View>
			)}
		</ModernCard>
	);

	const filteredVocabulary = getFilteredVocabulary();

	if (loading) {
		return <LoadingState />;
	}

	if (error) {
		return (
			<ErrorState
				title="Vocabulary Error"
				description={error}
				onRetry={fetchVocabulary}
			/>
		);
	}

	if (filteredVocabulary.length === 0) {
		return (
			<EmptyState
				title="No Vocabulary Found"
				description="No vocabulary words found for the selected filters. Try changing your filters or check back later!"
				onRetry={fetchVocabulary}
			/>
		);
	}

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="chevron-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={[styles.title, { color: theme.colors.text }]}>
					Vocabulary
				</Text>
				<TouchableOpacity
					style={styles.toggleButton}
					onPress={() => setShowTranslations(!showTranslations)}
				>
					<Ionicons
						name={showTranslations ? "eye" : "eye-off"}
						size={24}
						color={theme.colors.text}
					/>
				</TouchableOpacity>
			</View>

			<View style={styles.filtersContainer}>
				{renderFilterButton(
					categories,
					selectedCategory,
					setSelectedCategory,
					"Category"
				)}
				{renderFilterButton(
					difficulties,
					selectedDifficulty,
					setSelectedDifficulty,
					"Difficulty"
				)}
			</View>

			<View style={styles.practiceSection}>
				<ModernButton
					title={`Start Practice (${filteredVocabulary.length} words)`}
					onPress={startPracticeSession}
					icon="play"
					disabled={filteredVocabulary.length === 0}
				/>
			</View>

			<FlatList
				data={filteredVocabulary}
				renderItem={renderVocabularyCard}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContainer}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
				showsVerticalScrollIndicator={false}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	backButton: {
		padding: 8,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
	},
	toggleButton: {
		padding: 8,
	},
	filtersContainer: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	filterSection: {
		marginBottom: 12,
	},
	filterTitle: {
		fontSize: 14,
		fontWeight: "600",
		marginBottom: 8,
	},
	filterButtons: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	filterButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	filterButtonText: {
		fontSize: 12,
		fontWeight: "500",
	},
	practiceSection: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	listContainer: {
		padding: 16,
	},
	card: {
		padding: 16,
		marginBottom: 12,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	wordInfo: {
		flex: 1,
	},
	frenchWord: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 4,
	},
	englishWord: {
		fontSize: 16,
	},
	cardActions: {
		alignItems: "flex-end",
		gap: 8,
	},
	masteryBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	masteryText: {
		color: "white",
		fontSize: 10,
		fontWeight: "600",
	},
	pronunciation: {
		fontSize: 14,
		fontStyle: "italic",
		marginBottom: 8,
	},
	exampleSection: {
		marginTop: 8,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: "rgba(0,0,0,0.1)",
	},
	exampleLabel: {
		fontSize: 12,
		fontWeight: "600",
		marginBottom: 4,
	},
	exampleFrench: {
		fontSize: 14,
		fontStyle: "italic",
		marginBottom: 2,
	},
	exampleEnglish: {
		fontSize: 12,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		fontSize: 16,
	},
	pronunciationButton: {
		padding: 8,
		borderRadius: 20,
		backgroundColor: "rgba(0,0,0,0.05)",
	},
});
