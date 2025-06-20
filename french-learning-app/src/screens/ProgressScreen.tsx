import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { ProgressDashboard } from "../components/progress/ProgressDashboard";
import { useAuth } from "../contexts/AuthContext";
import { theme } from "../constants/theme";

interface ProgressScreenProps {
	navigation: any;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
	navigation,
}) => {
	const { user } = useAuth();

	if (!user) {
		return null; // or loading state
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<ProgressDashboard userId={user.id} />
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	content: {
		flex: 1,
	},
});
