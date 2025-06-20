// Stage 3.3: Modern Content Management Hook
// Custom React hook for content management with caching and optimistic updates

import { useState, useEffect, useCallback, useRef } from 'react';
import { ContentApiService } from '../services/contentApiService';
import {
	Level,
	Module,
	Lesson,
	Vocabulary,
	GrammarRule,
	Question,
	DifficultyLevel,
	ApiResponse,
} from '../types';

interface ContentState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
	refreshing: boolean;
}

interface UseContentOptions {
	enableCache?: boolean;
	autoRefresh?: boolean;
	refreshInterval?: number; // in milliseconds
	initialLoad?: boolean;
}

interface UseContentReturn<T> {
	state: ContentState<T>;
	refresh: () => Promise<void>;
	clearError: () => void;
	invalidateCache: () => void;
}

// Generic hook for content management
function useContent<T>(
	fetchFunction: () => Promise<ApiResponse<T>>,
	dependencies: any[] = [],
	options: UseContentOptions = {}
): UseContentReturn<T> {
	const {
		enableCache = true,
		autoRefresh = false,
		refreshInterval = 300000, // 5 minutes
		initialLoad = true,
	} = options;

	const [state, setState] = useState<ContentState<T>>({
		data: null,
		loading: initialLoad,
		error: null,
		refreshing: false,
	});
	const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const mountedRef = useRef(true);

	const fetchData = useCallback(async (isRefresh = false) => {
		if (!mountedRef.current) return;

		setState(prev => ({
			...prev,
			loading: !isRefresh && !prev.data,
			refreshing: isRefresh,
			error: null,
		}));

		try {
			const response = await fetchFunction();
			
			if (!mountedRef.current) return;

			if (response.success && response.data !== null) {
				setState(prev => ({
					...prev,
					data: response.data,
					loading: false,
					refreshing: false,
					error: null,
				}));
			} else {
				setState(prev => ({
					...prev,
					loading: false,
					refreshing: false,
					error: response.error || 'Failed to fetch data',
				}));
			}
		} catch (error) {
			if (!mountedRef.current) return;
			
			setState(prev => ({
				...prev,
				loading: false,
				refreshing: false,
				error: error instanceof Error ? error.message : 'An error occurred',
			}));
		}
	}, [fetchFunction]);

	const refresh = useCallback(async () => {
		await fetchData(true);
	}, [fetchData]);

	const clearError = useCallback(() => {
		setState(prev => ({ ...prev, error: null }));
	}, []);

	const invalidateCache = useCallback(() => {
		if (enableCache) {
			ContentApiService.clearAllCache();
		}
	}, [enableCache]);

	// Initial load
	useEffect(() => {
		if (initialLoad) {
			fetchData();
		}
	}, dependencies);

	// Auto refresh setup
	useEffect(() => {
		if (autoRefresh && refreshInterval > 0) {
			refreshTimeoutRef.current = setInterval(() => {
				if (mountedRef.current) {
					fetchData(true);
				}
			}, refreshInterval);

			return () => {
				if (refreshTimeoutRef.current) {
					clearInterval(refreshTimeoutRef.current);
				}
			};
		}
	}, [autoRefresh, refreshInterval, fetchData]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			mountedRef.current = false;
			if (refreshTimeoutRef.current) {
				clearInterval(refreshTimeoutRef.current);
			}
		};
	}, []);

	return {
		state,
		refresh,
		clearError,
		invalidateCache,
	};
}

// Specialized hooks for different content types

export function useLevelsWithModules(options?: UseContentOptions) {
	return useContent(
		() => ContentApiService.getLevelsWithModules(),
		[],
		options
	);
}

export function useModuleWithLessons(moduleId: number, options?: UseContentOptions) {
	return useContent(
		() => ContentApiService.getModuleWithLessons(moduleId),
		[moduleId],
		options
	);
}

