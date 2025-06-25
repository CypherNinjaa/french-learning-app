/**
 * Complete Book-Style Lesson System Test
 * This tests the entire lesson clicking and reading flow
 */

import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { LessonReader } from "../components/LessonReader";
import { ContentManagementService } from "../services/contentManagementService";
import { Lesson } from "../types";

export const LessonSystemTest = () => {
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
				setLessons(result.data);
			} else {
				console.error("❌ Failed to load lessons:", result.error);
				Alert.alert("Error", "Failed to load lessons");
			}
		} catch (error) {
			console.error("❌ Error loading lessons:", error);
			Alert.alert("Error", "Failed to load lessons");
		} finally {
			setLoading(false);
		}
	};

	const handleLessonPress = (lesson: Lesson) => {
		console.log("🎯 Lesson pressed:", lesson.title);

		// Validate lesson has content
		if (!lesson.content) {
			Alert.alert("Error", "This lesson has no content");
			return;
		}

		// Validate content structure
		const content =
			typeof lesson.content === "string"
				? JSON.parse(lesson.content)
				: lesson.content;

		if (
			!content.introduction &&
			(!content.sections || content.sections.length === 0)
		) {
			Alert.alert("Error", "This lesson has invalid content structure");
			return;
		}

		console.log("✅ Lesson content is valid, opening reader...");
		setSelectedLesson(lesson);
	};

	const handleLessonComplete = () => {
		console.log("🎉 Lesson completed!");
		setSelectedLesson(null);
		Alert.alert("Success", "Lesson completed successfully!");
	};

	const renderLesson = ({ item, index }: { item: Lesson; index: number }) => (
		<TouchableOpacity
			style={{
				backgroundColor: "#fff",
				margin: 8,
				padding: 16,
				borderRadius: 12,
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 4,
				elevation: 3,
			}}
			onPress={() => handleLessonPress(item)}
			activeOpacity={0.7}
		>
			<Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
				{index + 1}. {item.title}
			</Text>
			<Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
				{item.content?.introduction || "No description available"}
			</Text>
			<Text style={{ fontSize: 12, color: "#999" }}>15 min • beginner</Text>
		</TouchableOpacity>
	);

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Loading lessons...</Text>
			</View>
		);
	}

	return (
		<View style={{ flex: 1 }}>
			<FlatList
				data={lessons}
				renderItem={renderLesson}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={{ padding: 8 }}
			/>

			{selectedLesson && (
				<LessonReader
					lesson={selectedLesson}
					onClose={() => setSelectedLesson(null)}
					onComplete={handleLessonComplete}
				/>
			)}
		</View>
	);
};
