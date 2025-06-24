import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	Modal,
	SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { ContentManagementService } from "../../services/contentManagementService";
import { Module, DifficultyLevel } from "../../types";
import {
	LessonContent,
	LessonSection,
	LessonExample,
	LessonType,
} from "../../types/LessonTypes";

interface LessonFormData {
	title: string;
	module_id: number;
	lesson_type: LessonType;
	difficulty_level: DifficultyLevel;
	estimated_duration: number;
	points_reward: number;
	order_index: number;
	content: LessonContent;
	is_active: boolean;
}

interface BookLessonEditorProps {
	visible: boolean;
	onClose: () => void;
	onSave: (lessonData: LessonFormData) => void;
	editingLesson?: any;
	modules: Module[];
}

export const BookLessonEditor: React.FC<BookLessonEditorProps> = ({
	visible,
	onClose,
	onSave,
	editingLesson,
	modules,
}) => {
	const [formData, setFormData] = useState<LessonFormData>({
		title: "",
		module_id: 0,
		lesson_type: "vocabulary",
		difficulty_level: "beginner",
		estimated_duration: 15,
		points_reward: 10,
		order_index: 0,
		content: {
			introduction: "",
			sections: [],
			summary: "",
			examples: [],
		},
		is_active: true,
	});

	const [activeTab, setActiveTab] = useState<
		"basic" | "content" | "sections" | "examples"
	>("basic");
	const [selectedSectionIndex, setSelectedSectionIndex] = useState<
		number | null
	>(null);

	useEffect(() => {
		if (editingLesson) {
			setFormData({
				...editingLesson,
				content: editingLesson.content || {
					introduction: "",
					sections: [],
					summary: "",
					examples: [],
				},
			});
		} else {
			// Reset form for new lesson
			setFormData({
				title: "",
				module_id: modules.length > 0 ? modules[0].id : 0,
				lesson_type: "vocabulary",
				difficulty_level: "beginner",
				estimated_duration: 15,
				points_reward: 10,
				order_index: 0,
				content: {
					introduction: "",
					sections: [],
					summary: "",
					examples: [],
				},
				is_active: true,
			});
		}
	}, [editingLesson, modules]);

	const updateFormData = (field: keyof LessonFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const updateContent = (field: keyof LessonContent, value: any) => {
		setFormData((prev) => ({
			...prev,
			content: { ...prev.content, [field]: value },
		}));
	};

	const addSection = () => {
		const newSection: LessonSection = {
			id: `section_${Date.now()}`,
			type: "text",
			title: "",
			content: "",
			examples: [],
			order_index: formData.content.sections?.length || 0,
			is_required: true,
		};

		updateContent("sections", [
			...(formData.content.sections || []),
			newSection,
		]);
	};

	const updateSection = (
		index: number,
		field: keyof LessonSection,
		value: any
	) => {
		const sections = [...(formData.content.sections || [])];
		sections[index] = { ...sections[index], [field]: value };
		updateContent("sections", sections);
	};

	const removeSection = (index: number) => {
		const sections = [...(formData.content.sections || [])];
		sections.splice(index, 1);
		updateContent("sections", sections);
		setSelectedSectionIndex(null);
	};

	const addExample = (target: "global" | "section", sectionIndex?: number) => {
		const newExample: LessonExample = {
			id: `example_${Date.now()}`,
			french: "",
			english: "",
			pronunciation: "",
			context: "",
		};

		if (target === "global") {
			updateContent("examples", [
				...(formData.content.examples || []),
				newExample,
			]);
		} else if (target === "section" && sectionIndex !== undefined) {
			const sections = [...(formData.content.sections || [])];
			sections[sectionIndex].examples = [
				...(sections[sectionIndex].examples || []),
				newExample,
			];
			updateContent("sections", sections);
		}
	};

	const updateExample = (
		exampleIndex: number,
		field: keyof LessonExample,
		value: string,
		target: "global" | "section",
		sectionIndex?: number
	) => {
		if (target === "global") {
			const examples = [...(formData.content.examples || [])];
			examples[exampleIndex] = { ...examples[exampleIndex], [field]: value };
			updateContent("examples", examples);
		} else if (target === "section" && sectionIndex !== undefined) {
			const sections = [...(formData.content.sections || [])];
			const examples = [...(sections[sectionIndex].examples || [])];
			examples[exampleIndex] = { ...examples[exampleIndex], [field]: value };
			sections[sectionIndex].examples = examples;
			updateContent("sections", sections);
		}
	};

	const removeExample = (
		exampleIndex: number,
		target: "global" | "section",
		sectionIndex?: number
	) => {
		if (target === "global") {
			const examples = [...(formData.content.examples || [])];
			examples.splice(exampleIndex, 1);
			updateContent("examples", examples);
		} else if (target === "section" && sectionIndex !== undefined) {
			const sections = [...(formData.content.sections || [])];
			const examples = [...(sections[sectionIndex].examples || [])];
			examples.splice(exampleIndex, 1);
			sections[sectionIndex].examples = examples;
			updateContent("sections", sections);
		}
	};

	const handleSave = () => {
		// Validation
		if (!formData.title.trim()) {
			Alert.alert("Error", "Please enter a lesson title");
			return;
		}

		if (!formData.module_id) {
			Alert.alert("Error", "Please select a module");
			return;
		}

		if (
			!formData.content.introduction?.trim() &&
			(!formData.content.sections || formData.content.sections.length === 0)
		) {
			Alert.alert(
				"Error",
				"Please add an introduction or at least one section"
			);
			return;
		}

		onSave(formData);
	};

	const renderBasicTab = () => (
		<View style={styles.tabContent}>
			<Text style={styles.label}>Title *</Text>
			<TextInput
				style={styles.input}
				value={formData.title}
				onChangeText={(value) => updateFormData("title", value)}
				placeholder="Enter lesson title"
			/>

			<Text style={styles.label}>Module *</Text>
			<View style={styles.pickerContainer}>
				<Picker
					selectedValue={formData.module_id}
					onValueChange={(value) => updateFormData("module_id", value)}
					style={styles.picker}
				>
					{modules.map((module) => (
						<Picker.Item
							key={module.id}
							label={module.title}
							value={module.id}
						/>
					))}
				</Picker>
			</View>

			<Text style={styles.label}>Lesson Type</Text>
			<View style={styles.pickerContainer}>
				<Picker
					selectedValue={formData.lesson_type}
					onValueChange={(value) => updateFormData("lesson_type", value)}
					style={styles.picker}
				>
					<Picker.Item label="Vocabulary" value="vocabulary" />
					<Picker.Item label="Grammar" value="grammar" />
					<Picker.Item label="Pronunciation" value="pronunciation" />
					<Picker.Item label="Conversation" value="conversation" />
					<Picker.Item label="Cultural" value="cultural" />
					<Picker.Item label="Mixed" value="mixed" />
				</Picker>
			</View>

			<Text style={styles.label}>Difficulty Level</Text>
			<View style={styles.pickerContainer}>
				<Picker
					selectedValue={formData.difficulty_level}
					onValueChange={(value) => updateFormData("difficulty_level", value)}
					style={styles.picker}
				>
					<Picker.Item label="Beginner" value="beginner" />
					<Picker.Item label="Intermediate" value="intermediate" />
					<Picker.Item label="Advanced" value="advanced" />
				</Picker>
			</View>

			<View style={styles.row}>
				<View style={styles.halfWidth}>
					<Text style={styles.label}>Duration (minutes)</Text>
					<TextInput
						style={styles.input}
						value={formData.estimated_duration.toString()}
						onChangeText={(value) =>
							updateFormData("estimated_duration", parseInt(value) || 15)
						}
						keyboardType="numeric"
						placeholder="15"
					/>
				</View>

				<View style={styles.halfWidth}>
					<Text style={styles.label}>Points Reward</Text>
					<TextInput
						style={styles.input}
						value={formData.points_reward.toString()}
						onChangeText={(value) =>
							updateFormData("points_reward", parseInt(value) || 10)
						}
						keyboardType="numeric"
						placeholder="10"
					/>
				</View>
			</View>
		</View>
	);

	const renderContentTab = () => (
		<View style={styles.tabContent}>
			<Text style={styles.label}>Introduction</Text>
			<TextInput
				style={styles.textArea}
				value={formData.content.introduction}
				onChangeText={(value) => updateContent("introduction", value)}
				placeholder="Enter lesson introduction..."
				multiline
				numberOfLines={4}
			/>

			<Text style={styles.label}>Summary</Text>
			<TextInput
				style={styles.textArea}
				value={formData.content.summary}
				onChangeText={(value) => updateContent("summary", value)}
				placeholder="Enter lesson summary..."
				multiline
				numberOfLines={4}
			/>
		</View>
	);

	const renderSectionsTab = () => (
		<View style={styles.tabContent}>
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>Lesson Sections</Text>
				<TouchableOpacity style={styles.addButton} onPress={addSection}>
					<Ionicons name="add" size={20} color="#fff" />
					<Text style={styles.addButtonText}>Add Section</Text>
				</TouchableOpacity>
			</View>

			{formData.content.sections?.map((section, index) => (
				<View key={section.id} style={styles.sectionCard}>
					<View style={styles.sectionCardHeader}>
						<Text style={styles.sectionCardTitle}>Section {index + 1}</Text>
						<View style={styles.sectionActions}>
							<TouchableOpacity
								style={styles.editButton}
								onPress={() =>
									setSelectedSectionIndex(
										selectedSectionIndex === index ? null : index
									)
								}
							>
								<Ionicons
									name={
										selectedSectionIndex === index
											? "chevron-up"
											: "chevron-down"
									}
									size={20}
									color="#007AFF"
								/>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => removeSection(index)}
							>
								<Ionicons name="trash" size={18} color="#F44336" />
							</TouchableOpacity>
						</View>
					</View>

					{selectedSectionIndex === index && (
						<View style={styles.sectionEditor}>
							<Text style={styles.label}>Section Title</Text>
							<TextInput
								style={styles.input}
								value={section.title}
								onChangeText={(value) => updateSection(index, "title", value)}
								placeholder="Enter section title"
							/>

							<Text style={styles.label}>Content</Text>
							<TextInput
								style={styles.textArea}
								value={section.content}
								onChangeText={(value) => updateSection(index, "content", value)}
								placeholder="Enter section content..."
								multiline
								numberOfLines={6}
							/>

							<View style={styles.sectionExamples}>
								<View style={styles.sectionHeader}>
									<Text style={styles.label}>Section Examples</Text>
									<TouchableOpacity
										style={styles.smallAddButton}
										onPress={() => addExample("section", index)}
									>
										<Ionicons name="add" size={16} color="#007AFF" />
									</TouchableOpacity>
								</View>

								{section.examples?.map((example, exIndex) => (
									<View key={example.id} style={styles.exampleCard}>
										<View style={styles.exampleHeader}>
											<Text style={styles.exampleNumber}>
												Example {exIndex + 1}
											</Text>
											<TouchableOpacity
												onPress={() => removeExample(exIndex, "section", index)}
											>
												<Ionicons name="close" size={16} color="#F44336" />
											</TouchableOpacity>
										</View>
										<TextInput
											style={styles.input}
											value={example.french}
											onChangeText={(value) =>
												updateExample(
													exIndex,
													"french",
													value,
													"section",
													index
												)
											}
											placeholder="French text"
										/>
										<TextInput
											style={styles.input}
											value={example.english}
											onChangeText={(value) =>
												updateExample(
													exIndex,
													"english",
													value,
													"section",
													index
												)
											}
											placeholder="English translation"
										/>
										<TextInput
											style={styles.input}
											value={example.pronunciation || ""}
											onChangeText={(value) =>
												updateExample(
													exIndex,
													"pronunciation",
													value,
													"section",
													index
												)
											}
											placeholder="Pronunciation (optional)"
										/>
									</View>
								))}
							</View>
						</View>
					)}
				</View>
			))}
		</View>
	);

	const renderExamplesTab = () => (
		<View style={styles.tabContent}>
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>Global Examples</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => addExample("global")}
				>
					<Ionicons name="add" size={20} color="#fff" />
					<Text style={styles.addButtonText}>Add Example</Text>
				</TouchableOpacity>
			</View>

			{formData.content.examples?.map((example, index) => (
				<View key={example.id} style={styles.exampleCard}>
					<View style={styles.exampleHeader}>
						<Text style={styles.exampleNumber}>Example {index + 1}</Text>
						<TouchableOpacity onPress={() => removeExample(index, "global")}>
							<Ionicons name="close" size={16} color="#F44336" />
						</TouchableOpacity>
					</View>
					<TextInput
						style={styles.input}
						value={example.french}
						onChangeText={(value) =>
							updateExample(index, "french", value, "global")
						}
						placeholder="French text"
					/>
					<TextInput
						style={styles.input}
						value={example.english}
						onChangeText={(value) =>
							updateExample(index, "english", value, "global")
						}
						placeholder="English translation"
					/>
					<TextInput
						style={styles.input}
						value={example.pronunciation || ""}
						onChangeText={(value) =>
							updateExample(index, "pronunciation", value, "global")
						}
						placeholder="Pronunciation (optional)"
					/>
					<TextInput
						style={styles.input}
						value={example.context || ""}
						onChangeText={(value) =>
							updateExample(index, "context", value, "global")
						}
						placeholder="Context (optional)"
					/>
				</View>
			))}
		</View>
	);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="fullScreen"
		>
			<SafeAreaView style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={onClose}>
						<Ionicons name="close" size={24} color="#333" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>
						{editingLesson ? "Edit Lesson" : "Create Book-Style Lesson"}
					</Text>
					<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
						<Text style={styles.saveButtonText}>Save</Text>
					</TouchableOpacity>
				</View>

				{/* Tabs */}
				<View style={styles.tabContainer}>
					{(["basic", "content", "sections", "examples"] as const).map(
						(tab) => (
							<TouchableOpacity
								key={tab}
								style={[styles.tab, activeTab === tab && styles.activeTab]}
								onPress={() => setActiveTab(tab)}
							>
								<Text
									style={[
										styles.tabText,
										activeTab === tab && styles.activeTabText,
									]}
								>
									{tab.charAt(0).toUpperCase() + tab.slice(1)}
								</Text>
							</TouchableOpacity>
						)
					)}
				</View>

				{/* Content */}
				<ScrollView style={styles.content}>
					{activeTab === "basic" && renderBasicTab()}
					{activeTab === "content" && renderContentTab()}
					{activeTab === "sections" && renderSectionsTab()}
					{activeTab === "examples" && renderExamplesTab()}
				</ScrollView>
			</SafeAreaView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
	},
	saveButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	saveButtonText: {
		color: "#fff",
		fontWeight: "600",
	},
	tabContainer: {
		flexDirection: "row",
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
	},
	activeTab: {
		borderBottomWidth: 2,
		borderBottomColor: "#007AFF",
	},
	tabText: {
		fontSize: 14,
		color: "#666",
	},
	activeTabText: {
		color: "#007AFF",
		fontWeight: "600",
	},
	content: {
		flex: 1,
	},
	tabContent: {
		padding: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	input: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 16,
	},
	textArea: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 16,
		textAlignVertical: "top",
		minHeight: 100,
	},
	pickerContainer: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		marginBottom: 16,
	},
	picker: {
		height: 50,
	},
	row: {
		flexDirection: "row",
		gap: 12,
	},
	halfWidth: {
		flex: 1,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
	},
	addButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#007AFF",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		gap: 4,
	},
	addButtonText: {
		color: "#fff",
		fontWeight: "500",
	},
	smallAddButton: {
		padding: 4,
	},
	sectionCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		marginBottom: 12,
		overflow: "hidden",
	},
	sectionCardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		backgroundColor: "#f8f9fa",
	},
	sectionCardTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
	},
	sectionActions: {
		flexDirection: "row",
		gap: 8,
	},
	editButton: {
		padding: 4,
	},
	deleteButton: {
		padding: 4,
	},
	sectionEditor: {
		padding: 16,
	},
	sectionExamples: {
		marginTop: 16,
		padding: 12,
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
	},
	exampleCard: {
		backgroundColor: "#fff",
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
	},
	exampleHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	exampleNumber: {
		fontSize: 14,
		fontWeight: "600",
		color: "#666",
	},
});
