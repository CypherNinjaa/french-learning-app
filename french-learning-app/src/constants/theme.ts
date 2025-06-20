// Stage 3.3: Enhanced Theme System
// Modern design system with improved UI/UX following development rules

export interface Theme {
	colors: {
		// Primary colors
		primary: string;
		primaryLight: string;
		primaryDark: string;
		secondary: string;
		secondaryLight: string;
		secondaryDark: string;
		
		// Semantic colors
		success: string;
		warning: string;
		error: string;
		info: string;
		
		// Background colors
		background: string;
		surface: string;
		surfaceSecondary: string;
		overlay: string;
		
		// Text colors
		text: string;
		textSecondary: string;
		textDisabled: string;
		textOnPrimary: string;
		textOnSecondary: string;
		white: string;
		black: string;
		
		// Border colors
		border: string;
		borderLight: string;
		borderDark: string;
		
		// Difficulty level colors
		beginner: string;
		intermediate: string;
		advanced: string;
		
		// Content type colors
		vocabulary: string;
		grammar: string;
		pronunciation: string;
		conversation: string;
		reading: string;
		listening: string;
	};
	
	spacing: {
		xs: number;
		sm: number;
		md: number;
		lg: number;
		xl: number;
		xxl: number;
	};
	
	typography: {
		// Font families
		fontFamily: {
			regular: string;
			medium: string;
			bold: string;
		};
		
		// Font sizes
		fontSize: {
			xs: number;
			sm: number;
			md: number;
			lg: number;
			xl: number;
			xxl: number;
			xxxl: number;
		};
		
		// Line heights
		lineHeight: {
			tight: number;
			normal: number;
			relaxed: number;
		};
		
		// Predefined text styles
		heading: {
			fontSize: number;
			fontWeight: "700";
		};
		subheading: {
			fontSize: number;
			fontWeight: "600";
		};
		body: {
			fontSize: number;
			fontWeight: "400";
		};
		button: {
			fontSize: number;
			fontWeight: "600";
		};
		heading1: {
			fontSize: number;
			fontWeight: "700";
			lineHeight: number;
		};
		heading2: {
			fontSize: number;
			fontWeight: "600";
			lineHeight: number;
		};
		heading3: {
			fontSize: number;
			fontWeight: "600";
			lineHeight: number;
		};
		bodyLarge: {
			fontSize: number;
			fontWeight: "400";
			lineHeight: number;
		};
		caption: {
			fontSize: number;
			fontWeight: "400";
			lineHeight: number;
		};
	};
	
	borderRadius: {
		xs: number;
		small: number;
		medium: number;
		large: number;
		xl: number;
		full: number;
	};
	
	shadows: {
		sm: any;
		md: any;
		lg: any;
		xl: any;
	};
	
	animation: {
		duration: {
			fast: number;
			normal: number;
			slow: number;
		};
	};
}

