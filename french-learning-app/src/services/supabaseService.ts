// Supabase service layer following the development rules
import { supabase } from "./supabase";
import { User, UserProfile, ApiResponse, UserRole } from "../types";

export class SupabaseService {
	// User authentication methods
	static async signUp(
		email: string,
		password: string,
		userData: Partial<UserProfile>
	): Promise<ApiResponse<User>> {
		try {
			console.log('🔄 Starting signUp process...');
			console.log('📧 Email:', email);
			console.log('👤 UserData:', userData);			const { data: authData, error: authError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: userData,
					emailRedirectTo: 'frenchlearning://email-verification',
				},
			});

			console.log('✅ Auth signup result:', { authData, authError });

			if (authError) {
				console.error('❌ Auth signup error:', authError);
				throw authError;
			}

			if (authData.user) {
				console.log('🔄 Waiting for profile creation by trigger...');
				
				// Wait a moment for the database trigger to create the profile
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				// Fetch the created profile (created by the database trigger)
				const { data: profileData, error: profileError } = await supabase
					.from("profiles")
					.select('*')
					.eq('id', authData.user.id)
					.single();

				console.log('✅ Profile fetch result:', { profileData, profileError });

				if (profileError) {
					console.error('❌ Profile fetch error:', profileError);
					throw profileError;
				}

				console.log('🎉 SignUp successful!');				return {
					data: {
						id: authData.user.id,						username: profileData.username || "",
						email: authData.user.email || "",
						level: profileData.level as
							| "beginner"
							| "intermediate"
							| "advanced",
						points: profileData.points || 0,
						streakDays: profileData.streak_days || 0,
						createdAt: profileData.created_at,
						userRole: profileData.user_role || 'user',
						avatarUrl: profileData.avatar_url || undefined,
					},
					error: null,
					success: true,
				};
			}

