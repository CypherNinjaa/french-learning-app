import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { theme } from "../constants/theme";

interface HomeScreenProps {
	navigation: any; // Will be properly typed with navigation types later
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
	const { user, signOut, isAdmin } = useAuth();
	const currentTheme = theme;

	const avatar = user?.avatarUrl ? (
		<Image source={{ uri: user.avatarUrl }} style={styles.avatarLarge} />
	) : (
		<View style={styles.avatarLargePlaceholder}>
			<Text style={styles.avatarInitialsLarge}>
				{user?.username?.[0]?.toUpperCase() || "👤"}
			</Text>
		</View>
	);

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: currentTheme.colors.background }}
		>
			{/* Banner Header */}
			<View style={styles.banner}>
				{avatar}
				<View style={{ flex: 1 }}>
					<Text style={styles.greetingText}>
						Bonjour{user?.username ? ", " : "!"}
						{user?.username?.split(" ")[0] ||
							user?.email?.split("@")[0] ||
							"!"}{" "}
						👋
					</Text>
					<Text style={styles.greetingSubText}>
						Ready to learn something new today?
					</Text>
				</View>
			</View>

			{/* Main Actions */}
			<View style={styles.mainActionsRow}>
				<TouchableOpacity
					style={[
						styles.mainActionButton,
						{ backgroundColor: currentTheme.colors.primary },
					]}
					onPress={() => navigation.navigate("Learning")}
				>
					<Ionicons name="play-circle" size={28} color="#fff" />
					<Text style={styles.mainActionText}>Start Learning</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.mainActionButton,
						{ backgroundColor: currentTheme.colors.conversation },
					]}
					onPress={() => navigation.navigate("ConversationalAI")}
				>
					<Ionicons name="chatbubbles" size={28} color="#fff" />
					<Text style={styles.mainActionText}>AI Chat</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.mainActionButton,
						{ backgroundColor: currentTheme.colors.success },
					]}
					onPress={() => navigation.navigate("Practice")}
				>
					<Ionicons name="rocket" size={28} color="#fff" />
					<Text style={styles.mainActionText}>Practice</Text>
				</TouchableOpacity>
			</View>

			{/* Stats Pills */}
			<View style={styles.statsPillsRow}>
				<View
					style={[
						styles.statPill,
						{ backgroundColor: `${currentTheme.colors.primary}15` },
					]}
				>
					<Ionicons name="star" size={16} color={currentTheme.colors.primary} />
					<Text
						style={[
							styles.statPillText,
							{ color: currentTheme.colors.primary },
						]}
					>
						{user?.points || 0} pts
					</Text>
				</View>
				<View
					style={[
						styles.statPill,
						{ backgroundColor: `${currentTheme.colors.success}15` },
					]}
				>
					<Ionicons
						name="flame"
						size={16}
						color={currentTheme.colors.success}
					/>
					<Text
						style={[
							styles.statPillText,
							{ color: currentTheme.colors.success },
						]}
					>
						{user?.streakDays || 0} day streak
					</Text>
				</View>
				<View
					style={[
						styles.statPill,
						{ backgroundColor: `${currentTheme.colors.secondary}15` },
					]}
				>
					<Ionicons
						name="school"
						size={16}
						color={currentTheme.colors.secondary}
					/>
					<Text
						style={[
							styles.statPillText,
							{ color: currentTheme.colors.secondary },
						]}
					>
						{user?.level
							? user.level.charAt(0).toUpperCase() + user.level.slice(1)
							: "-"}
					</Text>
				</View>
			</View>

			{/* Minimal Quick Actions */}
			<View style={styles.quickRow}>
				<TouchableOpacity
					style={styles.quickAction}
					onPress={() => navigation.navigate("Profile")}
				>
					<Ionicons
						name="person"
						size={20}
						color={currentTheme.colors.primary}
					/>
					<Text style={styles.quickActionText}>Profile</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.quickAction}
					onPress={() => navigation.navigate("Progress")}
				>
					<Ionicons
						name="stats-chart"
						size={20}
						color={currentTheme.colors.success}
					/>
					<Text style={styles.quickActionText}>Progress</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.quickAction}
					onPress={() => navigation.navigate("ThemeSettings")}
				>
					<Ionicons
						name="settings"
						size={20}
						color={currentTheme.colors.warning}
					/>
					<Text style={styles.quickActionText}>Settings</Text>
				</TouchableOpacity>
			</View>
			{isAdmin() && (
				<View style={{ alignItems: "center", marginBottom: 18 }}>
					<TouchableOpacity
						style={[
							styles.mainActionButton,
							{ backgroundColor: currentTheme.colors.warning, width: "90%" },
						]}
						onPress={() => {
							if (isAdmin()) {
								navigation.navigate("AdminDashboard");
							} else {
								alert("Access denied: Admins only.");
							}
						}}
					>
						<Ionicons name="shield-checkmark" size={24} color="#fff" />
						<Text style={styles.mainActionText}>Admin Dashboard</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* Sign Out
			<View style={styles.signOutContainer}>
				<TouchableOpacity
					style={[
						styles.signOutButton,
						{ borderColor: currentTheme.colors.error },
					]}
					onPress={signOut}
				>
					<Ionicons
						name="log-out"
						size={20}
						color={currentTheme.colors.error}
					/>
					<Text
						style={{
							color: currentTheme.colors.error,
							fontWeight: "700",
							marginLeft: 8,
						}}
					>
						Sign Out
					</Text>
				</TouchableOpacity>
			</View> */}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	banner: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 32,
		paddingBottom: 18,
		backgroundColor: "#f3f6ff",
		borderBottomLeftRadius: 32,
		borderBottomRightRadius: 32,
		marginBottom: 10,
	},
	avatarLarge: {
		width: 64,
		height: 64,
		borderRadius: 32,
		marginRight: 18,
		backgroundColor: "#e0e0e0",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarLargePlaceholder: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: "#e0e0e0",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 18,
	},
	avatarInitialsLarge: {
		fontSize: 28,
		fontWeight: "700",
		color: "#888",
	},
	greetingText: {
		fontSize: 22,
		fontWeight: "700",
		marginBottom: 2,
	},
	greetingSubText: {
		fontSize: 14,
		color: "#888",
		marginBottom: 2,
	},
	mainActionsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginHorizontal: 18,
		marginBottom: 18,
	},
	mainActionButton: {
		flex: 1,
		marginHorizontal: 6,
		borderRadius: 18,
		paddingVertical: 22,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 2,
		elevation: 1,
	},
	mainActionText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 15,
		marginTop: 8,
	},
	statsPillsRow: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 18,
		gap: 10,
	},
	statPill: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 7,
		marginHorizontal: 4,
	},
	statPillText: {
		fontSize: 13,
		fontWeight: "600",
		marginLeft: 6,
	},
	quickRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 18,
	},
	quickAction: {
		alignItems: "center",
		padding: 10,
	},
	quickActionText: {
		fontSize: 12,
		fontWeight: "500",
		marginTop: 4,
		color: "#444",
	},
	signOutContainer: {
		marginTop: 20,
		marginBottom: 32,
	},
	signOutButton: {
		borderWidth: 1,
	},
});
