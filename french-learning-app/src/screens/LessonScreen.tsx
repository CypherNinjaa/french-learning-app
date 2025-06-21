// Simple Lesson Screen for testing Stage 4.1 features
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { DynamicLessonRenderer } from "../components/lesson/DynamicLessonRenderer";
import { theme } from "../constants/theme";

interface LessonScreenProps {
	route: {
		params: {
			lessonId: number;
			userId: string;
			lessonTitle: string;
		};
	};
	navigation: any;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({
	route,
	navigation,
}) => {
	const { lessonId, userId, lessonTitle } = route.params;

	const handleLessonComplete = (score: number, timeSpent: number) => {
		// Only navigate back, do not show duplicate Alert
		navigation.goBack();
	};

	const handleExit = () => {
		navigation.goBack();
	};

	return (
		<SafeAreaView style={styles.container}>
			<DynamicLessonRenderer
				lessonId={lessonId}
				userId={userId}
				onComplete={handleLessonComplete}
				onExit={handleExit}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
});
