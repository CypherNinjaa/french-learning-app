import React, { useState, useEffect, useMemo } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
	RefreshControl,
	Dimensions,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { ContentManagementService } from "../services/contentManagementService";
import { GrammarRule, DifficultyLevel } from "../types";
import { ModernCard } from "../components/ModernUI";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";

const { width } = Dimensions.get("window");

interface GrammarRulesScreenProps {
	navigation: any;
}

export const GrammarRulesScreen: React.FC<GrammarRulesScreenProps> = ({
	navigation,
}) => {
	const { user } = useAuth();
	const [grammarRules, setGrammarRules] = useState<GrammarRule[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedDifficulty, setSelectedDifficulty] = useState<
		DifficultyLevel | "all"
	>("all");
	const [error, setError] = useState<string | null>(null);

	const categories = [
		"all",
		"Verbs",
		"Nouns",
		"Adjectives",
		"Pronouns",
		"Articles",
		"Prepositions",
		"Conjunctions",
		"Adverbs",
		"Sentence Structure",
		"Tenses",
		"Questions",
		"Negation",
	];

	const difficulties: Array<DifficultyLevel | "all"> = [
		"all",
		"beginner",
		"intermediate",
		"advanced",
	];

	// Load grammar rules from the service
	const loadGrammarRules = async () => {
		try {
			setError(null);
			const filters = {
				difficulty_level:
					selectedDifficulty !== "all" ? selectedDifficulty : undefined,
				category: selectedCategory !== "all" ? selectedCategory : undefined,
				search: searchQuery || undefined,
			};

			const response = await ContentManagementService.getGrammarRules(filters);
			if (response.success && response.data) {
				setGrammarRules(response.data);
			} else {
				setError(response.error || "Failed to load grammar rules");
			}
		} catch (error) {
			console.error("Error loading grammar rules:", error);
			setError("Failed to load grammar rules. Please try again.");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		loadGrammarRules();
	}, [selectedCategory, selectedDifficulty, searchQuery]);

	const onRefresh = () => {
		setRefreshing(true);
		loadGrammarRules();
	};

	// Filtered rules based on current filters
	const filteredRules = useMemo(() => {
		return grammarRules.filter((rule) => {
			const matchesSearch =
				rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				rule.explanation.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory =
				selectedCategory === "all" || rule.category === selectedCategory;
			const matchesDifficulty =
				selectedDifficulty === "all" ||
				rule.difficulty_level === selectedDifficulty;

			return matchesSearch && matchesCategory && matchesDifficulty;
		});
	}, [grammarRules, searchQuery, selectedCategory, selectedDifficulty]);

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

	const getCategoryIcon = (
		category: string
	): keyof typeof Ionicons.glyphMap => {
		const categoryIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
			Verbs: "play-outline",
			Nouns: "cube-outline",
			Adjectives: "color-palette-outline",
			Pronouns: "person-outline",
			Articles: "document-text-outline",
			Prepositions: "link-outline",
			Conjunctions: "git-merge-outline",
			Adverbs: "speedometer-outline",
			"Sentence Structure": "layers-outline",
			Tenses: "time-outline",
			Questions: "help-circle-outline",
			Negation: "close-circle-outline",
		};
		return categoryIconMap[category] || "book-outline";
	};

	const renderGrammarCard = (rule: GrammarRule) => {
		const difficultyColors = getDifficultyColor(rule.difficulty_level);
		const examples = rule.examples as Array<{
			french: string;
			english: string;
		}>;

		return (
			<TouchableOpacity
				key={rule.id}
				style={styles.grammarCard}
				onPress={() =>
					navigation.navigate("GrammarRuleDetail", { ruleId: rule.id })
				}
			>
				<LinearGradient
					colors={[difficultyColors[0] + "15", difficultyColors[1] + "10"]}
					style={styles.cardGradient}
				>
					<View style={styles.cardHeader}>
						<View style={styles.cardTitleSection}>
							<View style={styles.categoryBadge}>
								<Ionicons
									name={getCategoryIcon(rule.category || "")}
									size={14}
									color={theme.colors.primary}
								/>
								<Text style={styles.categoryText}>
									{rule.category || "General"}
								</Text>
							</View>
							<Text style={styles.ruleTitle} numberOfLines={2}>
								{rule.title}
							</Text>
						</View>
						<View
							style={[
								styles.difficultyBadge,
								{ backgroundColor: difficultyColors[0] },
							]}
						>
							<Ionicons
								name={getDifficultyIcon(rule.difficulty_level)}
								size={12}
								color="white"
							/>
						</View>
					</View>

					<Text style={styles.ruleExplanation} numberOfLines={3}>
						{rule.explanation}
					</Text>

					{examples && examples.length > 0 && (
						<View style={styles.examplesPreview}>
							<Text style={styles.exampleLabel}>Example:</Text>
							<Text style={styles.exampleFrench} numberOfLines={1}>
								{examples[0].french}
							</Text>
							<Text style={styles.exampleEnglish} numberOfLines={1}>
								{examples[0].english}
							</Text>
						</View>
					)}

					<View style={styles.cardFooter}>
						<Text style={styles.orderIndex}>#{rule.order_index || 1}</Text>
						<Ionicons
							name="chevron-forward"
							size={16}
							color={theme.colors.textSecondary}
						/>
					</View>
				</LinearGradient>
			</TouchableOpacity>
		);
	};

	const renderFilters = () => (
		<View style={styles.filtersContainer}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.filterScrollView}
			>
				{/* Category Filter */}
				<View style={styles.filterGroup}>
					<Text style={styles.filterLabel}>Category</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.filterOptions}
					>
						{categories.map((category) => (
							<TouchableOpacity
								key={category}
								style={[
									styles.filterChip,
									selectedCategory === category && styles.activeFilterChip,
								]}
								onPress={() => setSelectedCategory(category)}
							>
								<Text
									style={[
										styles.filterChipText,
										selectedCategory === category &&
											styles.activeFilterChipText,
									]}
								>
									{category === "all" ? "All Categories" : category}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				{/* Difficulty Filter */}
				<View style={styles.filterGroup}>
					<Text style={styles.filterLabel}>Difficulty</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.filterOptions}
					>
						{difficulties.map((difficulty) => (
							<TouchableOpacity
								key={difficulty}
								style={[
									styles.filterChip,
									selectedDifficulty === difficulty && styles.activeFilterChip,
								]}
								onPress={() => setSelectedDifficulty(difficulty)}
							>
								<Text
									style={[
										styles.filterChipText,
										selectedDifficulty === difficulty &&
											styles.activeFilterChipText,
									]}
								>
									{difficulty === "all" ? "All Levels" : difficulty}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
			</ScrollView>
		</View>
	);

	if (loading) {
		return <LoadingState />;
	}

	if (error && !refreshing) {
		return (
			<ErrorState
				title="Error loading grammar rules"
				description={error}
				onRetry={loadGrammarRules}
			/>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Grammar Rules</Text>
				<Text style={styles.headerSubtitle}>
					Master French grammar step by step
				</Text>
			</View>

			{/* Search Bar */}
			<View style={styles.searchContainer}>
				<View style={styles.searchInputContainer}>
					<Ionicons
						name="search"
						size={20}
						color={theme.colors.textSecondary}
					/>
					<TextInput
						style={styles.searchInput}
						placeholder="Search grammar rules..."
						placeholderTextColor={theme.colors.textSecondary}
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
					{searchQuery.length > 0 && (
						<TouchableOpacity onPress={() => setSearchQuery("")}>
							<Ionicons
								name="close-circle"
								size={20}
								color={theme.colors.textSecondary}
							/>
						</TouchableOpacity>
					)}
				</View>
			</View>

			{/* Filters */}
			{renderFilters()}

			{/* Results Count */}
			<View style={styles.resultsHeader}>
				<Text style={styles.resultsCount}>
					{filteredRules.length} rule{filteredRules.length !== 1 ? "s" : ""}{" "}
					found
				</Text>
			</View>

			{/* Grammar Rules List */}
			<ScrollView
				style={styles.content}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
				showsVerticalScrollIndicator={false}
			>
				{filteredRules.length === 0 ? (
					<EmptyState
						title="No grammar rules found"
						description="Try adjusting your search or filters"
					/>
				) : (
					<View style={styles.rulesGrid}>
						{filteredRules.map((rule) => renderGrammarCard(rule))}
					</View>
				)}

				{/* Spacer for bottom padding */}
				<View style={styles.bottomSpacer} />
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
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 10,
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 4,
	},
	headerSubtitle: {
		fontSize: 16,
		color: theme.colors.textSecondary,
	},
	searchContainer: {
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	searchInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		paddingHorizontal: 15,
		paddingVertical: 12,
		gap: 10,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: theme.colors.text,
	},
	filtersContainer: {
		paddingVertical: 10,
		backgroundColor: theme.colors.surface,
	},
	filterScrollView: {
		paddingHorizontal: 20,
	},
	filterGroup: {
		marginBottom: 15,
	},
	filterLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 8,
		marginLeft: 4,
	},
	filterOptions: {
		flexDirection: "row",
	},
	filterChip: {
		backgroundColor: theme.colors.background,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginRight: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	activeFilterChip: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	filterChipText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		fontWeight: "500",
		textTransform: "capitalize",
	},
	activeFilterChipText: {
		color: "white",
	},
	resultsHeader: {
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	resultsCount: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	content: {
		flex: 1,
	},
	rulesGrid: {
		paddingHorizontal: 20,
	},
	grammarCard: {
		marginBottom: 16,
		borderRadius: 16,
		overflow: "hidden",
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	cardGradient: {
		padding: 20,
		backgroundColor: theme.colors.surface,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	cardTitleSection: {
		flex: 1,
		marginRight: 12,
	},
	categoryBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.primary + "15",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		alignSelf: "flex-start",
		marginBottom: 8,
		gap: 4,
	},
	categoryText: {
		fontSize: 11,
		color: theme.colors.primary,
		fontWeight: "600",
	},
	ruleTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		lineHeight: 24,
	},
	difficultyBadge: {
		padding: 8,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	ruleExplanation: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
		marginBottom: 12,
	},
	examplesPreview: {
		backgroundColor: theme.colors.background,
		padding: 12,
		borderRadius: 8,
		marginBottom: 12,
	},
	exampleLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.primary,
		marginBottom: 4,
	},
	exampleFrench: {
		fontSize: 14,
		fontStyle: "italic",
		color: theme.colors.text,
		marginBottom: 2,
	},
	exampleEnglish: {
		fontSize: 13,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	cardFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	orderIndex: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		fontWeight: "500",
	},
	bottomSpacer: {
		height: 20,
	},
});
