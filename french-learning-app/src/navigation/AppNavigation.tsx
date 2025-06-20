import React, { useRef, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { EmailVerificationScreen } from "../screens/EmailVerificationScreen";
import { ResetPasswordScreen } from "../screens/ResetPasswordScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { AdminDashboardScreen } from "../screens/AdminDashboardScreen";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "../constants/theme";
import { deepLinkHandler } from "../utils/deepLinkHandler";

// Define navigation param list types
export type AuthStackParamList = {
	Login: undefined;
	Register: undefined;
	ForgotPassword: undefined;
	EmailVerification: undefined;
	ResetPassword: undefined;
};

export type AppStackParamList = {
	Home: undefined;
	Profile: undefined;
	AdminDashboard: undefined;
	// Add more screens as they are created
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();

const AuthNavigator: React.FC = () => {
	return (
		<AuthStack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<AuthStack.Screen name="Login" component={LoginScreen} />
			<AuthStack.Screen name="Register" component={RegisterScreen} />
			<AuthStack.Screen
				name="ForgotPassword"
				component={ForgotPasswordScreen}
			/>
			<AuthStack.Screen
				name="EmailVerification"
				component={EmailVerificationScreen}
			/>
			<AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
		</AuthStack.Navigator>
	);
};

const AppNavigator: React.FC = () => {
	return (
		<AppStack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<AppStack.Screen name="Home" component={HomeScreen} />
			<AppStack.Screen name="Profile" component={ProfileScreen} />
			<AppStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
		</AppStack.Navigator>
	);
};

const LoadingScreen: React.FC = () => {
	return (
		<View style={styles.loadingContainer}>
			<ActivityIndicator size="large" color={theme.colors.primary} />
		</View>
	);
};

export const AppNavigation: React.FC = () => {
	const { user, loading } = useAuth();
	const navigationRef = useRef<any>(null);

	useEffect(() => {
		if (navigationRef.current) {
			deepLinkHandler.setNavigationRef(navigationRef.current);
		}
	}, []);

	if (loading) {
		return <LoadingScreen />;
	}

	return (
		<NavigationContainer ref={navigationRef}>
			{user ? <AppNavigator /> : <AuthNavigator />}
		</NavigationContainer>
	);
};

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.background,
	},
});
