// Stage 7.1: Responsive Design Utilities
// Helper functions for responsive design and tablet support

import React from 'react';
import { Dimensions, PixelRatio } from 'react-native';

// Get screen dimensions
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Check if device is tablet
export const isTablet = () => {
  const { width, height } = getScreenDimensions();
  const aspectRatio = height / width;
  const pixelDensity = PixelRatio.get();
  
  // Consider tablets as devices with:
  // - Larger screen size (> 7 inches diagonal)
  // - Lower pixel density (typically < 2.5)
  // - Aspect ratio closer to 4:3 or 16:10
  const diagonalInches = Math.sqrt(width * width + height * height) / (pixelDensity * 160);
  
  return diagonalInches > 7 && (aspectRatio < 1.6 || aspectRatio > 0.6);
};

// Check if device is in landscape mode
export const isLandscape = () => {
  const { width, height } = getScreenDimensions();
  return width > height;
};

// Get responsive font size
export const getResponsiveFontSize = (size: number) => {
  const { width } = getScreenDimensions();
  const scale = width / 320; // Base width (iPhone 5)
  
  const newSize = size * scale;
  
  // Ensure minimum and maximum font sizes
  if (newSize < 12) return 12;
  if (newSize > 30) return 30;
  
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Get responsive spacing
export const getResponsiveSpacing = (spacing: number) => {
  const { width } = getScreenDimensions();
  const scale = width / 375; // Base width (iPhone X)
  
  return Math.round(spacing * scale);
};

// Get responsive width
export const getResponsiveWidth = (percentage: number) => {
  const { width } = getScreenDimensions();
  return Math.round((percentage / 100) * width);
};

// Get responsive height
export const getResponsiveHeight = (percentage: number) => {
  const { height } = getScreenDimensions();
  return Math.round((percentage / 100) * height);
};

// Responsive breakpoints
export const breakpoints = {
  small: 0,     // phones in portrait
  medium: 768,  // tablets in portrait
  large: 1024,  // tablets in landscape
  xlarge: 1440, // desktop
};

// Get current breakpoint
export const getCurrentBreakpoint = () => {
  const { width } = getScreenDimensions();
  
  if (width >= breakpoints.xlarge) return 'xlarge';
  if (width >= breakpoints.large) return 'large';
  if (width >= breakpoints.medium) return 'medium';
  return 'small';
};

// Responsive style helpers
export const responsiveStyles = {
  // Container styles based on screen size
  container: () => {
    const { width } = getScreenDimensions();
    const currentBreakpoint = getCurrentBreakpoint();
    
    switch (currentBreakpoint) {
      case 'xlarge':
        return {
          maxWidth: 1200,
          marginHorizontal: 'auto' as const,
          paddingHorizontal: 32,
        };
      case 'large':
        return {
          paddingHorizontal: 24,
        };
      case 'medium':
        return {
          paddingHorizontal: 20,
        };
      default:
        return {
          paddingHorizontal: 16,
        };
    }
  },
  
  // Grid columns based on screen size
  gridColumns: () => {
    const currentBreakpoint = getCurrentBreakpoint();
    
    switch (currentBreakpoint) {
      case 'xlarge':
        return 4;
      case 'large':
        return 3;
      case 'medium':
        return 2;
      default:
        return 1;
    }
  },
  
  // Modal styles based on screen size
  modal: () => {
    const { width, height } = getScreenDimensions();
    const currentBreakpoint = getCurrentBreakpoint();
    
    if (currentBreakpoint === 'small') {
      return {
        width: width * 0.9,
        maxHeight: height * 0.8,
      };
    }
    
    return {
      width: Math.min(600, width * 0.8),
      maxHeight: height * 0.8,
    };
  },
  
  // Card styles based on screen size
  card: () => {
    const currentBreakpoint = getCurrentBreakpoint();
    
    switch (currentBreakpoint) {
      case 'xlarge':
      case 'large':
        return {
          minHeight: 200,
          padding: 24,
        };
      case 'medium':
        return {
          minHeight: 180,
          padding: 20,
        };
      default:
        return {
          minHeight: 160,
          padding: 16,
        };
    }
  },
};

// Typography scale for different screen sizes
export const getTypographyScale = () => {
  const currentBreakpoint = getCurrentBreakpoint();
  
  const scales = {
    small: {
      h1: 24,
      h2: 20,
      h3: 18,
      h4: 16,
      body: 14,
      caption: 12,
    },
    medium: {
      h1: 28,
      h2: 24,
      h3: 20,
      h4: 18,
      body: 16,
      caption: 14,
    },
    large: {
      h1: 32,
      h2: 28,
      h3: 24,
      h4: 20,
      body: 18,
      caption: 16,
    },
    xlarge: {
      h1: 36,
      h2: 32,
      h3: 28,
      h4: 24,
      body: 20,
      caption: 18,
    },
  };
  
  return scales[currentBreakpoint];
};

// Device orientation helpers
export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = React.useState(
    isLandscape() ? 'landscape' : 'portrait'
  );
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    });
    
    return subscription?.remove;
  }, []);
  
  return orientation;
};

// Safe area helpers for different devices
export const getSafeAreaInsets = () => {
  const { width, height } = getScreenDimensions();
  
  // Basic safe area calculations
  // In a real app, you'd use react-native-safe-area-context
  const hasNotch = height > 800; // Simple heuristic
  
  return {
    top: hasNotch ? 44 : 20,
    bottom: hasNotch ? 34 : 0,
    left: 0,
    right: 0,
  };
};

// Export commonly used responsive values
export const responsive = {
  // Screen dimensions
  screenWidth: getScreenDimensions().width,
  screenHeight: getScreenDimensions().height,
  
  // Device checks
  isTablet: isTablet(),
  isLandscape: isLandscape(),
  
  // Current breakpoint
  breakpoint: getCurrentBreakpoint(),
  
  // Responsive functions
  fontSize: getResponsiveFontSize,
  spacing: getResponsiveSpacing,
  width: getResponsiveWidth,
  height: getResponsiveHeight,
  
  // Style helpers
  styles: responsiveStyles,
  typography: getTypographyScale(),
};
