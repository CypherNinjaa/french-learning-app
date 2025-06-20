import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { AppNavigation } from "./src/navigation/AppNavigation";
import { deepLinkHandler } from "./src/utils/deepLinkHandler";

export default function App() {
	useEffect(() => {
		// Initialize deep link handling
		const subscription = deepLinkHandler.initialize();

		return () => {
			subscription?.remove();
		};
	}, []);

	return (
		<SafeAreaProvider>
			<ThemeProvider>
				<AuthProvider>
					<AppNavigation />
					<StatusBar style="auto" />
				</AuthProvider>
			</ThemeProvider>
		</SafeAreaProvider>
	);
}