// Enhanced theme with modern design tokens
export const theme: Theme = {
	colors: {
		// Primary colors
		primary: "#007AFF",
		primaryLight: "#4DA6FF",
		primaryDark: "#0056CC",
		secondary: "#5856D6",
		secondaryLight: "#8B8AE6",
		secondaryDark: "#3F3EAD",
		
		// Semantic colors
		success: "#34C759",
		warning: "#FF9500",
		error: "#FF3B30",
		info: "#5AC8FA",
		
		// Background colors
		background: "#F2F2F7",
		surface: "#FFFFFF",
		surfaceSecondary: "#F9F9F9",
		overlay: "rgba(0, 0, 0, 0.5)",
		
		// Text colors
		text: "#000000",
		textSecondary: "#8E8E93",
		textDisabled: "#C7C7CC",
		textOnPrimary: "#FFFFFF",
		textOnSecondary: "#FFFFFF",
		white: "#FFFFFF",
		black: "#000000",
		
		// Border colors
		border: "#E5E5EA",
		borderLight: "#F2F2F7",
		borderDark: "#D1D1D6",
		
		// Difficulty level colors
		beginner: "#34C759",
		intermediate: "#FF9500",
		advanced: "#FF3B30",
		
		// Content type colors
		vocabulary: "#007AFF",
		grammar: "#5856D6",
		pronunciation: "#AF52DE",
		conversation: "#FF2D92",
		reading: "#32D74B",
		listening: "#30B0C7",
	},
	
	spacing: {
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32,
		xxl: 48,
	},
	
	typography: {
		fontFamily: {
			regular: 'System',
			medium: 'System',
			bold: 'System',
		},
		
		fontSize: {
			xs: 12,
			sm: 14,
			md: 16,
			lg: 18,
			xl: 20,
			xxl: 24,
			xxxl: 32,
		},
		
		lineHeight: {
			tight: 1.2,
			normal: 1.5,
			relaxed: 1.8,
		},
		
		// Original styles (for backward compatibility)
		heading: {
			fontSize: 24,
			fontWeight: "700" as "700",
		},
		subheading: {
			fontSize: 18,
			fontWeight: "600" as "600",
		},
		body: {
			fontSize: 16,
			fontWeight: "400" as "400",
		},
		button: {
			fontSize: 16,
			fontWeight: "600" as "600",
		},
		
		// Enhanced text styles
		heading1: {
			fontSize: 32,
			fontWeight: "700" as "700",
			lineHeight: 1.2,
		},
		heading2: {
			fontSize: 24,
			fontWeight: "600" as "600",
			lineHeight: 1.3,
		},
		heading3: {
			fontSize: 20,
			fontWeight: "600" as "600",
			lineHeight: 1.4,
		},
		bodyLarge: {
			fontSize: 18,
			fontWeight: "400" as "400",
			lineHeight: 1.5,
		},
		caption: {
			fontSize: 12,
			fontWeight: "400" as "400",
			lineHeight: 1.4,
		},
	},
	
	borderRadius: {
		xs: 4,
		small: 8,
		medium: 12,
		large: 16,
		xl: 24,
		full: 9999,
	},
	
	shadows: {
		sm: {
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.1,
			shadowRadius: 2,
			elevation: 1,
		},
		md: {
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.15,
			shadowRadius: 4,
			elevation: 3,
		},
		lg: {
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.2,
			shadowRadius: 8,
			elevation: 6,
		},
		xl: {
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 8 },
			shadowOpacity: 0.25,
			shadowRadius: 16,
			elevation: 10,
		},
	},
	
	animation: {
		duration: {
			fast: 150,
			normal: 300,
			slow: 500,
		},
	},
};

// Dark theme
export const darkTheme: Theme = {
	...theme,
	colors: {
		...theme.colors,
		
		// Background colors (dark)
		background: "#000000",
		surface: "#1C1C1E",
		surfaceSecondary: "#2C2C2E",
		overlay: "rgba(255, 255, 255, 0.1)",
		
		// Text colors (dark)
		text: "#FFFFFF",
		textSecondary: "#8E8E93",
		textDisabled: "#48484A",
		
		// Border colors (dark)
		border: "#38383A",
		borderLight: "#2C2C2E",
		borderDark: "#48484A",
	},
};

// Utility functions for theme usage
export const getColorForDifficulty = (difficulty: string, currentTheme: Theme = theme): string => {
	switch (difficulty.toLowerCase()) {
		case 'beginner':
			return currentTheme.colors.beginner;
		case 'intermediate':
			return currentTheme.colors.intermediate;
		case 'advanced':
			return currentTheme.colors.advanced;
		default:
			return currentTheme.colors.primary;
	}
};

export const getColorForContentType = (contentType: string, currentTheme: Theme = theme): string => {
	switch (contentType.toLowerCase()) {
		case 'vocabulary':
			return currentTheme.colors.vocabulary;
		case 'grammar':
			return currentTheme.colors.grammar;
		case 'pronunciation':
			return currentTheme.colors.pronunciation;
		case 'conversation':
			return currentTheme.colors.conversation;
		case 'reading':
			return currentTheme.colors.reading;
		case 'listening':
			return currentTheme.colors.listening;
		default:
			return currentTheme.colors.primary;
	}
};

export const createShadowStyle = (shadowLevel: keyof Theme['shadows'], currentTheme: Theme = theme) => {
	return currentTheme.shadows[shadowLevel];
};

// Responsive spacing helper
export const getResponsiveSpacing = (size: keyof Theme['spacing'], multiplier: number = 1, currentTheme: Theme = theme) => {
	return currentTheme.spacing[size] * multiplier;
};