export function useLessonWithContent(lessonId: number, includeRelated = true, options?: UseContentOptions) {
	return useContent(
		() => ContentApiService.getLessonWithContent(lessonId, includeRelated),
		[lessonId, includeRelated],
		options
	);
}

export function usePersonalizedLearningPath(
	userId: string, 
	targetLevel: DifficultyLevel, 
	options?: UseContentOptions
) {
	return useContent(
		() => ContentApiService.getPersonalizedLearningPath(userId, targetLevel),
		[userId, targetLevel],
		options
	);
}

// Search hook with debouncing
export function useContentSearch(
	searchTerm: string,
	contentTypes: string[] = ['lessons', 'vocabulary', 'grammar'],
	debounceMs = 300
) {
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
		}

		debounceTimeoutRef.current = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, debounceMs);

		return () => {
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
			}
		};
	}, [searchTerm, debounceMs]);

	return useContent(
		() => ContentApiService.searchContent(debouncedSearchTerm, contentTypes),
		[debouncedSearchTerm, contentTypes.join(',')],
		{ initialLoad: !!debouncedSearchTerm }
	);
}

// Optimistic update hook for content management
export function useOptimisticContent<T>(
	initialData: T | null = null
) {
	const [data, setData] = useState<T | null>(initialData);
	const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, any>>(new Map());

	const applyOptimisticUpdate = useCallback((id: string, update: Partial<T>) => {
		setOptimisticUpdates(prev => new Map(prev).set(id, update));
		
		// Apply the update to the data
		if (data && typeof data === 'object' && 'id' in data) {
			if ((data as any).id === id) {
				setData(prev => prev ? { ...prev, ...update } : prev);
			}
		}
	}, [data]);

	const commitOptimisticUpdate = useCallback((id: string, finalData: T) => {
		setOptimisticUpdates(prev => {
			const newMap = new Map(prev);
			newMap.delete(id);
			return newMap;
		});
		setData(finalData);
	}, []);

	const revertOptimisticUpdate = useCallback((id: string, originalData: T) => {
		setOptimisticUpdates(prev => {
			const newMap = new Map(prev);
			newMap.delete(id);
			return newMap;
		});
		setData(originalData);
	}, []);

	return {
		data,
		setData,
		applyOptimisticUpdate,
		commitOptimisticUpdate,
		revertOptimisticUpdate,
		hasOptimisticUpdates: optimisticUpdates.size > 0,
	};
}

// Cache status hook
export function useCacheStatus() {
	const [cacheStats, setCacheStats] = useState(() => ContentApiService.getCacheStats());

	const refreshStats = useCallback(() => {
		setCacheStats(ContentApiService.getCacheStats());
	}, []);

	const clearCache = useCallback(() => {
		ContentApiService.clearAllCache();
		refreshStats();
	}, [refreshStats]);

	useEffect(() => {
		// Refresh stats every 30 seconds
		const interval = setInterval(refreshStats, 30000);
		return () => clearInterval(interval);
	}, [refreshStats]);

	return {
		cacheStats,
		refreshStats,
		clearCache,
	};
}

// Content sync hook for offline support
export function useContentSync() {
	const [lastSyncTime, setLastSyncTime] = useState<string | null>(
		localStorage.getItem('lastContentSync')
	);
	const [syncing, setSyncing] = useState(false);
	const [syncError, setSyncError] = useState<string | null>(null);

	const syncContent = useCallback(async () => {
		setSyncing(true);
		setSyncError(null);

		try {
			const response = await ContentApiService.syncContentUpdates(lastSyncTime || undefined);
			
			if (response.success) {
				const now = new Date().toISOString();
				setLastSyncTime(now);
				localStorage.setItem('lastContentSync', now);
			} else {
				setSyncError(response.error || 'Sync failed');
			}
		} catch (error) {
			setSyncError(error instanceof Error ? error.message : 'Sync failed');
		} finally {
			setSyncing(false);
		}
	}, [lastSyncTime]);

	return {
		lastSyncTime,
		syncing,
		syncError,
		syncContent,
	};
}
