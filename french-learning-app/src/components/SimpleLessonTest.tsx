import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	FlatList,
	Alert,
	StyleSheet,
	SafeAreaView,
} from "react-native";
import { ContentManagementService } from "../services/contentManagementService";
import { LessonReader } from "../components/LessonReader";
import { Lesson } from "../types";

export const SimpleLessonTest = () => {
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadLessons();
	}, []);

	const loadLessons = async () => {
		try {
			console.log("🔄 Loading lessons...");
			const result = await ContentManagementService.getLessons();

			if (result.success && result.data) {
				console.log(`✅ Loaded ${result.data.length} lessons`);
				console.log("First lesson:", result.data[0]);
				setLessons(result.data as unknown as Lesson[]);
			} else {
				console.error("❌ Failed to load lessons:", result.error);
				Alert.alert(
					"Error",
					"Failed to load lessons: " + (result.error || "Unknown error")
				);
			}
		} catch (error) {
			console.error("❌ Error loading lessons:", error);
			Alert.alert("Error", "Failed to load lessons: " + String(error));
		} finally {
			setLoading(false);
		}
	};

	const handleLessonPress = (lesson: Lesson) => {
		console.log("🎯 Lesson pressed:", lesson.title);
		Alert.alert("Lesson Clicked!", `You clicked: ${lesson.title}`);

		// Check if lesson has content
		if (!lesson.content) {
			Alert.alert("No Content", "This lesson has no content");
			return;
		}

		console.log("✅ Opening lesson reader...");
		setSelectedLesson(lesson);
	};

	const handleLessonComplete = () => {
		console.log("🎉 Lesson completed!");
		setSelectedLesson(null);
		Alert.alert("Success", "Lesson completed!");
	};

	const renderLesson = ({ item, index }: { item: Lesson; index: number }) => (
		<TouchableOpacity
			style={styles.lessonItem}
			onPress={() => handleLessonPress(item)}
			activeOpacity={0.7}
		>
			<View style={styles.lessonNumber}>
				<Text style={styles.lessonNumberText}>{index + 1}</Text>
			</View>
			<View style={styles.lessonContent}>
				<Text style={styles.lessonTitle}>{item.title}</Text>{" "}
				<Text style={styles.lessonMeta}>
					{item.lesson_type} • {item.difficulty_level} •{" "}
					{(item as any).estimated_duration || 15} min
				</Text>
				{item.content?.introduction && (
					<Text style={styles.lessonDescription} numberOfLines={2}>
						{item.content.introduction}
					</Text>
				)}
			</View>
		</TouchableOpacity>
	);

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<Text style={styles.loadingText}>Loading lessons...</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Lesson Clickability Test</Text>
				<Text style={styles.subHeaderText}>Found {lessons.length} lessons</Text>
			</View>

			{lessons.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>No lessons found!</Text>
					<Text style={styles.emptySubText}>
						Run COMPLETE_BOOK_LESSONS_SETUP.sql first
					</Text>
					<TouchableOpacity style={styles.retryButton} onPress={loadLessons}>
						<Text style={styles.retryButtonText}>Retry</Text>
					</TouchableOpacity>
				</View>
			) : (
				<FlatList
					data={lessons}
					renderItem={renderLesson}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.listContainer}
				/>
			)}

			{selectedLesson && (
				<LessonReader
					lesson={selectedLesson}
					onClose={() => setSelectedLesson(null)}
					onComplete={handleLessonComplete}
				/>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		padding: 20,
		backgroundColor: "#007AFF",
	},
	headerText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
	},
	subHeaderText: {
		fontSize: 14,
		color: "rgba(255,255,255,0.8)",
		marginTop: 4,
	},
	loadingText: {
		textAlign: "center",
		marginTop: 50,
		fontSize: 16,
	},
	listContainer: {
		padding: 16,
	},
	lessonItem: {
		backgroundColor: "white",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		flexDirection: "row",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	lessonNumber: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#007AFF",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	lessonNumberText: {
		color: "white",
		fontWeight: "bold",
	},
	lessonContent: {
		flex: 1,
	},
	lessonTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	lessonMeta: {
		fontSize: 12,
		color: "#666",
		marginBottom: 4,
	},
	lessonDescription: {
		fontSize: 14,
		color: "#666",
		lineHeight: 20,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 8,
	},
	emptySubText: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		marginBottom: 20,
	},
	retryButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 8,
	},
	retryButtonText: {
		color: "white",
		fontWeight: "600",
	},
});
