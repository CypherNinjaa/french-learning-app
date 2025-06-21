// Pronunciation Words Management Admin Screen
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	TextInput,
	Alert,
	ActivityIndicator,
	Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Replace with your actual API or Supabase client
import { supabase } from "../../services/supabase";

interface PronunciationWord {
	id: number;
	french: string;
	english: string;
	pronunciation: string;
	example: string;
	created_at?: string;
}

export const PronunciationWordsManagement: React.FC = () => {
	const [words, setWords] = useState<PronunciationWord[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingWord, setEditingWord] = useState<PronunciationWord | null>(
		null
	);
	const [form, setForm] = useState({
		french: "",
		english: "",
		pronunciation: "",
		example: "",
	});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		fetchWords();
	}, []);

	const fetchWords = async () => {
		setLoading(true);
		const { data, error } = await supabase
			.from("pronunciation_words")
			.select("*")
			.order("created_at", { ascending: false });
		if (error) Alert.alert("Error", error.message);
		setWords(data || []);
		setLoading(false);
	};

	const openAddModal = () => {
		setEditingWord(null);
		setForm({ french: "", english: "", pronunciation: "", example: "" });
		setModalVisible(true);
	};

	const openEditModal = (word: PronunciationWord) => {
		setEditingWord(word);
		setForm({
			french: word.french,
			english: word.english,
			pronunciation: word.pronunciation,
			example: word.example,
		});
		setModalVisible(true);
	};

	const handleSave = async () => {
		if (!form.french || !form.english) {
			Alert.alert("Validation", "French and English are required.");
			return;
		}
		setSaving(true);
		if (editingWord) {
			// Update
			const { error } = await supabase
				.from("pronunciation_words")
				.update(form)
				.eq("id", editingWord.id);
			if (error) Alert.alert("Error", error.message);
		} else {
			// Insert
			const { error } = await supabase
				.from("pronunciation_words")
				.insert([form]);
			if (error) Alert.alert("Error", error.message);
		}
		setSaving(false);
		setModalVisible(false);
		fetchWords();
	};

	const handleDelete = (word: PronunciationWord) => {
		Alert.alert(
			"Delete Word",
			`Are you sure you want to delete "${word.french}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						await supabase
							.from("pronunciation_words")
							.delete()
							.eq("id", word.id);
						fetchWords();
					},
				},
			]
		);
	};

	const renderItem = ({ item }: { item: PronunciationWord }) => (
		<View style={styles.wordCard}>
			<View style={{ flex: 1 }}>
				<Text style={styles.french}>{item.french}</Text>
				<Text style={styles.english}>{item.english}</Text>
				{item.pronunciation ? (
					<Text style={styles.pronunciation}>/{item.pronunciation}/</Text>
				) : null}
				{item.example ? (
					<Text style={styles.example}>{item.example}</Text>
				) : null}
			</View>
			<View style={styles.actions}>
				<TouchableOpacity onPress={() => openEditModal(item)}>
					<Ionicons name="create-outline" size={22} color="#007AFF" />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleDelete(item)}>
					<Ionicons name="trash-outline" size={22} color="#FF3B30" />
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Pronunciation Words Management</Text>
			</View>
			{loading ? (
				<ActivityIndicator
					size="large"
					color="#007AFF"
					style={{ marginTop: 40 }}
				/>
			) : (
				<FlatList
					data={words}
					keyExtractor={(item) => item.id.toString()}
					renderItem={renderItem}
					contentContainerStyle={{ padding: 16 }}
					ListEmptyComponent={
						<Text style={{ textAlign: "center", marginTop: 40 }}>
							No words found.
						</Text>
					}
				/>
			)}
			{/* Floating Add Button */}
			<TouchableOpacity
				style={styles.fab}
				onPress={openAddModal}
				activeOpacity={0.7}
			>
				<View style={styles.addButtonCircle}>
					<Ionicons name="add" size={32} color="#fff" />
				</View>
			</TouchableOpacity>
			{/* Modal for Add/Edit */}
			<Modal visible={modalVisible} animationType="slide" transparent>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>
							{editingWord ? "Edit Word" : "Add Word"}
						</Text>
						<TextInput
							style={styles.input}
							placeholder="French word *"
							value={form.french}
							onChangeText={(text) => setForm((f) => ({ ...f, french: text }))}
						/>
						<TextInput
							style={styles.input}
							placeholder="English translation *"
							value={form.english}
							onChangeText={(text) => setForm((f) => ({ ...f, english: text }))}
						/>
						<TextInput
							style={styles.input}
							placeholder="Pronunciation (IPA)"
							value={form.pronunciation}
							onChangeText={(text) =>
								setForm((f) => ({ ...f, pronunciation: text }))
							}
						/>
						<TextInput
							style={styles.input}
							placeholder="Example sentence"
							value={form.example}
							onChangeText={(text) => setForm((f) => ({ ...f, example: text }))}
						/>
						<View style={styles.modalActions}>
							<TouchableOpacity
								style={styles.saveButton}
								onPress={handleSave}
								disabled={saving}
							>
								<Text style={styles.saveButtonText}>
									{saving ? "Saving..." : "Save"}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={() => setModalVisible(false)}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#f5f5f5" },
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 16,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	title: { fontSize: 20, fontWeight: "700", color: "#333" },
	addButton: {
		marginLeft: 16,
		marginRight: 0,
		padding: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	addButtonCircle: {
		backgroundColor: "#007AFF",
		borderRadius: 24,
		width: 48,
		height: 48,
		alignItems: "center",
		justifyContent: "center",
		elevation: 4,
		shadowColor: "#007AFF",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	wordCard: {
		flexDirection: "row",
		alignItems: "flex-start",
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 18,
		marginBottom: 14,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
	},
	french: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#007AFF",
		marginBottom: 2,
	},
	english: { fontSize: 16, color: "#333", marginBottom: 2 },
	pronunciation: {
		fontSize: 14,
		color: "#666",
		fontStyle: "italic",
		marginBottom: 8,
	},
	example: {
		fontSize: 14,
		color: "#666",
		lineHeight: 18,
		borderLeftWidth: 3,
		borderLeftColor: "#007AFF",
		paddingLeft: 8,
		marginTop: 6,
	},
	actions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginLeft: 12,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 24,
		width: 320,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#333",
		marginBottom: 16,
		textAlign: "center",
	},
	input: {
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		fontSize: 16,
		color: "#333",
	},
	modalActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 12,
	},
	saveButton: {
		backgroundColor: "#007AFF",
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 24,
	},
	saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
	cancelButton: {
		backgroundColor: "#eee",
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 24,
	},
	cancelButtonText: { color: "#333", fontSize: 16, fontWeight: "600" },
	fab: {
		position: "absolute",
		bottom: 32,
		right: 24,
		zIndex: 10,
	},
});

export default PronunciationWordsManagement;
