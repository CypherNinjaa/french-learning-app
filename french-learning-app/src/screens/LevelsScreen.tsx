import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	SafeAreaView,
	RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { ModernCard } from "../components/ModernUI";
import { ContentManagementService } from "../services/contentManagementService";
import { theme } from "../constants/theme";

interface Level {
	id: number;
	name: string;
	description: string;
	order_index: number;
	is_active: boolean;
	modules_count?: number;
	completion_percentage?: number;
}

interface LevelsScreenProps {
	navigation: any;
}

export const LevelsScreen: React.FC<LevelsScreenProps> = ({ navigation }) => {
	const { user } = useAuth();
	const [levels, setLevels] = useState<Level[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const fetchLevels = async () => {
		try {
			const response = await ContentManagementService.getLevels();
			const data = response.data || [];
			// Get module counts for each level
			const levelsWithCounts = await Promise.all(
				data.map(async (level: any) => {
					const moduleResponse = await ContentManagementService.getModules();
					const modules =
						moduleResponse.data?.filter((m: any) => m.level_id === level.id) ||
						[];
					return {
						...level,
						modules_count: modules.length,
						completion_percentage: 0, // TODO: Calculate actual completion percentage
					};
				})
			);
			setLevels(levelsWithCounts);
		} catch (error) {
			console.error("Error fetching levels:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLevels();
	}, []);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchLevels();
		setRefreshing(false);
	};

	const handleLevelPress = (level: Level) => {
		navigation.navigate("Modules", {
			levelId: level.id,
			levelName: level.name,
			userId: user?.id,
		});
	};

	const getDifficultyColor = (orderIndex: number) => {
		if (orderIndex <= 1) return theme.colors.success; // Beginner - Green
		if (orderIndex <= 3) return theme.colors.warning; // Intermediate - Orange
		return theme.colors.error; // Advanced - Red
	};

	const getDifficultyLabel = (orderIndex: number) => {
		if (orderIndex <= 1) return "Beginner";
		if (orderIndex <= 3) return "Intermediate";
		return "Advanced";
	};

	const renderLevelCard = ({ item }: { item: Level }) => (
		<TouchableOpacity
			style={styles.levelCard}
			onPress={() => handleLevelPress(item)}
			activeOpacity={0.7}
		>
			<ModernCard style={styles.card}>
				<View style={styles.cardHeader}>
					<View style={styles.levelInfo}>
						<Text style={[styles.levelName, { color: theme.colors.text }]}>
							{item.name}
						</Text>
						<View style={styles.levelMeta}>
							<View
								style={[
									styles.difficultyBadge,
									{ backgroundColor: getDifficultyColor(item.order_index) },
								]}
							>
								<Text style={styles.difficultyText}>
									{getDifficultyLabel(item.order_index)}
								</Text>
							</View>
							<Text
								style={[
									styles.moduleCount,
									{ color: theme.colors.textSecondary },
								]}
							>
								{item.modules_count || 0} modules
							</Text>
						</View>
					</View>
					<Ionicons
						name="chevron-forward"
						size={24}
						color={theme.colors.textSecondary}
					/>
				</View>

				<Text
					style={[styles.description, { color: theme.colors.textSecondary }]}
				>
					{item.description}
				</Text>

				{/* Progress Bar */}
				<View style={styles.progressContainer}>
					<View
						style={[
							styles.progressBar,
							{ backgroundColor: theme.colors.border },
						]}
					>
						<View
							style={[
								styles.progressFill,
								{
									backgroundColor: theme.colors.primary,
									width: `${item.completion_percentage || 0}%`,
								},
							]}
						/>
					</View>
					<Text
						style={[styles.progressText, { color: theme.colors.textSecondary }]}
					>
						{Math.round(item.completion_percentage || 0)}% complete
					</Text>
				</View>
			</ModernCard>
		</TouchableOpacity>
	);

	if (loading) {
		return (
			<SafeAreaView
				style={[styles.container, { backgroundColor: theme.colors.background }]}
			>
				<View style={styles.loadingContainer}>
					<Text style={[styles.loadingText, { color: theme.colors.text }]}>
						Loading levels...
					</Text>
				</View>
			</SafeAreaView>
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
					Choose Your Level
				</Text>
				<View style={styles.placeholder} />
			</View>

			<FlatList
				data={levels.filter((level) => level.is_active)}
				renderItem={renderLevelCard}
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
	placeholder: {
		width: 40,
	},
	listContainer: {
		padding: 16,
	},
	levelCard: {
		marginBottom: 16,
	},
	card: {
		padding: 20,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	levelInfo: {
		flex: 1,
	},
	levelName: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 8,
	},
	levelMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	difficultyBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	difficultyText: {
		color: "white",
		fontSize: 12,
		fontWeight: "600",
	},
	moduleCount: {
		fontSize: 14,
	},
	description: {
		fontSize: 16,
		lineHeight: 22,
		marginBottom: 16,
	},
	progressContainer: {
		marginTop: 8,
	},
	progressBar: {
		height: 6,
		borderRadius: 3,
		marginBottom: 6,
	},
	progressFill: {
		height: "100%",
		borderRadius: 3,
	},
	progressText: {
		fontSize: 12,
		textAlign: "right",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		fontSize: 16,
	},
});
