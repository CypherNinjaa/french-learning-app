import React, { useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	FlatList,
	TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";
import { SpeechService } from "../services/speechService";
import { useGamification } from "../hooks/useGamification";
import { useAuth } from "../contexts/AuthContext";

export const VocabularyPracticeScreen = ({ route, navigation }: any) => {
	const { words = [], userId } = route.params || {};
	const { user } = useAuth();
	const { completeActivity } = useGamification();

	// Award points for vocabulary practice session when component unmounts
	useEffect(() => {
		return () => {
			// Award points when leaving vocabulary practice (session completion)
			if (user && words.length > 0) {
				completeActivity("vocabulary_quiz", 10, {
					wordsStudied: words.length,
					sessionType: "vocabulary_practice",
					vocabularyCount: words.length
				}).catch(console.error);
			}
		};
	}, [user, words.length, completeActivity]);

	const renderWordCard = ({ item, index }: any) => (
		<View style={styles.card}>
			<Text style={styles.word}>{item.french_word}</Text>
			<Text style={styles.translation}>{item.english_translation}</Text>
			{item.pronunciation && (
				<Text style={styles.pronunciation}>[{item.pronunciation}]</Text>
			)}
			{item.example_sentence_french && (
				<Text style={styles.example}>{item.example_sentence_french}</Text>
			)}
			<TouchableOpacity
				style={styles.speechButton}
				onPress={() => SpeechService.speakFrench(item.french_word)}
			>
				<Ionicons name="volume-high" size={22} color={theme.colors.primary} />
			</TouchableOpacity>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.backButton}
				>
					<Ionicons name="chevron-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.title}>Vocabulary Practice</Text>
				<View style={{ width: 32 }} />
			</View>
			<FlatList
				data={words}
				renderItem={renderWordCard}
				keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
				contentContainerStyle={styles.list}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: theme.colors.background },
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	backButton: { padding: 8 },
	title: { fontSize: 20, fontWeight: "bold", color: theme.colors.text },
	list: { padding: 16 },
	card: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	word: { fontSize: 20, fontWeight: "bold", color: theme.colors.primary },
	translation: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		marginBottom: 4,
	},
	pronunciation: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	example: { fontSize: 14, color: theme.colors.text, marginTop: 4 },
	speechButton: {
		marginTop: 8,
		alignSelf: "flex-start",
		backgroundColor: "rgba(0,0,0,0.05)",
		borderRadius: 20,
		padding: 8,
	},
});
