// Simple Lesson Screen for testing Stage 4.1 features
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { DynamicLessonRenderer } from "../components/lesson/DynamicLessonRenderer";

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
		Alert.alert(
			"Lesson Completed!",
			`Score: ${score}%\nTime: ${Math.floor(timeSpent / 60)}m ${
				timeSpent % 60
			}s`,
			[
				{
					text: "Continue",
					onPress: () => navigation.goBack(),
				},
			]
		);
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
