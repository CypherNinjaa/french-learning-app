// Drag and Drop Question Renderer - Stage 4.2
// Interactive drag and drop vocabulary matching component

import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	PanResponder,
	Animated,
	Dimensions,
	Alert,
} from "react-native";
import { theme } from "../../../constants/theme";
import { BaseQuestionProps } from "../../../types/QuestionTypes";
import { Question } from "../../../types";

interface DragAndDropProps extends BaseQuestionProps {
	question: Question;
}

interface DragItem {
	id: string;
	content: string;
	originalIndex: number;
	currentPosition: { x: number; y: number };
	pan: Animated.ValueXY;
	isDragging: boolean;
	isMatched: boolean;
	isCorrect?: boolean;
}

interface DropZone {
	id: string;
	content: string;
	acceptableItems: string[];
	currentItem?: string;
	position: { x: number; y: number; width: number; height: number };
	isCorrect?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const DragAndDropRenderer: React.FC<DragAndDropProps> = ({
	question,
	onAnswer,
	isAnswered,
	userAnswer,
	showCorrectAnswer,
	disabled,
	timeUp,
}) => {
	const [dragItems, setDragItems] = useState<DragItem[]>([]);
	const [dropZones, setDropZones] = useState<DropZone[]>([]);
	const [matches, setMatches] = useState<Record<string, string>>({});

	useEffect(() => {
		initializeItems();
	}, [question]);

	useEffect(() => {
		if (timeUp && !isAnswered) {
			handleSubmit();
		}
	}, [timeUp, isAnswered]);

	const initializeItems = () => {
		// Parse question options for drag items and drop zones
		const options = question.options as any;

		if (!options || !options.items || !options.targets) {
			console.warn("Invalid drag and drop question format");
			return;
		}

		const items: DragItem[] = options.items.map((item: any, index: number) => ({
			id: item.id || `item_${index}`,
			content: item.content || item,
			originalIndex: index,
			currentPosition: { x: 0, y: 0 },
			pan: new Animated.ValueXY(),
			isDragging: false,
			isMatched: false,
		}));

		const zones: DropZone[] = options.targets.map(
			(target: any, index: number) => ({
				id: target.id || `zone_${index}`,
				content: target.content || target,
				acceptableItems: target.acceptable_items || [target.correct_item],
				position: { x: 0, y: 0, width: 0, height: 0 },
			})
		);

		setDragItems(items);
		setDropZones(zones);
	};

	const createPanResponder = (itemId: string) => {
		return PanResponder.create({
			onMoveShouldSetPanResponder: () => true,
			onPanResponderGrant: () => {
				if (disabled) return;

				setDragItems((prev) =>
					prev.map((item) =>
						item.id === itemId ? { ...item, isDragging: true } : item
					)
				);
			},
			onPanResponderMove: (evt, gestureState) => {
				if (disabled) return;

				const item = dragItems.find((item) => item.id === itemId);
				if (item) {
					item.pan.setValue({ x: gestureState.dx, y: gestureState.dy });
				}
			},
			onPanResponderRelease: (evt, gestureState) => {
				if (disabled) return;

				const item = dragItems.find((item) => item.id === itemId);
				if (!item) return;

				const dropX = evt.nativeEvent.pageX;
				const dropY = evt.nativeEvent.pageY;

				// Find which drop zone this item was dropped on
				const targetZone = dropZones.find(
					(zone) =>
						dropX >= zone.position.x &&
						dropX <= zone.position.x + zone.position.width &&
						dropY >= zone.position.y &&
						dropY <= zone.position.y + zone.position.height
				);

				if (targetZone && targetZone.acceptableItems.includes(itemId)) {
					// Valid drop
					setMatches((prev) => ({ ...prev, [targetZone.id]: itemId }));
					setDragItems((prev) =>
						prev.map((dragItem) =>
							dragItem.id === itemId
								? { ...dragItem, isDragging: false, isMatched: true }
								: dragItem
						)
					);

					// Reset position to drop zone
					Animated.spring(item.pan, {
						toValue: { x: 0, y: 0 },
						useNativeDriver: false,
					}).start();
				} else {
					// Invalid drop, return to original position
					Animated.spring(item.pan, {
						toValue: { x: 0, y: 0 },
						useNativeDriver: false,
					}).start();

					setDragItems((prev) =>
						prev.map((dragItem) =>
							dragItem.id === itemId
								? { ...dragItem, isDragging: false }
								: dragItem
						)
					);
				}
			},
		});
	};

	const handleSubmit = () => {
		const matchedItems = Object.keys(matches);

		if (matchedItems.length === 0 && !timeUp) {
			Alert.alert(
				"No Matches",
				"Please drag items to their matching targets before submitting."
			);
			return;
		}

		const startTime = Date.now();
		let correctCount = 0;
		const results: string[] = [];

		// Check each match
		dropZones.forEach((zone) => {
			const matchedItem = matches[zone.id];
			const isCorrect =
				matchedItem && zone.acceptableItems.includes(matchedItem);

			if (isCorrect) correctCount++;

			results.push(`${zone.id}:${matchedItem || "none"}`);
			// Update zone state
			setDropZones((prev) =>
				prev.map((z) =>
					z.id === zone.id ? { ...z, isCorrect: !!isCorrect } : z
				)
			);
		});

		// Update drag items state
		setDragItems((prev) =>
			prev.map((item) => {
				const matchedZone = Object.entries(matches).find(
					([_, itemId]) => itemId === item.id
				);
				if (matchedZone) {
					const zone = dropZones.find((z) => z.id === matchedZone[0]);
					const isCorrect = zone?.acceptableItems.includes(item.id) || false;
					return { ...item, isCorrect };
				}
				return item;
			})
		);

		const isAllCorrect = correctCount === dropZones.length;
		onAnswer(results, isAllCorrect, Date.now() - startTime);
	};

	const handleReset = () => {
		if (disabled) return;

		setMatches({});
		setDragItems((prev) =>
			prev.map((item) => ({
				...item,
				isMatched: false,
				isDragging: false,
				isCorrect: undefined,
			}))
		);
		setDropZones((prev) =>
			prev.map((zone) => ({
				...zone,
				isCorrect: undefined,
			}))
		);

		// Reset all animations
		dragItems.forEach((item) => {
			item.pan.setValue({ x: 0, y: 0 });
		});
	};
	const getDragItemStyle = (item: DragItem) => {
		const baseStyles: any[] = [styles.dragItem];

		if (item.isDragging) {
			baseStyles.push(styles.draggingItem);
		}

		if (item.isMatched) {
			baseStyles.push(styles.matchedItem);
		}

		if (isAnswered || showCorrectAnswer) {
			if (item.isCorrect === true) {
				baseStyles.push(styles.correctItem);
			} else if (item.isCorrect === false) {
				baseStyles.push(styles.incorrectItem);
			}
		}

		if (disabled) {
			baseStyles.push(styles.disabledItem);
		}

		return baseStyles;
	};

	const getDropZoneStyle = (zone: DropZone) => {
		const baseStyles: any[] = [styles.dropZone];

		if (matches[zone.id]) {
			baseStyles.push(styles.filledDropZone);
		}

		if (isAnswered || showCorrectAnswer) {
			if (zone.isCorrect === true) {
				baseStyles.push(styles.correctDropZone);
			} else if (zone.isCorrect === false) {
				baseStyles.push(styles.incorrectDropZone);
			}
		}

		return baseStyles;
	};

	const allItemsMatched =
		dragItems.filter((item) => !item.isMatched).length === 0;

	return (
		<View style={styles.container}>
			{/* Instructions */}
			<View style={styles.instructionsContainer}>
				<Text style={styles.instructionText}>
					Drag the items to their matching targets:
				</Text>
				<Text style={styles.questionText}>{question.question_text}</Text>
			</View>

			{/* Drop Zones */}
			<View style={styles.dropZonesContainer}>
				<Text style={styles.sectionTitle}>Drop Zones:</Text>
				{dropZones.map((zone) => (
					<View
						key={zone.id}
						style={getDropZoneStyle(zone)}
						onLayout={(event) => {
							const { x, y, width, height } = event.nativeEvent.layout;
							setDropZones((prev) =>
								prev.map((z) =>
									z.id === zone.id
										? { ...z, position: { x, y, width, height } }
										: z
								)
							);
						}}
					>
						<Text style={styles.dropZoneText}>{zone.content}</Text>
						{matches[zone.id] && (
							<View style={styles.droppedItem}>
								<Text style={styles.droppedItemText}>
									{
										dragItems.find((item) => item.id === matches[zone.id])
											?.content
									}
								</Text>
							</View>
						)}
					</View>
				))}
			</View>

			{/* Drag Items */}
			<View style={styles.dragItemsContainer}>
				<Text style={styles.sectionTitle}>Drag Items:</Text>
				<View style={styles.dragItemsGrid}>
					{dragItems
						.filter((item) => !item.isMatched)
						.map((item) => {
							const panResponder = createPanResponder(item.id);

							return (
								<Animated.View
									key={item.id}
									{...panResponder.panHandlers}
									style={[
										getDragItemStyle(item),
										{
											transform: item.pan.getTranslateTransform(),
										},
									]}
								>
									<Text style={styles.dragItemText}>{item.content}</Text>
								</Animated.View>
							);
						})}
				</View>
			</View>

			{/* Controls */}
			<View style={styles.controlsContainer}>
				{!isAnswered && (
					<>
						<TouchableOpacity
							style={[styles.resetButton, disabled && styles.disabledButton]}
							onPress={handleReset}
							disabled={disabled}
						>
							<Text style={styles.resetButtonText}>Reset</Text>
						</TouchableOpacity>

						{Object.keys(matches).length > 0 && (
							<TouchableOpacity
								style={[styles.submitButton, disabled && styles.disabledButton]}
								onPress={handleSubmit}
								disabled={disabled}
							>
								<Text style={styles.submitButtonText}>Submit</Text>
							</TouchableOpacity>
						)}
					</>
				)}
			</View>

			{/* Progress */}
			<View style={styles.progressContainer}>
				<Text style={styles.progressText}>
					{Object.keys(matches).length} / {dropZones.length} matched
				</Text>
			</View>

			{/* Time Up Indicator */}
			{timeUp && (
				<View style={styles.timeUpContainer}>
					<Text style={styles.timeUpText}>⏰ Time's up!</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	instructionsContainer: {
		marginBottom: theme.spacing.lg,
	},
	instructionText: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	questionText: {
		fontSize: 18,
		color: theme.colors.text,
		lineHeight: 26,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	dropZonesContainer: {
		marginBottom: theme.spacing.xl,
	},
	dropZone: {
		backgroundColor: theme.colors.surface,
		borderWidth: 2,
		borderColor: theme.colors.border,
		borderStyle: "dashed",
		borderRadius: 12,
		padding: theme.spacing.lg,
		marginBottom: theme.spacing.md,
		minHeight: 80,
		justifyContent: "center",
		alignItems: "center",
	},
	filledDropZone: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primary + "10",
		borderStyle: "solid",
	},
	correctDropZone: {
		borderColor: "#4CAF50",
		backgroundColor: "#4CAF50" + "15",
	},
	incorrectDropZone: {
		borderColor: "#F44336",
		backgroundColor: "#F44336" + "15",
	},
	dropZoneText: {
		fontSize: 16,
		fontWeight: "500",
		color: theme.colors.text,
		textAlign: "center",
	},
	droppedItem: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: 8,
		marginTop: theme.spacing.sm,
	},
	droppedItemText: {
		color: "white",
		fontWeight: "600",
	},
	dragItemsContainer: {
		marginBottom: theme.spacing.lg,
	},
	dragItemsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.md,
	},
	dragItem: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		borderRadius: 12,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
	},
	draggingItem: {
		elevation: 8,
		shadowOpacity: 0.3,
		opacity: 0.9,
	},
	matchedItem: {
		opacity: 0.3,
	},
	correctItem: {
		backgroundColor: "#4CAF50",
	},
	incorrectItem: {
		backgroundColor: "#F44336",
	},
	disabledItem: {
		opacity: 0.5,
	},
	dragItemText: {
		color: "white",
		fontWeight: "600",
		fontSize: 16,
	},
	controlsContainer: {
		flexDirection: "row",
		gap: theme.spacing.md,
		marginBottom: theme.spacing.lg,
	},
	resetButton: {
		backgroundColor: theme.colors.textSecondary,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		borderRadius: 8,
		flex: 1,
		alignItems: "center",
	},
	resetButtonText: {
		color: "white",
		fontWeight: "600",
	},
	submitButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		borderRadius: 8,
		flex: 2,
		alignItems: "center",
	},
	submitButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 16,
	},
	disabledButton: {
		opacity: 0.5,
	},
	progressContainer: {
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	progressText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	timeUpContainer: {
		backgroundColor: "#FF9800",
		padding: theme.spacing.md,
		borderRadius: 8,
		alignItems: "center",
	},
	timeUpText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
});
