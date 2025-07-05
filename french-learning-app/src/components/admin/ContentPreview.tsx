// Content Preview Component - Stage 3.2
// Provides preview functionality for vocabulary and grammar rules

import React from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Modal,
} from "react-native";
import { theme } from "../../constants/theme";
import { Vocabulary, GrammarRule } from "../../types";

interface ContentPreviewProps {
	visible: boolean;
	onClose: () => void;
	contentType: "vocabulary" | "grammar";
	content: Vocabulary | GrammarRule | null;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
	visible,
	onClose,
	contentType,
	content,
}) => {
	if (!content) return null;

	const renderVocabularyPreview = (vocabulary: Vocabulary) => (
		<View style={styles.previewContent}>
			<Text style={styles.previewTitle}>Vocabulary Preview</Text>
			<View style={styles.previewSection}>
				<Text style={styles.sectionTitle}>French Word</Text>
				<Text style={styles.sectionContent}>{vocabulary.french_word}</Text>
			</View>
			<View style={styles.previewSection}>
				<Text style={styles.sectionTitle}>English Translation</Text>
				<Text style={styles.sectionContent}>
					{vocabulary.english_translation}
				</Text>
			</View>
			{vocabulary.pronunciation && (
				<View style={styles.previewSection}>
					<Text style={styles.sectionTitle}>Pronunciation</Text>
					<Text style={styles.sectionContent}>{vocabulary.pronunciation}</Text>
				</View>
			)}
			<View style={styles.previewSection}>
				<Text style={styles.sectionTitle}>Word Type</Text>
				<Text style={styles.sectionContent}>{vocabulary.word_type}</Text>
			</View>
			{vocabulary.gender && (
				<View style={styles.previewSection}>
					<Text style={styles.sectionTitle}>Gender</Text>
					<Text style={styles.sectionContent}>{vocabulary.gender}</Text>
				</View>
			)}
			<View style={styles.previewSection}>
				<Text style={styles.sectionTitle}>Difficulty</Text>
				<Text style={styles.sectionContent}>{vocabulary.difficulty_level}</Text>
			</View>
			{vocabulary.example_sentence_fr && (
				<View style={styles.previewSection}>
					<Text style={styles.sectionTitle}>Example Sentence</Text>
					<Text style={styles.sectionContent}>
						{vocabulary.example_sentence_fr}
					</Text>
				</View>
			)}
		</View>
	);

	const renderGrammarPreview = (grammar: GrammarRule) => (
		<View style={styles.previewContent}>
			<Text style={styles.previewTitle}>Grammar Rule Preview</Text>
			<View style={styles.previewSection}>
				<Text style={styles.sectionTitle}>Title</Text>
				<Text style={styles.sectionContent}>{grammar.title}</Text>
			</View>
			<View style={styles.previewSection}>
				<Text style={styles.sectionTitle}>Category</Text>
				<Text style={styles.sectionContent}>{grammar.category}</Text>
			</View>
			<View style={styles.previewSection}>
				<Text style={styles.sectionTitle}>Difficulty</Text>
				<Text style={styles.sectionContent}>{grammar.difficulty_level}</Text>
			</View>
			<View style={styles.previewSection}>
				<Text style={styles.sectionTitle}>Rule</Text>
				<Text style={styles.sectionContent}>{grammar.explanation}</Text>
			</View>
			{grammar.explanation && (
				<View style={styles.previewSection}>
					<Text style={styles.sectionTitle}>Explanation</Text>
					<Text style={styles.sectionContent}>{grammar.explanation}</Text>
				</View>
			)}
			{grammar.examples && grammar.examples.length > 0 && (
				<View style={styles.previewSection}>
					<Text style={styles.sectionTitle}>Examples</Text>
					{grammar.examples.map((example: any, index: number) => (
						<Text key={index} style={styles.exampleText}>
							• {example}
						</Text>
					))}
				</View>
			)}
		</View>
	);

	const renderContent = () => {
		switch (contentType) {
			case "vocabulary":
				return renderVocabularyPreview(content as Vocabulary);
			case "grammar":
				return renderGrammarPreview(content as GrammarRule);
			default:
				return null;
		}
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity style={styles.closeButton} onPress={onClose}>
						<Text style={styles.closeButtonText}>✕ Close</Text>
					</TouchableOpacity>
				</View>
				<ScrollView style={styles.scrollView}>{renderContent()}</ScrollView>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	header: {
		backgroundColor: theme.colors.surface,
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	closeButton: {
		alignSelf: "flex-end",
	},
	closeButtonText: {
		...theme.typography.button,
		color: theme.colors.primary,
	},
	scrollView: {
		flex: 1,
	},
	previewContent: {
		padding: theme.spacing.lg,
	},
	previewTitle: {
		...theme.typography.heading,
		color: theme.colors.primary,
		marginBottom: theme.spacing.lg,
		textAlign: "center",
	},
	previewSection: {
		marginBottom: theme.spacing.md,
		padding: theme.spacing.md,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.medium,
	},
	sectionTitle: {
		...theme.typography.subheading,
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	sectionContent: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		lineHeight: 22,
	},
	exampleText: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		marginLeft: theme.spacing.sm,
		marginBottom: theme.spacing.xs,
	},
	optionText: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
	},
});
