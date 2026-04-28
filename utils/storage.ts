import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { Subscription } from '../constants/types';

const SUBSCRIPTIONS_KEY = 'subscriptions';
const STORAGE_PROBE_KEY = '@allsub/storage-probe';
const STORAGE_FILE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}allsub-subscriptions.json`
  : null;

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem?: (key: string) => Promise<void>;
};

const memoryStorage = new Map<string, string>();

const webStorage: StorageAdapter = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => {
    localStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    localStorage.removeItem(key);
  },
};

const memoryFallbackStorage: StorageAdapter = {
  getItem: async (key) => memoryStorage.get(key) ?? null,
  setItem: async (key, value) => {
    memoryStorage.set(key, value);
  },
  removeItem: async (key) => {
    memoryStorage.delete(key);
  },
};

const fileFallbackStorage: StorageAdapter = {
  getItem: async (key) => {
    if (!STORAGE_FILE_URI || key !== SUBSCRIPTIONS_KEY) {
      return memoryFallbackStorage.getItem(key);
    }

    const fileInfo = await FileSystem.getInfoAsync(STORAGE_FILE_URI);
    if (!fileInfo.exists) {
      return null;
    }

    return FileSystem.readAsStringAsync(STORAGE_FILE_URI);
  },
  setItem: async (key, value) => {
    if (!STORAGE_FILE_URI || key !== SUBSCRIPTIONS_KEY) {
      return memoryFallbackStorage.setItem(key, value);
    }

    await FileSystem.writeAsStringAsync(STORAGE_FILE_URI, value);
  },
  removeItem: async (key) => {
    if (!STORAGE_FILE_URI || key !== SUBSCRIPTIONS_KEY) {
      return memoryFallbackStorage.removeItem?.(key);
    }

    const fileInfo = await FileSystem.getInfoAsync(STORAGE_FILE_URI);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(STORAGE_FILE_URI, { idempotent: true });
    }
  },
};

let resolvedNativeStorage: Promise<StorageAdapter> | null = null;
let hasWarnedAboutFallback = false;

const logFallbackWarning = (error: unknown) => {
  if (hasWarnedAboutFallback) {
    return;
  }

  hasWarnedAboutFallback = true;
  console.warn('AsyncStorage native module unavailable, falling back to file storage.', error);
};

const resolveStorage = async (): Promise<StorageAdapter> => {
  if (Platform.OS === 'web') {
    return webStorage;
  }

  if (!resolvedNativeStorage) {
    resolvedNativeStorage = (async () => {
      try {
        await AsyncStorage.getItem(STORAGE_PROBE_KEY);
        return AsyncStorage;
      } catch (error) {
        logFallbackWarning(error);
        return fileFallbackStorage;
      }
    })();
  }

  return resolvedNativeStorage;
};

export const loadSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const storage = await resolveStorage();
    const subscriptionsJson = await storage.getItem(SUBSCRIPTIONS_KEY);
    if (subscriptionsJson) {
      return JSON.parse(subscriptionsJson);
    }
    return [];
  } catch (error) {
    console.error('Error loading subscriptions:', error);
    return [];
  }
};

export const saveSubscriptions = async (subscriptions: Subscription[]): Promise<void> => {
  try {
    const storage = await resolveStorage();
    const subscriptionsJson = JSON.stringify(subscriptions);
    await storage.setItem(SUBSCRIPTIONS_KEY, subscriptionsJson);
  } catch (error) {
    console.error('Error saving subscriptions:', error);
    throw error;
  }
};

export const addSubscription = async (subscription: Subscription): Promise<void> => {
  try {
    const subscriptions = await loadSubscriptions();
    subscriptions.push(subscription);
    await saveSubscriptions(subscriptions);
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (id: string, updates: Partial<Subscription>): Promise<void> => {
  try {
    const subscriptions = await loadSubscriptions();
    const index = subscriptions.findIndex(sub => sub.id === id);
    if (index !== -1) {
      subscriptions[index] = { ...subscriptions[index], ...updates };
      await saveSubscriptions(subscriptions);
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const deleteSubscription = async (id: string): Promise<void> => {
  try {
    const subscriptions = await loadSubscriptions();
    const filteredSubscriptions = subscriptions.filter(sub => sub.id !== id);
    if (filteredSubscriptions.length === 0) {
      const storage = await resolveStorage();
      await storage.removeItem?.(SUBSCRIPTIONS_KEY);
      return;
    }

    await saveSubscriptions(filteredSubscriptions);
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};
