// Stage 7.1: Modern UI Components Library
// Reusable components with animations and modern design

import React, { useRef, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Animated,
	ActivityIndicator,
	ViewStyle,
	TextStyle,
	TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { Theme } from "../constants/theme";

// Button Component with animations and variants
interface ModernButtonProps {
	title: string;
	onPress: () => void;
	variant?:
		| "primary"
		| "secondary"
		| "outline"
		| "ghost"
		| "danger"
		| "success";
	size?: "small" | "medium" | "large";
	disabled?: boolean;
	loading?: boolean;
	icon?: keyof typeof Ionicons.glyphMap;
	iconPosition?: "left" | "right";
	style?: ViewStyle;
	testID?: string;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
	title,
	onPress,
	variant = "primary",
	size = "medium",
	disabled = false,
	loading = false,
	icon,
	iconPosition = "left",
	style,
	testID,
}) => {
	const { theme } = useTheme();
	const scaleAnim = useRef(new Animated.Value(1)).current;
	const opacityAnim = useRef(new Animated.Value(1)).current;
	const handlePressIn = () => {
		Animated.parallel([
			Animated.spring(scaleAnim, {
				toValue: 0.95,
				useNativeDriver: true,
			}),
			Animated.timing(opacityAnim, {
				toValue: 0.8,
				duration: theme.animation.duration.fast,
				useNativeDriver: true,
			}),
		]).start();
	};

	const handlePressOut = () => {
		Animated.parallel([
			Animated.spring(scaleAnim, {
				toValue: 1,
				useNativeDriver: true,
			}),
			Animated.timing(opacityAnim, {
				toValue: 1,
				duration: theme.animation.duration.fast,
				useNativeDriver: true,
			}),
		]).start();
	};

	const getButtonStyle = (): ViewStyle => {
		const baseStyle: ViewStyle = {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			borderRadius: theme.borderRadius.medium,
			...theme.shadows.sm,
		};

		// Size variations
		const sizeStyles = {
			small: {
				paddingVertical: theme.spacing.sm,
				paddingHorizontal: theme.spacing.md,
				minHeight: 36,
			},
			medium: {
				paddingVertical: theme.spacing.md,
				paddingHorizontal: theme.spacing.lg,
				minHeight: 44,
			},
			large: {
				paddingVertical: theme.spacing.lg,
				paddingHorizontal: theme.spacing.xl,
				minHeight: 52,
			},
		};

		// Variant styles
		const variantStyles = {
			primary: {
				backgroundColor: theme.colors.primary,
			},
			secondary: {
				backgroundColor: theme.colors.secondary,
			},
			outline: {
				backgroundColor: "transparent",
				borderWidth: 2,
				borderColor: theme.colors.primary,
			},
			ghost: {
				backgroundColor: "transparent",
			},
			danger: {
				backgroundColor: theme.colors.error,
			},
			success: {
				backgroundColor: theme.colors.success,
			},
		};

		return {
			...baseStyle,
			...sizeStyles[size],
			...variantStyles[variant],
			opacity: disabled ? 0.5 : 1,
		};
	};

	const getTextStyle = (): TextStyle => {
		const baseStyle: TextStyle = {
			fontSize: theme.typography.fontSize.md,
			fontWeight: "600",
			textAlign: "center",
		};

		const sizeStyles = {
			small: { fontSize: theme.typography.fontSize.sm },
			medium: { fontSize: theme.typography.fontSize.md },
			large: { fontSize: theme.typography.fontSize.lg },
		};

		const variantStyles = {
			primary: { color: theme.colors.textOnPrimary },
			secondary: { color: theme.colors.textOnSecondary },
			outline: { color: theme.colors.primary },
			ghost: { color: theme.colors.primary },
			danger: { color: theme.colors.textOnPrimary },
			success: { color: theme.colors.textOnPrimary },
		};

		return {
			...baseStyle,
			...sizeStyles[size],
			...variantStyles[variant],
		};
	};

	const iconSize = size === "small" ? 16 : size === "large" ? 24 : 20;
	const iconColor =
		variant === "outline" || variant === "ghost"
			? theme.colors.primary
			: theme.colors.textOnPrimary;

	return (
		<Animated.View
			style={[
				{ transform: [{ scale: scaleAnim }], opacity: opacityAnim },
				style,
			]}
		>
			<TouchableOpacity
				style={getButtonStyle()}
				onPress={onPress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				disabled={disabled || loading}
				testID={testID}
				activeOpacity={1}
			>
				{loading ? (
					<ActivityIndicator
						size="small"
						color={iconColor}
						style={{ marginRight: title ? theme.spacing.sm : 0 }}
					/>
				) : (
					icon &&
					iconPosition === "left" && (
						<Ionicons
							name={icon}
							size={iconSize}
							color={iconColor}
							style={{ marginRight: theme.spacing.sm }}
						/>
					)
				)}

				{title && <Text style={getTextStyle()}>{title}</Text>}

				{!loading && icon && iconPosition === "right" && (
					<Ionicons
						name={icon}
						size={iconSize}
						color={iconColor}
						style={{ marginLeft: theme.spacing.sm }}
					/>
				)}
			</TouchableOpacity>
		</Animated.View>
	);
};

// Modern Card Component
interface ModernCardProps {
	children: React.ReactNode;
	style?: ViewStyle;
	padding?: keyof Theme["spacing"];
	shadow?: keyof Theme["shadows"];
	borderRadius?: keyof Theme["borderRadius"];
	onPress?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
	children,
	style,
	padding = "lg",
	shadow = "md",
	borderRadius = "medium",
	onPress,
}) => {
	const { theme } = useTheme();
	const scaleAnim = useRef(new Animated.Value(1)).current;

	const handlePressIn = () => {
		if (onPress) {
			Animated.spring(scaleAnim, {
				toValue: 0.98,
				useNativeDriver: true,
			}).start();
		}
	};

	const handlePressOut = () => {
		if (onPress) {
			Animated.spring(scaleAnim, {
				toValue: 1,
				useNativeDriver: true,
			}).start();
		}
	};

	const cardStyle: ViewStyle = {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing[padding],
		borderRadius: theme.borderRadius[borderRadius],
		...theme.shadows[shadow],
	};

	const CardContent = () => <View style={[cardStyle, style]}>{children}</View>;

	if (onPress) {
		return (
			<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
				<TouchableOpacity
					onPress={onPress}
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					activeOpacity={1}
				>
					<CardContent />
				</TouchableOpacity>
			</Animated.View>
		);
	}

	return <CardContent />;
};

