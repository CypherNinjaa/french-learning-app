// Stage 7.1: Animation Utilities
// Modern animation helpers for smooth UI interactions

import { Animated, Easing } from 'react-native';

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: any;
  useNativeDriver?: boolean;
}

// Fade animations
export const fadeIn = (
  animatedValue: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration: config.duration || 300,
    delay: config.delay || 0,
    easing: config.easing || Easing.ease,
    useNativeDriver: config.useNativeDriver !== false,
    ...config,
  });
};

export const fadeOut = (
  animatedValue: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration: config.duration || 300,
    delay: config.delay || 0,
    easing: config.easing || Easing.ease,
    useNativeDriver: config.useNativeDriver !== false,
    ...config,
  });
};

// Scale animations
export const scaleIn = (
  animatedValue: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue: 1,
    useNativeDriver: config.useNativeDriver !== false,
    ...config,
  });
};

export const scaleOut = (
  animatedValue: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue: 0,
    useNativeDriver: config.useNativeDriver !== false,
    ...config,
  });
};

// Slide animations
export const slideInFromRight = (
  animatedValue: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration: config.duration || 300,
    delay: config.delay || 0,
    easing: config.easing || Easing.out(Easing.ease),
    useNativeDriver: config.useNativeDriver !== false,
    ...config,
  });
};

export const slideInFromLeft = (
  animatedValue: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration: config.duration || 300,
    delay: config.delay || 0,
    easing: config.easing || Easing.out(Easing.ease),
    useNativeDriver: config.useNativeDriver !== false,
    ...config,
  });
};

export const slideInFromTop = (
  animatedValue: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration: config.duration || 300,
    delay: config.delay || 0,
    easing: config.easing || Easing.out(Easing.ease),
    useNativeDriver: config.useNativeDriver !== false,
    ...config,
  });
};

export const slideInFromBottom = (
  animatedValue: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration: config.duration || 300,
    delay: config.delay || 0,
    easing: config.easing || Easing.out(Easing.ease),
    useNativeDriver: config.useNativeDriver !== false,
    ...config,
  });
};

// Sequence animations
export const staggerAnimation = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 100
): Animated.CompositeAnimation => {
  const staggeredAnimations = animations.map((animation, index) => 
    Animated.sequence([
      Animated.delay(index * staggerDelay),
      animation
    ])
  );
  
  return Animated.parallel(staggeredAnimations);
};

// Parallel animations
export const parallelAnimation = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.parallel(animations);
};

// Custom easing functions
export const customEasing = {
  easeInOut: Easing.inOut(Easing.ease),
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
  back: Easing.back(1.5),
  bezier: Easing.bezier(0.25, 0.46, 0.45, 0.94),
};

// Rotation animations
export const rotate = (
  animatedValue: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration: config.duration || 1000,
    easing: config.easing || Easing.linear,
    useNativeDriver: config.useNativeDriver !== false,
    ...config,
  });
};

// Pulse animation
export const pulse = (
  animatedValue: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.1,
      duration: (config.duration || 1000) / 2,
      easing: config.easing || Easing.ease,
      useNativeDriver: config.useNativeDriver !== false,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: (config.duration || 1000) / 2,
      easing: config.easing || Easing.ease,
      useNativeDriver: config.useNativeDriver !== false,
    }),
  ]);
};

// Shake animation
export const shake = (
  animatedValue: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: (config.duration || 400) / 8,
      useNativeDriver: config.useNativeDriver !== false,
    }),
    Animated.timing(animatedValue, {
      toValue: -10,
      duration: (config.duration || 400) / 8,
      useNativeDriver: config.useNativeDriver !== false,
    }),
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: (config.duration || 400) / 8,
      useNativeDriver: config.useNativeDriver !== false,
    }),
    Animated.timing(animatedValue, {
      toValue: -10,
      duration: (config.duration || 400) / 8,
      useNativeDriver: config.useNativeDriver !== false,
    }),
    Animated.timing(animatedValue, {
      toValue: 5,
      duration: (config.duration || 400) / 8,
      useNativeDriver: config.useNativeDriver !== false,
    }),
    Animated.timing(animatedValue, {
      toValue: -5,
      duration: (config.duration || 400) / 8,
      useNativeDriver: config.useNativeDriver !== false,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: (config.duration || 400) / 4,
      useNativeDriver: config.useNativeDriver !== false,
    }),
  ]);
};

// Animation presets for common UI interactions
export const animationPresets = {
  // Button press feedback
  buttonPress: {
    scale: 0.95,
    duration: 100,
  },
  
  // Card tap feedback
  cardPress: {
    scale: 0.98,
    duration: 150,
  },
  
  // Modal entrance
  modalEntrance: {
    duration: 300,
    easing: customEasing.easeOut,
  },
  
  // Page transition
  pageTransition: {
    duration: 350,
    easing: customEasing.easeInOut,
  },
  
  // Loading spinner
  spinner: {
    duration: 1000,
    easing: Easing.linear,
  },
  
  // Success feedback
  success: {
    duration: 600,
    easing: customEasing.bounce,
  },
  
  // Error shake
  error: {
    duration: 400,
  },
};

// Hook for managing multiple animations
export const useAnimations = () => {
  const createAnimatedValue = (initialValue: number = 0) => 
    new Animated.Value(initialValue);
  
  const createAnimatedXY = (initialValue: { x: number; y: number } = { x: 0, y: 0 }) =>
    new Animated.ValueXY(initialValue);
  
  return {
    createAnimatedValue,
    createAnimatedXY,
    fadeIn,
    fadeOut,
    scaleIn,
    scaleOut,
    slideInFromRight,
    slideInFromLeft,
    slideInFromTop,
    slideInFromBottom,
    staggerAnimation,
    parallelAnimation,
    rotate,
    pulse,
    shake,
    customEasing,
    animationPresets,
  };
};
