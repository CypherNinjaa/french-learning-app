import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Alert,
	ScrollView,
	Image,
	ActivityIndicator,
	Dimensions,
	Modal,
	Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { MediaTypeOptions } from "expo-image-picker";
import { useAuth } from "../contexts/AuthContext";
import { SupabaseService } from "../services/supabaseService";
import { theme } from "../constants/theme";
import { User } from "../types";
import { developerInfo } from "../config/developerInfo";

const { width } = Dimensions.get("window");

export const ProfileScreen = ({ navigation }: any) => {
	const { user, setUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [editing, setEditing] = useState(false);
	const [showGoalsDetail, setShowGoalsDetail] = useState(false);
	const [uploadingAvatar, setUploadingAvatar] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [formData, setFormData] = useState({
		username: user?.username || "",
		email: user?.email || "",
		level: user?.level || "beginner",
	});
	const achievements = [
		{
			id: 1,
			title: "First Steps",
			description: "Complete your first lesson",
			unlocked: true,
			icon: "🎯",
		},
		{
			id: 2,
			title: "Streak Master",
			description: "Maintain a 7-day streak",
			unlocked: (user?.streakDays || 0) >= 7,
			icon: "🔥",
		},
		{
			id: 3,
			title: "Point Collector",
			description: "Earn 500 points",
			unlocked: (user?.points || 0) >= 500,
			icon: "⭐",
		},
		{
			id: 4,
			title: "Vocabulary Pro",
			description: "Learn 100 words",
			unlocked: false,
			icon: "📚",
		},
		{
			id: 5,
			title: "Grammar Guru",
			description: "Master grammar basics",
			unlocked: false,
			icon: "✍️",
		},
		{
			id: 6,
			title: "Conversation King",
			description: "Complete 20 conversations",
			unlocked: false,
			icon: "💬",
		},
	];

	// Helper function to open external links
	const openLink = async (url: string) => {
		try {
			const supported = await Linking.canOpenURL(url);
			if (supported) {
				await Linking.openURL(url);
			} else {
				Alert.alert("Error", `Cannot open this link: ${url}`);
			}
		} catch (error) {
			Alert.alert("Error", "An error occurred while opening the link");
		}
	};

	// Calculate dynamic learning progress
	const calculateProgress = () => {
		const totalPoints = user?.points || 0;
		const streakDays = user?.streakDays || 0;
		const timeSpent = user?.totalTimeSpent ?? Math.floor(totalPoints / 2);

		// Overall progress calculation (0-100%)
		// Based on multiple factors: points, streak, time
		const pointsProgress = Math.min((totalPoints / 1000) * 100, 100); // Max 1000 points = 100%
		const streakProgress = Math.min((streakDays / 30) * 100, 100); // Max 30 days = 100%
		const timeProgress = Math.min((timeSpent / 300) * 100, 100); // Max 300 minutes = 100%

		const overallProgress =
			(pointsProgress + streakProgress + timeProgress) / 3;

		// Weekly goals (5 different goals) - adaptive based on user level
		const isBeginnerGoals = totalPoints < 100;

		const weeklyGoals = isBeginnerGoals
			? [
					{ name: "First Login", completed: true, target: "Welcome!" },
					{
						name: "Earn Points",
						completed: totalPoints >= 10,
						target: "Earn 10 points",
					},
					{
						name: "Start Streak",
						completed: streakDays >= 1,
						target: "1-day streak",
					},
					{
						name: "Keep Learning",
						completed: totalPoints >= 25,
						target: "Reach 25 points",
					},
					{
						name: "Build Habit",
						completed: streakDays >= 2,
						target: "2-day streak",
					},
			  ]
			: [
					{
						name: "Daily Login",
						completed: streakDays >= 1,
						target: "Login daily",
					},
					{
						name: "Points Goal",
						completed: totalPoints >= 50,
						target: "Earn 50+ points",
					},
					{
						name: "Learning Streak",
						completed: streakDays >= 3,
						target: "3-day streak",
					},
					{
						name: "Practice Time",
						completed: timeSpent >= 30,
						target: "30+ minutes practice",
					},
					{
						name: "Time Investment",
						completed: timeSpent >= 60,
						target: "60+ minutes practice",
					},
			  ];

		const completedGoals = weeklyGoals.filter((goal) => goal.completed).length;
		const weeklyProgress = (completedGoals / weeklyGoals.length) * 100;

		return {
			overall: Math.round(overallProgress),
			weekly: Math.round(weeklyProgress),
			weeklyGoals: completedGoals,
			totalGoals: weeklyGoals.length,
			goals: weeklyGoals,
			timeSpent,
			isBeginnerMode: isBeginnerGoals,
		};
	};

	const progress = calculateProgress();
	const handlePasswordChange = async () => {
		if (!passwordData.newPassword || !passwordData.confirmPassword) {
			Alert.alert("Error", "Please fill in all password fields");
			return;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			Alert.alert("Error", "New passwords don't match");
			return;
		}

		if (passwordData.newPassword.length < 6) {
			Alert.alert("Error", "Password must be at least 6 characters long");
			return;
		}
		setPasswordLoading(true);

		try {
			// Increase timeout to 30 seconds for password updates
			const timeoutPromise = new Promise(
				(_, reject) =>
					setTimeout(() => reject(new Error("Request timeout")), 30000) // 30 second timeout
			);

			const result: any = await Promise.race([
				SupabaseService.updatePassword(passwordData.newPassword),
				timeoutPromise,
			]);

			if (result && result.success) {
				Alert.alert("Success", "Password updated successfully!");
				setShowPasswordModal(false);
				setPasswordData({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
			} else {
				Alert.alert("Error", result?.error || "Failed to update password");
			}
		} catch (error: any) {
			console.error("Password update error:", error);
			if (error?.message === "Request timeout") {
				// Even on timeout, the password might have been updated
				Alert.alert(
					"Password Update",
					"The password update is taking longer than expected. The password may have been updated successfully. Please try logging in with your new password.",
					[
						{
							text: "OK",
							onPress: () => {
								setShowPasswordModal(false);
								setPasswordData({
									currentPassword: "",
									newPassword: "",
									confirmPassword: "",
								});
							},
						},
					]
				);
			} else {
				Alert.alert("Error", "Something went wrong. Please try again.");
			}
		} finally {
			// Always reset loading state to ensure UI is functional
			setPasswordLoading(false);
		}
	};
	const handleSave = async () => {
		if (!user) return;

		setLoading(true);
		try {
			// Add timeout for profile update (30 seconds)
			const timeoutPromise = new Promise(
				(_, reject) =>
					setTimeout(() => reject(new Error("Request timeout")), 30000) // 30 second timeout
			);
			const result: any = await Promise.race([
				SupabaseService.updateUserProfile(user.id, {
					username: formData.username,
					level: formData.level,
				}),
				timeoutPromise,
			]);

			if (result && result.success) {
				const updatedUser: User = {
					...user,
					username: formData.username,
					level: formData.level as "beginner" | "intermediate" | "advanced",
				};
				setUser(updatedUser);
				setEditing(false);
				Alert.alert("Success", "Profile updated successfully!");
			} else {
				Alert.alert("Error", result?.error || "Failed to update profile");
			}
		} catch (error: any) {
			console.error("Profile update error:", error);
			if (error?.message === "Request timeout") {
				// Even on timeout, the profile might have been updated
				Alert.alert(
					"Profile Update",
					"The profile update is taking longer than expected. The changes may have been saved successfully. You can use the refresh button to check for updates.",
					[
						{
							text: "Refresh Now",
							onPress: async () => {
								setEditing(false);
								await refreshProfile();
							},
						},
						{
							text: "OK",
							onPress: () => {
								// Optimistically update the UI even on timeout
								const updatedUser: User = {
									...user,
									username: formData.username,
									level: formData.level as
										| "beginner"
										| "intermediate"
										| "advanced",
								};
								setUser(updatedUser);
								setEditing(false);
							},
						},
					]
				);
			} else {
				Alert.alert("Error", "Something went wrong. Please try again.");
			}
		} finally {
			// Always reset loading state
			setLoading(false);
		}
	};

	const handleSignOut = async () => {
		Alert.alert("Sign Out", "Are you sure you want to sign out?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Sign Out",
				style: "destructive",
				onPress: async () => {
					const result = await SupabaseService.signOut();
					if (!result.success) {
						Alert.alert("Error", "Failed to sign out");
					}
				},
			},
		]);
	};

	const handleAvatarPress = () => {
		if (!user) return;
		Alert.alert("Change Avatar", "Choose an option", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Take Photo",
				onPress: () => pickImage(MediaTypeOptions.Images, true),
			},
			{
				text: "Choose from Gallery",
				onPress: () => pickImage(MediaTypeOptions.Images, false),
			},
			...(user.avatarUrl
				? [
						{
							text: "Remove Avatar",
							style: "destructive" as const,
							onPress: handleRemoveAvatar,
						},
				  ]
				: []),
		]);
	};
	const pickImage = async (
		mediaTypes: MediaTypeOptions,
		useCamera: boolean
	) => {
		try {
			if (useCamera) {
				const { status } = await ImagePicker.requestCameraPermissionsAsync();
				if (status !== "granted") {
					Alert.alert(
						"Permission needed",
						"Camera permission is required to take photos."
					);
					return;
				}

				const cameraResult = await ImagePicker.launchCameraAsync({
					mediaTypes,
					allowsEditing: true,
					aspect: [1, 1],
					quality: 0.8,
				});

				if (!cameraResult.canceled && cameraResult.assets[0]) {
					console.log("Camera image picked:", cameraResult.assets[0].uri);
					await uploadAvatar(cameraResult.assets[0].uri);
				}
			} else {
				const { status } =
					await ImagePicker.requestMediaLibraryPermissionsAsync();
				if (status !== "granted") {
					Alert.alert(
						"Permission needed",
						"Gallery permission is required to select photos."
					);
					return;
				}

				const result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes,
					allowsEditing: true,
					aspect: [1, 1],
					quality: 0.8,
				});

				if (!result.canceled && result.assets[0]) {
					console.log("Gallery image picked:", result.assets[0].uri);
					await uploadAvatar(result.assets[0].uri);
				}
			}
		} catch (error) {
			console.error("Error picking image:", error);
			Alert.alert("Error", "Failed to pick image. Please try again.");
		}
	};
	const uploadAvatar = async (imageUri: string) => {
		if (!user) return;

		setUploadingAvatar(true);
		try {
			console.log("Starting avatar upload for URI:", imageUri);
			const result = await SupabaseService.uploadAvatar(user.id, imageUri);

			if (result.success && result.data) {
				const updatedUser: User = {
					...user,
					avatarUrl: result.data,
				};
				setUser(updatedUser);
				Alert.alert("Success", "Avatar updated successfully!");
			} else {
				console.error("Avatar upload failed:", result.error);
				Alert.alert(
					"Upload Failed",
					result.error ||
						"Failed to upload avatar. Please check your internet connection and try again."
				);
			}
		} catch (error) {
			console.error("Error uploading avatar:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			Alert.alert(
				"Upload Error",
				`Failed to upload avatar: ${errorMessage}. Please check your internet connection and try again.`
			);
		} finally {
			setUploadingAvatar(false);
		}
	};

	const handleRemoveAvatar = async () => {
		if (!user || !user.avatarUrl) return;

		Alert.alert(
			"Remove Avatar",
			"Are you sure you want to remove your profile picture?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Remove",
					style: "destructive",
					onPress: async () => {
						setUploadingAvatar(true);
						try {
							const result = await SupabaseService.deleteAvatar(
								user.id,
								user.avatarUrl!
							);

							if (result.success) {
								const updatedUser: User = {
									...user,
									avatarUrl: undefined,
								};
								setUser(updatedUser);
								Alert.alert("Success", "Avatar removed successfully!");
							} else {
								Alert.alert("Error", result.error || "Failed to remove avatar");
							}
						} catch (error) {
							console.error("Error removing avatar:", error);
							Alert.alert(
								"Error",
								"Failed to remove avatar. Please try again."
							);
						} finally {
							setUploadingAvatar(false);
						}
					},
				},
			]
		);
	};
	const refreshProfile = async () => {
		console.log("Refresh profile button pressed");
		if (!user) {
			console.log("No user found, aborting refresh");
			return;
		}

		setRefreshing(true);
		try {
			console.log("Fetching user profile for ID:", user.id);
			// Fetch updated user profile from Supabase
			const result = await SupabaseService.getUserProfile(user.id);
			console.log("Profile fetch result:", result);

			if (result.success && result.data) {
				const updatedUser: User = {
					...user,
					...result.data,
					level:
						(result.data.level as "beginner" | "intermediate" | "advanced") ||
						"beginner",
				};
				setUser(updatedUser);
				setFormData({
					username: updatedUser.username || "",
					email: updatedUser.email || "",
					level: updatedUser.level || "beginner",
				});
				Alert.alert("Success", "Profile refreshed successfully!");
			} else {
				console.log("Failed to fetch profile:", result.error);
				Alert.alert("Error", "Failed to refresh profile. Please try again.");
			}
		} catch (error) {
			console.error("Error refreshing profile:", error);
			Alert.alert("Error", "Failed to refresh profile. Please try again.");
		} finally {
			setRefreshing(false);
		}
	};

	if (!user) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>Please log in to view your profile</Text>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Modern Header */}
			<View style={styles.header}>
				<View style={styles.headerGradient}>
					<TouchableOpacity
						onPress={handleAvatarPress}
						disabled={uploadingAvatar}
						style={styles.avatarContainer}
					>
						<View style={styles.avatar}>
							{user.avatarUrl ? (
								<Image
									source={{ uri: user.avatarUrl }}
									style={styles.avatarImage}
								/>
							) : (
								<Text style={styles.avatarText}>
									{user.username?.charAt(0).toUpperCase() ||
										user.email?.charAt(0).toUpperCase() ||
										"?"}
								</Text>
							)}
							{uploadingAvatar && (
								<View style={styles.avatarLoadingOverlay}>
									<ActivityIndicator size="large" color="#fff" />
								</View>
							)}
						</View>
						<View style={styles.editAvatarBadge}>
							<Ionicons name="camera" size={12} color="#fff" />
						</View>
					</TouchableOpacity>

					<Text style={styles.username}>{user.username || "User"}</Text>
					<Text style={styles.email}>{user.email}</Text>
					<Text style={styles.memberSince}>
						Member since {new Date(user.createdAt).toLocaleDateString()}
					</Text>
				</View>
			</View>
			{/* Stats Cards */}
			<View style={styles.statsContainer}>
				<View style={styles.statCard}>
					<View style={[styles.statContent, { backgroundColor: "#667eea" }]}>
						<Ionicons name="star" size={20} color="#fff" />
						<Text style={styles.statNumber}>{user.points || 0}</Text>
						<Text style={styles.statLabel}>Points</Text>
					</View>
				</View>

				<View style={styles.statCard}>
					<View style={[styles.statContent, { backgroundColor: "#f5576c" }]}>
						<Ionicons name="flame" size={20} color="#fff" />
						<Text style={styles.statNumber}>{user.streakDays || 0}</Text>
						<Text style={styles.statLabel}>Streak</Text>
					</View>
				</View>

				<View style={styles.statCard}>
					<View style={[styles.statContent, { backgroundColor: "#4facfe" }]}>
						<Ionicons name="school" size={20} color="#fff" />
						<Text style={styles.statLevel}>
							{user.level?.charAt(0).toUpperCase() + user.level?.slice(1) ||
								"Beginner"}
						</Text>
						<Text style={styles.statLabel}>Level</Text>
					</View>
				</View>
			</View>
			{/* Progress Section */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Ionicons name="trending-up" size={22} color="#667eea" />
					<Text style={styles.sectionTitle}>Learning Progress</Text>
				</View>
				<View style={styles.progressContainer}>
					<View style={styles.progressItem}>
						<Text style={styles.progressLabel}>Overall Progress</Text>
						<View style={styles.progressBar}>
							<View
								style={[styles.progressFill, { width: `${progress.overall}%` }]}
							/>
						</View>
						<Text style={styles.progressText}>
							{progress.overall}% Complete
						</Text>
						<Text style={styles.progressSubtext}>
							{`${user?.points || 0} points • ${Math.floor(
								(progress.timeSpent || 0) / 60
							)}h ${(progress.timeSpent || 0) % 60}m • ${
								user?.streakDays || 0
							} day streak`}
						</Text>
					</View>
					<TouchableOpacity
						style={styles.progressItem}
						onPress={() => setShowGoalsDetail(!showGoalsDetail)}
						activeOpacity={0.7}
					>
						<View style={styles.progressHeader}>
							<Text style={styles.progressLabel}>Weekly Goals</Text>
							<Ionicons
								name={showGoalsDetail ? "chevron-up" : "chevron-down"}
								size={16}
								color="#667eea"
							/>
						</View>
						<View style={styles.progressBar}>
							<View
								style={[
									styles.progressFill,
									{ width: `${progress.weekly}%`, backgroundColor: "#f5576c" },
								]}
							/>
						</View>
						<Text style={styles.progressText}>
							{progress.weeklyGoals}/{progress.totalGoals} Goals Achieved
						</Text>
						{showGoalsDetail && (
							<View style={styles.goalsDetailContainer}>
								{progress.goals.map((goal, index) => (
									<View key={index} style={styles.goalItem}>
										<Ionicons
											name={
												goal.completed ? "checkmark-circle" : "ellipse-outline"
											}
											size={16}
											color={goal.completed ? "#4caf50" : "#b2bec3"}
										/>
										<View style={styles.goalContent}>
											<Text
												style={[
													styles.goalName,
													goal.completed && styles.goalCompleted,
												]}
											>
												{goal.name}
											</Text>
											<Text style={styles.goalTarget}>{goal.target}</Text>
										</View>
									</View>
								))}
							</View>
						)}
						{!showGoalsDetail && (
							<Text style={styles.progressSubtext}>
								{progress.goals
									.filter((g) => g.completed)
									.map((g) => g.name)
									.join(" • ") || "Tap to see goals"}
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>
			{/* Achievements Section */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Ionicons name="trophy" size={22} color="#f5576c" />
					<Text style={styles.sectionTitle}>Achievements</Text>
				</View>
				<View style={styles.achievementsGrid}>
					{achievements.map((achievement) => (
						<View
							key={achievement.id}
							style={[
								styles.achievementCard,
								achievement.unlocked
									? styles.achievementUnlocked
									: styles.achievementLocked,
							]}
						>
							<Text style={styles.achievementIcon}>{achievement.icon}</Text>
							<Text
								style={[
									styles.achievementTitle,
									!achievement.unlocked && styles.achievementTextLocked,
								]}
							>
								{achievement.title}
							</Text>
							<Text
								style={[
									styles.achievementDescription,
									!achievement.unlocked && styles.achievementTextLocked,
								]}
							>
								{achievement.description}
							</Text>
							{achievement.unlocked && (
								<View style={styles.achievementBadge}>
									<Ionicons name="checkmark" size={10} color="#fff" />
								</View>
							)}
						</View>
					))}
				</View>
			</View>
			{/* Profile Edit Section */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Ionicons name="person" size={22} color="#4facfe" />
					<Text style={styles.sectionTitle}>Profile Information</Text>
					<View style={styles.headerActions}>
						<TouchableOpacity
							onPress={refreshProfile}
							disabled={refreshing}
							style={[
								styles.refreshButton,
								refreshing && styles.buttonDisabled,
							]}
							activeOpacity={0.7}
						>
							<Ionicons
								name={refreshing ? "sync" : "refresh"}
								size={16}
								color={refreshing ? "#999" : "#4facfe"}
							/>
							{refreshing && (
								<ActivityIndicator
									size="small"
									color="#4facfe"
									style={{ marginLeft: 4 }}
								/>
							)}
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => {
								if (editing) {
									setFormData({
										username: user.username || "",
										email: user.email || "",
										level: user.level || "beginner",
									});
								}
								setEditing(!editing);
							}}
							style={styles.editButton}
						>
							<Ionicons
								name={editing ? "close" : "pencil"}
								size={14}
								color="#667eea"
							/>
							<Text style={styles.editButtonText}>
								{editing ? "Cancel" : "Edit"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View style={styles.inputContainer}>
					<Text style={styles.inputLabel}>Username</Text>
					<TextInput
						style={[styles.input, !editing && styles.inputDisabled]}
						value={formData.username}
						onChangeText={(text) =>
							setFormData({ ...formData, username: text })
						}
						editable={editing}
						placeholder="Enter username"
						placeholderTextColor="#999"
					/>
				</View>
				<View style={styles.inputContainer}>
					<Text style={styles.inputLabel}>Email</Text>
					<TextInput
						style={[styles.input, styles.inputDisabled]}
						value={formData.email}
						editable={false}
						placeholder="Email address"
						placeholderTextColor="#999"
					/>
				</View>
				<View style={styles.inputContainer}>
					<Text style={styles.inputLabel}>Learning Level</Text>
					<View style={styles.levelSelector}>
						{["beginner", "intermediate", "advanced"].map((level) => (
							<TouchableOpacity
								key={level}
								style={[
									styles.levelOption,
									formData.level === level && styles.levelOptionSelected,
									!editing && styles.levelOptionDisabled,
								]}
								onPress={() =>
									editing &&
									setFormData({
										...formData,
										level: level as "beginner" | "intermediate" | "advanced",
									})
								}
								disabled={!editing}
							>
								<Text
									style={[
										styles.levelOptionText,
										formData.level === level && styles.levelOptionTextSelected,
									]}
								>
									{level.charAt(0).toUpperCase() + level.slice(1)}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
				{editing && (
					<TouchableOpacity
						style={[styles.saveButton, loading && styles.buttonDisabled]}
						onPress={handleSave}
						disabled={loading}
					>
						<Text style={styles.saveButtonText}>
							{loading ? "Saving..." : "Save Changes"}
						</Text>
					</TouchableOpacity>
				)}
			</View>
			{/* Actions Section */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Ionicons name="settings" size={22} color="#ffa726" />
					<Text style={styles.sectionTitle}>Account Settings</Text>
				</View>

				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => setShowPasswordModal(true)}
				>
					<Ionicons name="lock-closed" size={18} color="#667eea" />
					<Text style={styles.actionButtonText}>Change Password</Text>
					<Ionicons name="chevron-forward" size={18} color="#ccc" />
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.actionButton, styles.signOutButton]}
					onPress={handleSignOut}
				>
					<Ionicons name="log-out" size={18} color="#ff6b6b" />
					<Text style={[styles.actionButtonText, styles.signOutText]}>
						Sign Out
					</Text>
					<Ionicons name="chevron-forward" size={18} color="#ff6b6b" />
				</TouchableOpacity>
			</View>
			{/* Password Change Modal */}
			<Modal
				visible={showPasswordModal}
				animationType="slide"
				transparent={true}
				onRequestClose={() => setShowPasswordModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Change Password</Text>
							<TouchableOpacity
								onPress={() => setShowPasswordModal(false)}
								style={styles.modalCloseButton}
							>
								<Ionicons name="close" size={22} color="#666" />
							</TouchableOpacity>
						</View>
						<View style={styles.modalBody}>
							<View style={styles.inputContainer}>
								<Text style={styles.inputLabel}>Current Password</Text>
								<TextInput
									style={styles.input}
									value={passwordData.currentPassword}
									onChangeText={(text) =>
										setPasswordData({ ...passwordData, currentPassword: text })
									}
									secureTextEntry
									placeholder="Enter current password"
									placeholderTextColor="#999"
								/>
							</View>
							<View style={styles.inputContainer}>
								<Text style={styles.inputLabel}>New Password</Text>
								<TextInput
									style={styles.input}
									value={passwordData.newPassword}
									onChangeText={(text) =>
										setPasswordData({ ...passwordData, newPassword: text })
									}
									secureTextEntry
									placeholder="Enter new password"
									placeholderTextColor="#999"
								/>
							</View>
							<View style={styles.inputContainer}>
								<Text style={styles.inputLabel}>Confirm New Password</Text>
								<TextInput
									style={styles.input}
									value={passwordData.confirmPassword}
									onChangeText={(text) =>
										setPasswordData({ ...passwordData, confirmPassword: text })
									}
									secureTextEntry
									placeholder="Confirm new password"
									placeholderTextColor="#999"
								/>
							</View>
							<TouchableOpacity
								style={[
									styles.saveButton,
									passwordLoading && styles.buttonDisabled,
								]}
								onPress={handlePasswordChange}
								disabled={passwordLoading}
							>
								{passwordLoading ? (
									<View style={styles.loadingContainer}>
										<ActivityIndicator size="small" color="#fff" />
										<Text style={styles.saveButtonText}>
											Updating Password...
										</Text>
									</View>
								) : (
									<Text style={styles.saveButtonText}>Update Password</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/* Developer & Project Information Section */}
			<View style={styles.developerSection}>
				<Text style={styles.sectionTitle}>📚 Project Information</Text>
				{/* University Information */}
				<View style={styles.infoCard}>
					<View style={styles.infoHeader}>
						<Ionicons name="school" size={24} color="#667eea" />
						<Text style={styles.infoTitle}>University</Text>
					</View>
					<Text style={styles.infoText}>{developerInfo.university.name}</Text>
					<Text style={styles.infoSubtext}>
						{developerInfo.university.subtitle}
					</Text>
					<Text style={styles.infoSubtext}>
						{developerInfo.university.description}
					</Text>
				</View>
				{/* Department Information */}
				<View style={styles.infoCard}>
					<View style={styles.infoHeader}>
						<Ionicons name="desktop" size={24} color="#4ECDC4" />
						<Text style={styles.infoTitle}>Department</Text>
					</View>
					<Text style={styles.infoText}>{developerInfo.department.name}</Text>
					<Text style={styles.infoSubtext}>
						{developerInfo.department.school}
					</Text>
					<Text style={styles.infoSubtext}>
						{developerInfo.department.description}
					</Text>
					{developerInfo.department.hod && (
						<Text style={styles.infoSubtext}>
							Head of Department: {developerInfo.department.hod}
						</Text>
					)}
				</View>
				{/* Project Guide/Teacher Information */}
				<View style={styles.infoCard}>
					<View style={styles.infoHeader}>
						<Ionicons name="person-circle" size={24} color="#FF6B35" />
						<Text style={styles.infoTitle}>Project Guide</Text>
					</View>
					<Text style={styles.infoText}>{developerInfo.projectGuide.name}</Text>
					<Text style={styles.infoSubtext}>
						{developerInfo.projectGuide.designation}
					</Text>
					<Text style={styles.infoSubtext}>
						{developerInfo.projectGuide.specialization}
					</Text>
				</View>
				{/* Development Team Information */}
				<View style={styles.infoCard}>
					<View style={styles.infoHeader}>
						<Ionicons name="people" size={24} color="#9C27B0" />
						<Text style={styles.infoTitle}>Development Team</Text>
					</View>
					{developerInfo.team.map((member, index) => (
						<View key={index} style={styles.teamMember}>
							<View style={styles.memberInfo}>
								<Text style={styles.memberName}>{member.name}</Text>
								<Text style={styles.memberRole}>{member.role}</Text>
								<Text style={styles.memberDetails}>{member.details}</Text>
							</View>
						</View>
					))}
				</View>
				{/* Project Details */}
				<View style={styles.infoCard}>
					<View style={styles.infoHeader}>
						<Ionicons name="rocket" size={24} color="#FF5722" />
						<Text style={styles.infoTitle}>Project Details</Text>
					</View>
					<Text style={styles.infoText}>{developerInfo.project.name}</Text>
					<Text style={styles.infoSubtext}>
						{developerInfo.project.description}
					</Text>
					<Text style={styles.infoSubtext}>
						Category: {developerInfo.project.category}
					</Text>
					<Text style={styles.infoSubtext}>
						{developerInfo.project.techStack}
					</Text>

					{/* Project Timeline */}
					<View style={styles.timelineContainer}>
						<View style={styles.timelineItem}>
							<Ionicons name="calendar-outline" size={16} color="#667eea" />
							<Text style={styles.timelineText}>
								Started: {developerInfo.project.startDate}
							</Text>
						</View>
						{developerInfo.project.endDate && (
							<View style={styles.timelineItem}>
								<Ionicons
									name="checkmark-circle-outline"
									size={16}
									color="#4CAF50"
								/>
								<Text style={styles.timelineText}>
									Completed: {developerInfo.project.endDate}
								</Text>
							</View>
						)}
						<View style={styles.statusBadge}>
							<Text style={styles.statusText}>
								{developerInfo.project.status}
							</Text>
						</View>
					</View>

					{/* Project Statistics */}
					<View style={styles.projectStats}>
						<View style={styles.statItem}>
							<Text style={styles.projectStatNumber}>
								{developerInfo.project.stats.duration}
							</Text>
							<Text style={styles.projectStatLabel}>Months</Text>
						</View>
						<View style={styles.statItem}>
							<Text style={styles.projectStatNumber}>
								{developerInfo.project.stats.linesOfCode}
							</Text>
							<Text style={styles.projectStatLabel}>Lines of Code</Text>
						</View>
						<View style={styles.statItem}>
							<Text style={styles.projectStatNumber}>
								{developerInfo.project.stats.features}
							</Text>
							<Text style={styles.projectStatLabel}>Features</Text>
						</View>
						{developerInfo.project.stats.commits && (
							<View style={styles.statItem}>
								<Text style={styles.projectStatNumber}>
									{developerInfo.project.stats.commits}
								</Text>
								<Text style={styles.projectStatLabel}>Commits</Text>
							</View>
						)}
					</View>
				</View>
				{/* Key Features */}
				<View style={styles.infoCard}>
					<View style={styles.infoHeader}>
						<Ionicons name="star" size={24} color="#FFD700" />
						<Text style={styles.infoTitle}>Key Features</Text>
					</View>
					{developerInfo.project.features.map((feature, index) => (
						<View key={index} style={styles.featureItem}>
							<Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
							<Text style={styles.featureText}>{feature}</Text>
						</View>
					))}
				</View>
				{/* Project Objectives */}
				<View style={styles.infoCard}>
					<View style={styles.infoHeader}>
						<Ionicons name="golf" size={24} color="#E91E63" />
						<Text style={styles.infoTitle}>Project Objectives</Text>
					</View>
					{developerInfo.project.objectives.map((objective, index) => (
						<View key={index} style={styles.objectiveItem}>
							<Text style={styles.objectiveNumber}>{index + 1}.</Text>
							<Text style={styles.objectiveText}>{objective}</Text>
						</View>
					))}
				</View>
				{/* Contact Information */}
				<View style={styles.infoCard}>
					<View style={styles.infoHeader}>
						<Ionicons name="mail" size={24} color="#34D399" />
						<Text style={styles.infoTitle}>Contact Information</Text>
					</View>
					<TouchableOpacity
						style={styles.contactItem}
						onPress={() => openLink(`mailto:${developerInfo.contact.email}`)}
					>
						<Ionicons name="mail-outline" size={16} color="#666" />
						<Text style={styles.contactText}>
							{developerInfo.contact.email}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.contactItem}
						onPress={() => openLink(`https://${developerInfo.contact.github}`)}
					>
						<Ionicons name="logo-github" size={16} color="#666" />
						<Text style={styles.contactText}>
							{developerInfo.contact.github}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.contactItem}
						onPress={() =>
							openLink(`https://${developerInfo.contact.linkedin}`)
						}
					>
						<Ionicons name="logo-linkedin" size={16} color="#666" />
						<Text style={styles.contactText}>
							{developerInfo.contact.linkedin}
						</Text>
					</TouchableOpacity>
				</View>
				{/* Academic Year */}
				<View style={styles.academicInfo}>
					<Text style={styles.academicText}>
						Academic Year {developerInfo.academic.year} •{" "}
						{developerInfo.academic.semester}
					</Text>
					<Text style={styles.academicText}>
						Batch: {developerInfo.academic.batch}
					</Text>
					<Text style={styles.academicText}>
						Submitted to {developerInfo.university.name}
					</Text>
					{developerInfo.academic.submissionDate && (
						<Text style={styles.academicText}>
							Submission: {developerInfo.academic.submissionDate}
						</Text>
					)}
				</View>
				{/* Acknowledgments */}
				{developerInfo.acknowledgments && (
					<View style={styles.infoCard}>
						<View style={styles.infoHeader}>
							<Ionicons name="heart" size={24} color="#FF69B4" />
							<Text style={styles.infoTitle}>Acknowledgments</Text>
						</View>

						{developerInfo.acknowledgments.specialThanks && (
							<>
								<Text style={styles.acknowledgmentSubtitle}>
									Special Thanks:
								</Text>
								{developerInfo.acknowledgments.specialThanks.map(
									(thanks, index) => (
										<View key={index} style={styles.acknowledgmentItem}>
											<Ionicons
												name="arrow-forward"
												size={12}
												color="#FF69B4"
											/>
											<Text style={styles.acknowledgmentText}>{thanks}</Text>
										</View>
									)
								)}
							</>
						)}

						{developerInfo.acknowledgments.resources && (
							<>
								<Text style={styles.acknowledgmentSubtitle}>
									Resources & Tools:
								</Text>
								{developerInfo.acknowledgments.resources.map(
									(resource, index) => (
										<View key={index} style={styles.acknowledgmentItem}>
											<Ionicons
												name="arrow-forward"
												size={12}
												color="#FF69B4"
											/>
											<Text style={styles.acknowledgmentText}>{resource}</Text>
										</View>
									)
								)}
							</>
						)}

						{developerInfo.acknowledgments.inspiration && (
							<>
								<Text style={styles.acknowledgmentSubtitle}>Inspiration:</Text>
								<Text style={styles.inspirationText}>
									{developerInfo.acknowledgments.inspiration}
								</Text>
							</>
						)}
					</View>
				)}
			</View>

			<View style={styles.bottomSpacing} />
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f7fa",
	},
	errorText: {
		textAlign: "center",
		color: "#666",
		fontSize: 16,
		marginTop: 50,
	},
	header: {
		paddingTop: 50,
		paddingBottom: 40,
		paddingHorizontal: 20,
		backgroundColor: "#fff",
		borderBottomLeftRadius: 25,
		borderBottomRightRadius: 25,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	headerGradient: {
		alignItems: "center",
	},
	avatarContainer: {
		position: "relative",
		marginBottom: 20,
	},
	avatar: {
		width: 90,
		height: 90,
		borderRadius: 45,
		backgroundColor: "#6c5ce7",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
		borderColor: "#fff",
		shadowColor: "#6c5ce7",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	avatarImage: {
		width: "100%",
		height: "100%",
		borderRadius: 45,
	},
	avatarLoadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		borderRadius: 45,
		justifyContent: "center",
		alignItems: "center",
	},
	editAvatarBadge: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#6c5ce7",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "#fff",
	},
	avatarText: {
		fontSize: 36,
		fontWeight: "bold",
		color: "#fff",
	},
	username: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#2d3436",
		marginBottom: 4,
	},
	email: {
		fontSize: 16,
		color: "#636e72",
		marginBottom: 4,
	},
	memberSince: {
		fontSize: 14,
		color: "#b2bec3",
	},
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		marginTop: -20,
		marginBottom: 25,
	},
	statCard: {
		flex: 1,
		marginHorizontal: 6,
		borderRadius: 16,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 4,
	},
	statContent: {
		paddingVertical: 20,
		paddingHorizontal: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	statNumber: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff",
		marginTop: 6,
		marginBottom: 4,
	},
	statLevel: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#fff",
		marginTop: 6,
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		color: "rgba(255,255,255,0.9)",
		fontWeight: "600",
	},
	section: {
		backgroundColor: "#fff",
		marginHorizontal: 20,
		marginBottom: 20,
		borderRadius: 16,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#2d3436",
		marginLeft: 12,
		flex: 1,
	},
	progressContainer: {
		gap: 16,
	},
	progressItem: {
		gap: 8,
	},
	progressLabel: {
		fontSize: 15,
		fontWeight: "600",
		color: "#636e72",
	},
	progressBar: {
		height: 8,
		backgroundColor: "#f1f3f4",
		borderRadius: 4,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#6c5ce7",
		borderRadius: 4,
	},
	progressText: {
		fontSize: 13,
		color: "#b2bec3",
		fontWeight: "500",
	},
	progressSubtext: {
		fontSize: 11,
		color: "#ddd6fe",
		marginTop: 4,
		fontStyle: "italic",
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	goalsDetailContainer: {
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#f1f3f4",
	},
	goalItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
		paddingVertical: 4,
	},
	goalContent: {
		marginLeft: 12,
		flex: 1,
	},
	goalName: {
		fontSize: 14,
		fontWeight: "600",
		color: "#2d3436",
	},
	goalCompleted: {
		color: "#4caf50",
	},
	goalTarget: {
		fontSize: 12,
		color: "#636e72",
		marginTop: 2,
	},
	achievementsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: 12,
	},
	achievementCard: {
		width: "48%",
		backgroundColor: "#f8f9fa",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		position: "relative",
		borderWidth: 1,
		borderColor: "#e9ecef",
		minHeight: 120,
	},
	achievementUnlocked: {
		backgroundColor: "#e8f5e8",
		borderColor: "#4caf50",
	},
	achievementLocked: {
		backgroundColor: "#f8f9fa",
		borderColor: "#e9ecef",
	},
	achievementIcon: {
		fontSize: 28,
		marginBottom: 8,
	},
	achievementTitle: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#2d3436",
		textAlign: "center",
		marginBottom: 4,
	},
	achievementDescription: {
		fontSize: 12,
		color: "#636e72",
		textAlign: "center",
		lineHeight: 16,
	},
	achievementTextLocked: {
		color: "#b2bec3",
	},
	achievementBadge: {
		position: "absolute",
		top: 8,
		right: 8,
		width: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: "#4caf50",
		justifyContent: "center",
		alignItems: "center",
	},
	editButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 12,
		backgroundColor: "#f1f3f4",
		gap: 6,
	},
	editButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#6c5ce7",
	},
	headerActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	refreshButton: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 12,
		backgroundColor: "#f1f3f4",
		minWidth: 40,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
	},
	inputContainer: {
		marginBottom: 16,
	},
	inputLabel: {
		fontSize: 15,
		fontWeight: "600",
		color: "#2d3436",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#e9ecef",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		backgroundColor: "#fff",
		color: "#2d3436",
	},
	inputDisabled: {
		backgroundColor: "#f8f9fa",
		color: "#636e72",
	},
	levelSelector: {
		flexDirection: "row",
		gap: 8,
	},
	levelOption: {
		flex: 1,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#e9ecef",
		borderRadius: 12,
		alignItems: "center",
		backgroundColor: "#fff",
	},
	levelOptionSelected: {
		backgroundColor: "#6c5ce7",
		borderColor: "#6c5ce7",
	},
	levelOptionDisabled: {
		opacity: 0.6,
	},
	levelOptionText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#2d3436",
	},
	levelOptionTextSelected: {
		color: "#fff",
	},
	saveButton: {
		backgroundColor: "#6c5ce7",
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
		marginTop: 16,
		shadowColor: "#6c5ce7",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 4,
	},
	saveButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
	},
	loadingContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 16,
		paddingHorizontal: 16,
		backgroundColor: "#f8f9fa",
		borderRadius: 12,
		marginBottom: 12,
		gap: 12,
		borderWidth: 1,
		borderColor: "#e9ecef",
	},
	actionButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#2d3436",
		flex: 1,
	},
	signOutButton: {
		backgroundColor: "#fff5f5",
		borderColor: "#ffebee",
	},
	signOutText: {
		color: "#ff6b6b",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 20,
		width: "100%",
		maxWidth: 400,
		maxHeight: "80%",
	},
	modalHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#f1f3f4",
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#2d3436",
	},
	modalCloseButton: {
		padding: 4,
	},
	modalBody: {
		padding: 20,
	},
	bottomSpacing: {
		height: 40,
	},
	// Developer Section Styles
	developerSection: {
		marginTop: 24,
		paddingHorizontal: 16,
	},
	infoCard: {
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
		borderWidth: 1,
		borderColor: "#f1f3f4",
	},
	infoHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	infoTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#2d3436",
		marginLeft: 12,
	},
	infoText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#2d3436",
		marginBottom: 4,
	},
	infoSubtext: {
		fontSize: 14,
		color: "#666666",
		marginBottom: 2,
		lineHeight: 20,
	},
	teamMember: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#f1f3f4",
		marginBottom: 8,
	},
	memberInfo: {
		flex: 1,
	},
	memberName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#2d3436",
		marginBottom: 2,
	},
	memberRole: {
		fontSize: 14,
		fontWeight: "500",
		color: "#667eea",
		marginBottom: 2,
	},
	memberDetails: {
		fontSize: 12,
		color: "#666666",
		lineHeight: 16,
	},
	projectStats: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#f1f3f4",
	},
	statItem: {
		alignItems: "center",
	},
	projectStatNumber: {
		fontSize: 20,
		fontWeight: "700",
		color: "#2d3436",
	},
	projectStatLabel: {
		fontSize: 12,
		color: "#666666",
		marginTop: 2,
	},
	contactItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 4,
	},
	contactText: {
		fontSize: 14,
		color: "#667eea",
		marginLeft: 8,
		textDecorationLine: "underline",
	},
	academicInfo: {
		backgroundColor: "#f8f9fa",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		marginTop: 8,
		borderWidth: 1,
		borderColor: "#e9ecef",
	},
	academicText: {
		fontSize: 13,
		color: "#666666",
		textAlign: "center",
		marginBottom: 2,
		fontStyle: "italic",
	},
	// Enhanced Project Styles
	timelineContainer: {
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#f1f3f4",
	},
	timelineItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
	},
	timelineText: {
		fontSize: 14,
		color: "#666666",
		marginLeft: 8,
	},
	statusBadge: {
		backgroundColor: "#4CAF50",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		alignSelf: "flex-start",
		marginTop: 8,
	},
	statusText: {
		fontSize: 12,
		color: "#ffffff",
		fontWeight: "600",
	},
	featureItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 8,
		paddingLeft: 4,
	},
	featureText: {
		fontSize: 14,
		color: "#2d3436",
		marginLeft: 8,
		flex: 1,
		lineHeight: 20,
	},
	objectiveItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 8,
		paddingLeft: 4,
	},
	objectiveNumber: {
		fontSize: 14,
		fontWeight: "600",
		color: "#E91E63",
		marginRight: 8,
		minWidth: 20,
	},
	objectiveText: {
		fontSize: 14,
		color: "#2d3436",
		flex: 1,
		lineHeight: 20,
	},
	// Acknowledgment Styles
	acknowledgmentSubtitle: {
		fontSize: 15,
		fontWeight: "600",
		color: "#2d3436",
		marginTop: 12,
		marginBottom: 8,
	},
	acknowledgmentItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 6,
		paddingLeft: 4,
	},
	acknowledgmentText: {
		fontSize: 13,
		color: "#666666",
		marginLeft: 8,
		flex: 1,
		lineHeight: 18,
	},
	inspirationText: {
		fontSize: 14,
		color: "#2d3436",
		fontStyle: "italic",
		lineHeight: 20,
		marginTop: 4,
		paddingLeft: 4,
	},
});
