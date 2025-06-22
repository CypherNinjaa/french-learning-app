// Stage 7.1: Modern UI Implementation - Theme Context
// Dark/Light theme support with animations and modern design system

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme as lightTheme, darkTheme, Theme } from "../constants/theme";

interface ThemeContextValue {
	theme: Theme;
	themeMode: "light" | "dark" | "system";
	isDark: boolean;
	setTheme: (mode: "light" | "dark" | "system") => void;
	systemColorScheme: ColorSchemeName;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
}

const THEME_STORAGE_KEY = "@french_app_theme_mode";

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(
		"system"
	);
	const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
		Appearance.getColorScheme()
	);

	// Determine current theme
	const isDark =
		themeMode === "dark" ||
		(themeMode === "system" && systemColorScheme === "dark");
	const currentTheme = isDark ? darkTheme : lightTheme;

	// Load saved theme preference
	useEffect(() => {
		loadThemePreference();
	}, []);

	// Listen to system theme changes
	useEffect(() => {
		const subscription = Appearance.addChangeListener(({ colorScheme }) => {
			setSystemColorScheme(colorScheme);
		});

		return () => subscription?.remove();
	}, []);

	const loadThemePreference = async () => {
		try {
			const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
			if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
				setThemeMode(savedTheme as "light" | "dark" | "system");
			}
		} catch (error) {
			console.warn("Failed to load theme preference:", error);
		}
	};

	const saveThemePreference = async (mode: "light" | "dark" | "system") => {
		try {
			await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
		} catch (error) {
			console.warn("Failed to save theme preference:", error);
		}
	};

	const setTheme = (mode: "light" | "dark" | "system") => {
		setThemeMode(mode);
		saveThemePreference(mode);
	};
	const value: ThemeContextValue = {
		theme: currentTheme,
		themeMode,
		isDark,
		setTheme,
		systemColorScheme,
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
};

export const useTheme = (): ThemeContextValue => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
