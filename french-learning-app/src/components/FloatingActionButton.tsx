import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";

interface FloatingActionButtonProps {
	onPress: () => void;
	icon?: keyof typeof Ionicons.glyphMap;
	label?: string;
	style?: ViewStyle;
	backgroundColor?: string;
	size?: "small" | "medium" | "large";
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
	onPress,
	icon = "add",
	label,
	style,
	backgroundColor = theme.colors.primary,
	size = "large",
}) => {
	const getSize = () => {
		switch (size) {
			case "small":
				return { width: 48, height: 48, borderRadius: 24 };
			case "medium":
				return { width: 56, height: 56, borderRadius: 28 };
			case "large":
				return { width: 64, height: 64, borderRadius: 32 };
		}
	};

	const getIconSize = () => {
		switch (size) {
			case "small":
				return 20;
			case "medium":
				return 24;
			case "large":
				return 28;
		}
	};

	const sizeStyle = getSize();

	return (
		<TouchableOpacity
			style={[styles.fab, sizeStyle, { backgroundColor }, style]}
			onPress={onPress}
			activeOpacity={0.8}
		>
			<Ionicons name={icon} size={getIconSize()} color="white" />
			{label && <Text style={styles.label}>{label}</Text>}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	fab: {
		position: "absolute",
		bottom: 20,
		right: 20,
		justifyContent: "center",
		alignItems: "center",
		elevation: 8,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 6,
		zIndex: 1000,
	},
	label: {
		color: "white",
		fontSize: 10,
		fontWeight: "600",
		marginTop: 2,
	},
});
