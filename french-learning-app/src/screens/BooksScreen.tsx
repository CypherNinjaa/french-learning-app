import React, { useState, useEffect, useMemo } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Image,
	ActivityIndicator,
	RefreshControl,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { LearningService } from "../services/LearningService";
import { LearningBook, DifficultyLevel } from "../types/LearningTypes";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2; // 2 cards per row with margins - slightly wider cards

interface BooksScreenProps {
	navigation: any;
}

export const BooksScreen: React.FC<BooksScreenProps> = ({ navigation }) => {
	const { user } = useAuth();
	const [books, setBooks] = useState<LearningBook[]>([]);
	const [userProgress, setUserProgress] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDifficulty, setSelectedDifficulty] = useState<
		DifficultyLevel | "all"
	>("all");

	// Set initial render after load
	useEffect(() => {
		loadBooks();
	}, []);

	// Check if a difficulty level is unlocked for the user
	const isLevelUnlocked = (difficulty: DifficultyLevel) => {
		if (difficulty === "beginner") return true; // Beginner is always unlocked

		if (difficulty === "intermediate") {
			// Check if user completed ALL beginner books (80% or more each)
			const beginnerBooks = books.filter(
				(book) => book.difficulty_level === "beginner"
			);
			const completedBeginnerBooks = userProgress.filter(
				(progress) =>
					progress.book?.difficulty_level === "beginner" &&
					progress.progress_percentage >= 80
			);
			return (
				beginnerBooks.length > 0 &&
				completedBeginnerBooks.length >= beginnerBooks.length
			);
		}

		if (difficulty === "advanced") {
			// Check if user completed ALL intermediate books (80% or more each)
			const intermediateBooks = books.filter(
				(book) => book.difficulty_level === "intermediate"
			);
			const completedIntermediateBooks = userProgress.filter(
				(progress) =>
					progress.book?.difficulty_level === "intermediate" &&
					progress.progress_percentage >= 80
			);
			return (
				intermediateBooks.length > 0 &&
				completedIntermediateBooks.length >= intermediateBooks.length
			);
		}

		return false;
	};

	// Check if a specific book is unlocked
	const isBookUnlocked = (book: LearningBook) => {
		return isLevelUnlocked(book.difficulty_level);
	};

	// Filtered books based on search and difficulty
	const filteredBooks = useMemo(() => {
		return books.filter((book) => {
			const matchesSearch =
				book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				book.description?.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesDifficulty =
				selectedDifficulty === "all" ||
				book.difficulty_level === selectedDifficulty;

			return matchesSearch && matchesDifficulty;
		});
	}, [books, searchQuery, selectedDifficulty]);

	const loadBooks = async () => {
		try {
			const response = await LearningService.getBooks({
				search_query: searchQuery || undefined,
				difficulty_level:
					selectedDifficulty !== "all" ? selectedDifficulty : undefined,
				limit: 50,
			});

			if (response.success && response.data) {
				setBooks(response.data);
			}

			// Load user progress for level unlocking
			if (user?.id) {
				try {
					const progressResponse = await LearningService.getAllUserProgress(
						user.id
					);
					if (progressResponse.success && progressResponse.data) {
						setUserProgress(progressResponse.data);
					}
				} catch (progressError) {
					console.error("Error loading user progress:", progressError);
				}
			}
		} catch (error) {
			console.error("Error loading books:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		loadBooks();
	}, [selectedDifficulty]);

	const onRefresh = () => {
		setRefreshing(true);
		loadBooks();
	};

	const getDifficultyColor = (
		difficulty: DifficultyLevel
	): [string, string] => {
		switch (difficulty) {
			case "beginner":
				return ["#4CAF50", "#66BB6A"];
			case "intermediate":
				return ["#FF9800", "#FFB74D"];
			case "advanced":
				return ["#F44336", "#EF5350"];
			default:
				return ["#2196F3", "#42A5F5"];
		}
	};

	const getDifficultyIcon = (difficulty: DifficultyLevel) => {
		switch (difficulty) {
			case "beginner":
				return "leaf-outline";
			case "intermediate":
				return "flame-outline";
			case "advanced":
				return "rocket-outline";
			default:
				return "book-outline";
		}
	};

	const renderBookCard = (book: LearningBook) => {
		const isUnlocked = isBookUnlocked(book);
		const cardColors = isUnlocked
			? getDifficultyColor(book.difficulty_level)
			: (["#757575", "#9E9E9E"] as const); // Gray colors for locked books

		const handleBookPress = () => {
			if (isUnlocked) {
				navigation.navigate("BookDetail", { bookId: book.id });
			} else {
				const prerequisiteLevel =
					book.difficulty_level === "intermediate"
						? "beginner"
						: book.difficulty_level === "advanced"
						? "intermediate"
						: "";
				alert(
					`🔒 Level Locked!\n\nComplete ALL ${prerequisiteLevel} level books (80% progress each) to unlock ${book.difficulty_level} level books.`
				);
			}
		};

		return (
			<TouchableOpacity
				key={book.id}
				style={[styles.bookCard, !isUnlocked && styles.lockedCard]}
				onPress={handleBookPress}
				activeOpacity={0.8}
			>
				<LinearGradient
					colors={cardColors}
					style={styles.bookGradient}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
				>
					{/* Lock Overlay */}
					{!isUnlocked && (
						<View style={styles.lockOverlay}>
							<Ionicons name="lock-closed" size={24} color="white" />
						</View>
					)}

					{/* Cover Image */}
					<View style={styles.bookCover}>
						{book.cover_image_url ? (
							<Image
								source={{ uri: book.cover_image_url }}
								style={[styles.coverImage, !isUnlocked && styles.lockedImage]}
							/>
						) : (
							<View style={styles.placeholderCover}>
								<Ionicons name="book" size={32} color="white" />
							</View>
						)}
					</View>

					{/* Book Info */}
					<View style={styles.bookInfo}>
						<Text
							style={[styles.bookTitle, !isUnlocked && styles.lockedText]}
							numberOfLines={2}
						>
							{book.title}
						</Text>

						<View style={styles.bookMeta}>
							<View style={styles.difficultyBadge}>
								<Ionicons
									name={getDifficultyIcon(book.difficulty_level)}
									size={12}
									color="white"
								/>
								<Text style={styles.difficultyText}>
									{book.difficulty_level}
								</Text>
							</View>

							<Text style={styles.lessonCount}>Multiple lessons</Text>
						</View>

						{/* Progress Bar */}
						{book.progress_percentage !== undefined && (
							<View style={styles.progressContainer}>
								<View style={styles.progressBar}>
									<View
										style={[
											styles.progressFill,
											{ width: `${book.progress_percentage}%` },
										]}
									/>
								</View>
								<Text style={styles.progressText}>
									{Math.round(book.progress_percentage)}%
								</Text>
							</View>
						)}

						{/* Duration */}
						<View style={styles.durationContainer}>
							<Ionicons
								name="time-outline"
								size={12}
								color="rgba(255,255,255,0.8)"
							/>
							<Text style={styles.durationText}>
								{book.estimated_duration_hours}h
							</Text>
						</View>
					</View>
				</LinearGradient>
			</TouchableOpacity>
		);
	};

	const renderDifficultyFilter = () => (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.filterContainer}
			contentContainerStyle={styles.filterContent}
		>
			{(["all", "beginner", "intermediate", "advanced"] as const).map(
				(difficulty) => (
					<TouchableOpacity
						key={difficulty}
						style={[
							styles.filterChip,
							selectedDifficulty === difficulty && styles.filterChipActive,
						]}
						onPress={() => setSelectedDifficulty(difficulty)}
					>
						<Text
							style={[
								styles.filterChipText,
								selectedDifficulty === difficulty &&
									styles.filterChipTextActive,
							]}
						>
							{difficulty === "all"
								? "All Levels"
								: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
						</Text>
					</TouchableOpacity>
				)
			)}
		</ScrollView>
	);

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading your books...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>My French Books</Text>
				<TouchableOpacity
					style={styles.searchButton}
					onPress={() => {
						/* TODO: Implement search modal */
					}}
				>
					<Ionicons name="search" size={24} color={theme.colors.text} />
				</TouchableOpacity>
			</View>

			{/* Search Bar */}
			<View style={styles.searchContainer}>
				<Ionicons
					name="search"
					size={20}
					color={theme.colors.textSecondary}
					style={styles.searchIcon}
				/>
				<TextInput
					style={styles.searchInput}
					placeholder="Search books..."
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholderTextColor={theme.colors.textSecondary}
				/>
			</View>

			{/* Difficulty Filter */}
			{renderDifficultyFilter()}

			{/* Books Grid */}
			<ScrollView
				contentContainerStyle={styles.scrollViewContent}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
				showsVerticalScrollIndicator={false}
			>
				{filteredBooks.length > 0 ? (
					<View style={styles.booksGrid}>
						{filteredBooks.map(renderBookCard)}
					</View>
				) : (
					<View style={styles.emptyState}>
						<Ionicons
							name="library-outline"
							size={64}
							color={theme.colors.textSecondary}
						/>
						<Text style={styles.emptyStateTitle}>No books found</Text>
						<Text style={styles.emptyStateText}>
							{searchQuery
								? "Try adjusting your search or filters"
								: "Check back soon for new content!"}
						</Text>
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
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 4,
		paddingBottom: 6,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
	},
	searchButton: {
		padding: 6,
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 16,
		marginBottom: 2,
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: theme.colors.surface,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	searchIcon: {
		marginRight: 10,
	},
	searchInput: {
		flex: 1,
		fontSize: 14,
		color: theme.colors.text,
	},
	filterContainer: {
		marginBottom: 2,
		paddingVertical: 0,
	},
	filterContent: {
		paddingHorizontal: 16,
		gap: 3,
		alignItems: "center",
	},
	filterChip: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: theme.colors.border,
		minWidth: 65,
		alignItems: "center",
	},
	filterChipActive: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	filterChipText: {
		fontSize: 13,
		fontWeight: "500",
		color: theme.colors.text,
	},
	filterChipTextActive: {
		color: "white",
	},
	booksContainer: {
		flex: 1,
		paddingTop: 4,
	},
	booksGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingHorizontal: 16,
		paddingTop: 0,
		paddingBottom: 12,
		justifyContent: "space-between",
	},
	bookCard: {
		width: CARD_WIDTH,
		height: 230, // Reduced height to make more compact
		borderRadius: 10, // Smaller radius for more modern look
		marginBottom: 8, // Reduced bottom margin
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
	},
	bookGradient: {
		flex: 1,
		borderRadius: 10, // Matching card border radius
		padding: 12, // Reduced padding
	},
	bookCover: {
		height: 70, // Slightly reduced height
		marginBottom: 6, // Reduced margin
	},
	coverImage: {
		width: "100%",
		height: "100%",
		borderRadius: 7,
	},
	placeholderCover: {
		width: "100%",
		height: "100%",
		borderRadius: 7,
		backgroundColor: "rgba(255,255,255,0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	bookInfo: {
		flex: 1,
	},
	bookTitle: {
		fontSize: 14,
		fontWeight: "bold",
		color: "white",
		marginBottom: 4,
		lineHeight: 18,
	},
	bookMeta: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	difficultyBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.2)",
		paddingHorizontal: 6,
		paddingVertical: 3,
		borderRadius: 10,
		gap: 3,
	},
	difficultyText: {
		fontSize: 9,
		fontWeight: "500",
		color: "white",
		textTransform: "capitalize",
	},
	lessonCount: {
		fontSize: 11,
		color: "rgba(255,255,255,0.8)",
	},
	progressContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
		gap: 4,
	},
	progressBar: {
		flex: 1,
		height: 3,
		backgroundColor: "rgba(255,255,255,0.3)",
		borderRadius: 1.5,
	},
	progressFill: {
		height: "100%",
		backgroundColor: "white",
		borderRadius: 1.5,
	},
	progressText: {
		fontSize: 9,
		color: "white",
		fontWeight: "500",
		minWidth: 28,
	},
	durationContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
	},
	durationText: {
		fontSize: 11,
		color: "rgba(255,255,255,0.8)",
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
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyStateTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
		marginTop: 16,
	},
	emptyStateText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginTop: 8,
		paddingHorizontal: 40,
	},
	scrollViewContent: {
		paddingBottom: 12,
	},
	// Locked book styles
	lockedCard: {
		opacity: 0.6,
	},
	lockOverlay: {
		position: "absolute",
		top: 12,
		right: 12,
		backgroundColor: "rgba(0,0,0,0.8)",
		borderRadius: 16,
		padding: 8,
		zIndex: 10,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.3)",
	},
	lockedImage: {
		opacity: 0.4,
	},
	lockedText: {
		opacity: 0.6,
	},
});