// Modern Input Component
interface ModernInputProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	label?: string;
	error?: string;
	icon?: keyof typeof Ionicons.glyphMap;
	secureTextEntry?: boolean;
	multiline?: boolean;
	numberOfLines?: number;
	style?: ViewStyle;
	disabled?: boolean;
}

export const ModernInput: React.FC<ModernInputProps> = ({
	value,
	onChangeText,
	placeholder,
	label,
	error,
	icon,
	secureTextEntry,
	multiline,
	numberOfLines,
	style,
	disabled,
}) => {
	const { theme } = useTheme();
	const [isFocused, setIsFocused] = React.useState(false);
	const animatedValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: isFocused || value ? 1 : 0,
			duration: theme.animation.duration.normal,
			useNativeDriver: false,
		}).start();
	}, [isFocused, value]);

	const borderColor = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [theme.colors.border, theme.colors.primary],
	});

	const labelScale = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [1, 0.8],
	});

	const labelTranslateY = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [0, -12],
	});

	return (
		<View style={[{ marginBottom: theme.spacing.md }, style]}>
			{label && (
				<Animated.Text
					style={[
						{
							position: "absolute",
							left: icon ? 40 : theme.spacing.md,
							top: theme.spacing.md,
							fontSize: theme.typography.fontSize.md,
							color: isFocused
								? theme.colors.primary
								: theme.colors.textSecondary,
							backgroundColor: theme.colors.surface,
							paddingHorizontal: theme.spacing.xs,
							zIndex: 1,
							transform: [
								{ scale: labelScale },
								{ translateY: labelTranslateY },
							],
						},
					]}
				>
					{label}
				</Animated.Text>
			)}

			<View style={{ position: "relative" }}>
				{icon && (
					<Ionicons
						name={icon}
						size={20}
						color={
							isFocused ? theme.colors.primary : theme.colors.textSecondary
						}
						style={{
							position: "absolute",
							left: theme.spacing.md,
							top: theme.spacing.md + 2,
							zIndex: 2,
						}}
					/>
				)}

				<Animated.View
					style={{
						borderWidth: 2,
						borderColor: error ? theme.colors.error : borderColor,
						borderRadius: theme.borderRadius.medium,
						backgroundColor: theme.colors.surface,
					}}
				>
					<TextInput
						value={value}
						onChangeText={onChangeText}
						placeholder={placeholder}
						placeholderTextColor={theme.colors.textSecondary}
						secureTextEntry={secureTextEntry}
						multiline={multiline}
						numberOfLines={numberOfLines}
						editable={!disabled}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						style={{
							paddingVertical: theme.spacing.md,
							paddingHorizontal: icon ? 48 : theme.spacing.md,
							fontSize: theme.typography.fontSize.md,
							color: theme.colors.text,
							minHeight: multiline ? 100 : 44,
							textAlignVertical: multiline ? "top" : "center",
						}}
					/>
				</Animated.View>
			</View>

			{error && (
				<Text
					style={{
						marginTop: theme.spacing.xs,
						fontSize: theme.typography.fontSize.sm,
						color: theme.colors.error,
					}}
				>
					{error}
				</Text>
			)}
		</View>
	);
};

// Progress Bar Component with animation
interface ModernProgressBarProps {
	progress: number; // 0-1
	height?: number;
	color?: string;
	backgroundColor?: string;
	animated?: boolean;
	style?: ViewStyle;
}

export const ModernProgressBar: React.FC<ModernProgressBarProps> = ({
	progress,
	height = 8,
	color,
	backgroundColor,
	animated = true,
	style,
}) => {
	const { theme } = useTheme();
	const animatedWidth = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (animated) {
			Animated.timing(animatedWidth, {
				toValue: progress,
				duration: theme.animation.duration.normal,
				useNativeDriver: false,
			}).start();
		} else {
			animatedWidth.setValue(progress);
		}
	}, [progress, animated]);

	const progressColor = color || theme.colors.primary;
	const bgColor = backgroundColor || theme.colors.surfaceSecondary;

	return (
		<View
			style={[
				{
					height,
					backgroundColor: bgColor,
					borderRadius: height / 2,
					overflow: "hidden",
				},
				style,
			]}
		>
			<Animated.View
				style={{
					height: "100%",
					backgroundColor: progressColor,
					borderRadius: height / 2,
					width: animatedWidth.interpolate({
						inputRange: [0, 1],
						outputRange: ["0%", "100%"],
					}),
				}}
			/>
		</View>
	);
};

// Theme Switch Button Component
export const ThemeSwitchButton: React.FC<{ size?: number }> = () => null;
