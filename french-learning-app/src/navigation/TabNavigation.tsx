// Tab Navigation for the main app screens
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { HomeScreen } from "../screens/HomeScreen";
import { BooksScreen } from "../screens/BooksScreen";

import { EnhancedPracticeScreen } from "../screens/EnhancedPracticeScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { VocabularyScreen } from "../screens/VocabularyScreen";
import { GrammarRulesScreen } from "../screens/GrammarRulesScreen";

import { useTheme } from "../contexts/ThemeContext";

const Tab = createBottomTabNavigator();

export const TabNavigation: React.FC = () => {
	const { theme: currentTheme } = useTheme();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarActiveTintColor: currentTheme.colors.primary,
				tabBarInactiveTintColor: currentTheme.colors.textSecondary,
				tabBarStyle: {
					backgroundColor: currentTheme.colors.surface,
					borderTopWidth: 0,
					height: 64,
					paddingBottom: 8,
				},
				tabBarIcon: ({ color, size }) => {
					let iconName: keyof typeof Ionicons.glyphMap = "home";
					if (route.name === "Home") iconName = "home";
					else if (route.name === "Books") iconName = "library";
					else if (route.name === "Practice") iconName = "rocket";
					else if (route.name === "Vocabulary") iconName = "book";

					else if (route.name === "Grammar") iconName = "list";

					else if (route.name === "Profile") iconName = "person";
					return <Ionicons name={iconName} size={size} color={color} />;
				},
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Books" component={BooksScreen} />
			<Tab.Screen name="Vocabulary" component={VocabularyScreen} />

			<Tab.Screen name="Grammar" component={GrammarRulesScreen} />
			<Tab.Screen name="Practice" component={EnhancedPracticeScreen} />

			<Tab.Screen name="Profile" component={ProfileScreen} />
		</Tab.Navigator>
	);
};
