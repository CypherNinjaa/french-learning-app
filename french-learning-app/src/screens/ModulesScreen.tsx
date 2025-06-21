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
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { ModernCard } from "../components/ModernUI";
import { ContentManagementService } from "../services/contentManagementService";

interface Module {
	id: number;
	level_id: number;
	title: string;
	description: string;
	order_index: number;
	is_active: boolean;
	lessons_count?: number;
	completion_percentage?: number;
}

interface ModulesScreenProps {
	navigation: any;
	route: {
		params: {
			levelId: number;
			levelName: string;
			userId: string;
		};
	};
}

export const ModulesScreen: React.FC<ModulesScreenProps> = ({
	navigation,
	route,
}) => {
	const { user } = useAuth();
	const { levelId, levelName } = route.params;
	const [modules, setModules] = useState<Module[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const fetchModules = async () => {
		try {
			const response = await ContentManagementService.getModules();
			const allModules = response.data || [];
			const levelModules = allModules.filter(
				(module: any) => module.level_id === levelId
			);

			// Get lesson counts for each module
			const modulesWithCounts = await Promise.all(
				levelModules.map(async (module: any) => {
					const lessonResponse = await ContentManagementService.getLessons();
					const lessons =
						lessonResponse.data?.filter(
							(l: any) => l.module_id === module.id
						) || [];
					return {
						...module,
						lessons_count: lessons.length,
						completion_percentage: 0, // TODO: Calculate actual completion percentage
					};
				})
			);

			// Sort by order_index
			modulesWithCounts.sort(
				(a, b) => (a.order_index || 0) - (b.order_index || 0)
			);
			setModules(modulesWithCounts);
		} catch (error) {
			console.error("Error fetching modules:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchModules();
	}, [levelId]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchModules();
		setRefreshing(false);
	};

	const handleModulePress = (module: Module) => {
		navigation.navigate("LessonList", {
			moduleId: module.id,
			moduleName: module.title,
			userId: user?.id,
		});
	};

	const getModuleIcon = (orderIndex: number) => {
		const icons = [
			"book",
			"school",
			"library",
			"bookmark",
			"document-text",
			"folder",
		];
		return icons[orderIndex % icons.length] as keyof typeof Ionicons.glyphMap;
	};

	const renderModuleCard = ({ item }: { item: Module }) => (
		<TouchableOpacity
			style={styles.moduleCard}
			onPress={() => handleModulePress(item)}
			activeOpacity={0.7}
		>
			<ModernCard style={styles.card}>
				<View style={styles.cardHeader}>
					<View style={styles.moduleIcon}>
						<Ionicons
							name={getModuleIcon(item.order_index || 0)}
							size={24}
							color={theme.colors.primary}
						/>
					</View>
					<View style={styles.moduleInfo}>
						<Text style={[styles.moduleName, { color: theme.colors.text }]}>
							{item.title}
						</Text>
						<Text
							style={[
								styles.lessonCount,
								{ color: theme.colors.textSecondary },
							]}
						>
							{item.lessons_count || 0} lessons
						</Text>
					</View>
					<Ionicons
						name="chevron-forward"
						size={20}
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
						Loading modules...
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
				<View style={styles.headerContent}>
					<Text style={[styles.title, { color: theme.colors.text }]}>
						{levelName}
					</Text>
					<Text
						style={[styles.subtitle, { color: theme.colors.textSecondary }]}
					>
						Choose a module to start learning
					</Text>
				</View>
				<View style={styles.placeholder} />
			</View>

			<FlatList
				data={modules.filter((module) => module.is_active)}
				renderItem={renderModuleCard}
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
	headerContent: {
		flex: 1,
		alignItems: "center",
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
	},
	subtitle: {
		fontSize: 14,
		marginTop: 2,
	},
	placeholder: {
		width: 40,
	},
	listContainer: {
		padding: 16,
	},
	moduleCard: {
		marginBottom: 12,
	},
	card: {
		padding: 16,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	moduleIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(0,0,0,0.05)",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	moduleInfo: {
		flex: 1,
	},
	moduleName: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 2,
	},
	lessonCount: {
		fontSize: 12,
	},
	description: {
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 12,
	},
	progressContainer: {
		marginTop: 4,
	},
	progressBar: {
		height: 4,
		borderRadius: 2,
		marginBottom: 4,
	},
	progressFill: {
		height: "100%",
		borderRadius: 2,
	},
	progressText: {
		fontSize: 10,
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