			throw new Error("User registration failed - no user data returned");
		} catch (error) {
			console.error("❌ SignUp error details:", error);
			
			// Get detailed error information
			let errorMessage = "Unknown error occurred";
			if (error instanceof Error) {
				errorMessage = error.message;
				console.error("Error name:", error.name);
				console.error("Error stack:", error.stack);
			} else if (typeof error === 'object' && error !== null) {
				console.error("Error object:", JSON.stringify(error, null, 2));
				if ('message' in error) {
					errorMessage = String(error.message);
				}
			}
			
			return {
				data: null,
				error: errorMessage,
				success: false,
			};
		}
	}

	static async signIn(
		email: string,
		password: string
	): Promise<ApiResponse<User>> {
		try {
			const { data: authData, error: authError } =
				await supabase.auth.signInWithPassword({
					email,
					password,
				});

			if (authError) throw authError;

			if (authData.user) {
				const userProfile = await this.getUserProfile(authData.user.id);
				if (userProfile.success && userProfile.data) {					return {
						data: {
							id: authData.user.id,
							username: userProfile.data.username || "",							email: authData.user.email || "",
							level: userProfile.data.level as
								| "beginner"
								| "intermediate"
								| "advanced",
							points: userProfile.data.points,
							streakDays: userProfile.data.streak_days,
							createdAt: userProfile.data.created_at,
							userRole: (userProfile.data as any).user_role || 'user',
							avatarUrl: userProfile.data.avatar_url || undefined,
						},
						error: null,
						success: true,
					};
				}
			}

			throw new Error("User authentication failed");
		} catch (error) {
			console.error("Error in signIn:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
				success: false,
			};
		}
	}

	static async signOut(): Promise<ApiResponse<null>> {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error in signOut:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
				success: false,
			};
		}
	}

	static async getUserProfile(
		userId: string
	): Promise<ApiResponse<UserProfile>> {
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", userId)
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error fetching user profile:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
				success: false,
			};
		}
	}

	static async updateUserProfile(
		userId: string,
		updates: Partial<UserProfile>
	): Promise<ApiResponse<UserProfile>> {
		try {
			const { data, error } = await supabase
				.from("profiles")
				.update(updates)
				.eq("id", userId)
				.single();

			if (error) throw error;

			return {
				data,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error updating user profile:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
				success: false,
			};
		}
	}
	static async resetPassword(email: string): Promise<ApiResponse<null>> {
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: 'frenchlearning://reset-password',
			});

			if (error) throw error;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error in resetPassword:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
				success: false,
			};
		}
	}

	static async updatePassword(newPassword: string): Promise<ApiResponse<null>> {
		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (error) throw error;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error in updatePassword:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
				success: false,
			};
		}
	}

	// Helper method to get current user session
	static async getCurrentUser(): Promise<ApiResponse<User>> {
		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error) {
				// Handle session missing error gracefully
				if (error.message.includes('Auth session missing')) {
					return {
						data: null,
						error: null,
						success: true,
					};
				}
				throw error;
			}

			if (user) {
				const userProfile = await this.getUserProfile(user.id);				if (userProfile.success && userProfile.data) {					return {
						data: {
							id: user.id,
							username: userProfile.data.username || "",
							email: user.email || "",
							level: userProfile.data.level as
								| "beginner"
								| "intermediate"
								| "advanced",
							points: userProfile.data.points,
							streakDays: userProfile.data.streak_days,
							createdAt: userProfile.data.created_at,
							userRole: (userProfile.data as any).user_role || 'user',
							avatarUrl: userProfile.data.avatar_url || undefined,
						},
						error: null,
						success: true,
					};
				}
			}

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			// Only log non-session errors
			const errorMessage = error instanceof Error ? error.message : String(error);
			if (!errorMessage.includes('Auth session missing')) {
				console.error("Error getting current user:", error);
			}
			return {
				data: null,
				error: null, // Don't treat missing session as an error
				success: true,
			};
		}
	}

	static async verifyEmail(token: string): Promise<ApiResponse<null>> {
		try {
			const { error } = await supabase.auth.verifyOtp({
				token_hash: token,
				type: 'signup'
			});

			if (error) throw error;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error in verifyEmail:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
				success: false,
			};
		}
	}

	static async resetPasswordWithToken(token: string, newPassword: string): Promise<ApiResponse<null>> {
		try {
			// First verify the reset token
			const { error: verifyError } = await supabase.auth.verifyOtp({
				token_hash: token,
				type: 'recovery'
			});

			if (verifyError) throw verifyError;

			// Then update the password
			const { error: updateError } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (updateError) throw updateError;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error in resetPasswordWithToken:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
				success: false,
			};
		}
	}

	// Admin methods for Stage 2.3
	static async getAdminDashboardStats(): Promise<ApiResponse<{
		totalUsers: number;
		totalAdmins: number;
		newUsersThisWeek: number;
		activeUsersToday: number;
		sessionsToday: number;
	}>> {
		try {
			const { data, error } = await supabase
				.from('admin_dashboard_stats')
				.select('*')
				.single();

			if (error) throw error;

			return {
				data: {
					totalUsers: data.total_users || 0,
					totalAdmins: data.total_admins || 0,
					newUsersThisWeek: data.new_users_this_week || 0,
					activeUsersToday: data.active_users_today || 0,
					sessionsToday: data.sessions_today || 0,
				},
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error in getAdminDashboardStats:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
				success: false,
			};
		}
	}

	static async checkUserRole(userId: string): Promise<ApiResponse<string>> {
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('user_role')
				.eq('id', userId)
				.single();

			if (error) throw error;

			return {
				data: data.user_role || 'user',
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error in checkUserRole:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
				success: false,
			};
		}
	}

	static async hasAdminPermission(userId: string, permission: string): Promise<ApiResponse<boolean>> {
		try {
			const { data, error } = await supabase.rpc('has_permission', {
				user_id: userId,
				permission: permission
			});

			if (error) throw error;

			return {
				data: data === true,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error in hasAdminPermission:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
				success: false,
			};
		}
	}

	static async uploadAvatar(
		userId: string,
		imageUri: string
	): Promise<ApiResponse<string>> {
		try {
			// Convert image URI to blob
			const response = await fetch(imageUri);
			const blob = await response.blob();
			
			// Create a unique filename
			const fileExt = imageUri.split('.').pop() || 'jpg';
			const fileName = `${userId}-${Date.now()}.${fileExt}`;
			const filePath = `avatars/${fileName}`;

			// Upload to Supabase storage
			const { data: uploadData, error: uploadError } = await supabase.storage
				.from('avatars')
				.upload(filePath, blob, {
					cacheControl: '3600',
					upsert: true
				});

			if (uploadError) throw uploadError;

			// Get public URL
			const { data: urlData } = supabase.storage
				.from('avatars')
				.getPublicUrl(filePath);

			const avatarUrl = urlData.publicUrl;

			// Update user profile with new avatar URL
			const { error: updateError } = await supabase
				.from('profiles')
				.update({ avatar_url: avatarUrl })
				.eq('id', userId);

			if (updateError) throw updateError;

			return {
				data: avatarUrl,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error uploading avatar:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Failed to upload avatar",
				success: false,
			};
		}
	}

	static async deleteAvatar(userId: string, avatarUrl: string): Promise<ApiResponse<null>> {
		try {
			// Extract file path from URL
			const urlParts = avatarUrl.split('/');
			const fileName = urlParts[urlParts.length - 1];
			const filePath = `avatars/${fileName}`;

			// Delete from storage
			const { error: deleteError } = await supabase.storage
				.from('avatars')
				.remove([filePath]);

			if (deleteError) throw deleteError;

			// Update user profile to remove avatar URL
			const { error: updateError } = await supabase
				.from('profiles')
				.update({ avatar_url: null })
				.eq('id', userId);

			if (updateError) throw updateError;

			return {
				data: null,
				error: null,
				success: true,
			};
		} catch (error) {
			console.error("Error deleting avatar:", error);
			return {
				data: null,
				error:
					error instanceof Error ? error.message : "Failed to delete avatar",
				success: false,
			};
		}
	}
}
