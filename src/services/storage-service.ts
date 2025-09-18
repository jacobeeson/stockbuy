import { Position } from '@/types/position';
import { Trade } from '@/types/trade';

/**
 * Storage health information
 */
export interface StorageHealth {
  /** Whether sessionStorage is available */
  available: boolean;

  /** Estimated space used in bytes */
  spaceUsed: number;

  /** Estimated space remaining in bytes */
  spaceRemaining: number;

  /** Whether storage quota is exceeded */
  quotaExceeded: boolean;
}

/**
 * Storage service for session-only persistence
 * Maps to FR-011: System MUST store position data in session-only storage
 */
export class StorageService {
  private readonly STORAGE_KEYS = {
    POSITIONS: 'trading_tracker_positions',
    TRADES: 'trading_tracker_trades',
    SETTINGS: 'trading_tracker_settings',
  } as const;

  private readonly ESTIMATED_QUOTA = 5 * 1024 * 1024; // 5MB typical sessionStorage quota

  /**
   * Save positions to sessionStorage
   * Maps to FR-011: System MUST store position data in session-only storage
   */
  async savePositions(positions: Position[]): Promise<void> {
    try {
      const serialized = JSON.stringify(positions, this.dateReplacer);
      this.setStorageItem(this.STORAGE_KEYS.POSITIONS, serialized);
    } catch (error) {
      this.handleStorageError(error, 'save positions');
    }
  }

  /**
   * Load positions from sessionStorage
   */
  async loadPositions(): Promise<Position[]> {
    try {
      const stored = this.getStorageItem(this.STORAGE_KEYS.POSITIONS);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored, this.dateReviver);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to load positions from storage:', error);
      return [];
    }
  }

  /**
   * Save trades to sessionStorage
   */
  async saveTrades(trades: Trade[]): Promise<void> {
    try {
      const serialized = JSON.stringify(trades, this.dateReplacer);
      this.setStorageItem(this.STORAGE_KEYS.TRADES, serialized);
    } catch (error) {
      this.handleStorageError(error, 'save trades');
    }
  }

  /**
   * Load trades from sessionStorage
   */
  async loadTrades(): Promise<Trade[]> {
    try {
      const stored = this.getStorageItem(this.STORAGE_KEYS.TRADES);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored, this.dateReviver);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to load trades from storage:', error);
      return [];
    }
  }

  /**
   * Clear all trading tracker data from sessionStorage
   */
  async clearAll(): Promise<void> {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        this.removeStorageItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error('Failed to clear storage data');
    }
  }

  /**
   * Check storage availability and usage
   */
  async checkStorageHealth(): Promise<StorageHealth> {
    try {
      // Check if sessionStorage is available
      if (!this.isStorageAvailable()) {
        return {
          available: false,
          spaceUsed: 0,
          spaceRemaining: 0,
          quotaExceeded: false,
        };
      }

      // Calculate space usage
      const spaceUsed = this.calculateStorageUsage();
      const spaceRemaining = Math.max(0, this.ESTIMATED_QUOTA - spaceUsed);
      const quotaExceeded = spaceUsed >= this.ESTIMATED_QUOTA;

      return {
        available: true,
        spaceUsed,
        spaceRemaining,
        quotaExceeded,
      };
    } catch (error) {
      return {
        available: false,
        spaceUsed: 0,
        spaceRemaining: 0,
        quotaExceeded: true,
      };
    }
  }

  /**
   * Get storage item safely
   */
  private getStorageItem(key: string): string | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get storage item ${key}:`, error);
      return null;
    }
  }

  /**
   * Set storage item safely
   */
  private setStorageItem(key: string, value: string): void {
    if (!this.isStorageAvailable()) {
      throw new Error('SessionStorage is not available');
    }

    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        throw new Error('Storage quota exceeded. Please clear some data.');
      }
      throw new Error(`Failed to save data: ${error}`);
    }
  }

  /**
   * Remove storage item safely
   */
  private removeStorageItem(key: string): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove storage item ${key}:`, error);
    }
  }

  /**
   * Check if sessionStorage is available
   */
  private isStorageAvailable(): boolean {
    try {
      if (typeof Storage === 'undefined' || !sessionStorage) {
        return false;
      }

      // Test storage access
      const testKey = '__storage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate approximate storage usage in bytes
   */
  private calculateStorageUsage(): number {
    if (!this.isStorageAvailable()) {
      return 0;
    }

    let totalSize = 0;
    Object.values(this.STORAGE_KEYS).forEach(key => {
      const item = this.getStorageItem(key);
      if (item) {
        // Approximate UTF-16 encoding (2 bytes per character)
        totalSize += item.length * 2;
      }
    });

    return totalSize;
  }

  /**
   * Check if error is quota exceeded
   */
  private isQuotaExceededError(error: any): boolean {
    return (
      error instanceof DOMException &&
      (error.code === 22 ||
        error.code === 1014 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    );
  }

  /**
   * Handle storage errors consistently
   */
  private handleStorageError(error: any, operation: string): void {
    if (this.isQuotaExceededError(error)) {
      throw new Error(`Storage quota exceeded while trying to ${operation}. Please clear some data.`);
    }

    if (!this.isStorageAvailable()) {
      throw new Error('SessionStorage is not available');
    }

    console.error(`Storage operation failed (${operation}):`, error);
    throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
  }

  /**
   * JSON replacer function to handle Date serialization
   */
  private dateReplacer(key: string, value: any): any {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  }

  /**
   * JSON reviver function to handle Date deserialization
   */
  private dateReviver(key: string, value: any): any {
    if (typeof value === 'object' && value !== null && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  }

  /**
   * Save application settings
   */
  async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      const serialized = JSON.stringify(settings);
      this.setStorageItem(this.STORAGE_KEYS.SETTINGS, serialized);
    } catch (error) {
      this.handleStorageError(error, 'save settings');
    }
  }

  /**
   * Load application settings
   */
  async loadSettings(): Promise<Record<string, any>> {
    try {
      const stored = this.getStorageItem(this.STORAGE_KEYS.SETTINGS);
      if (!stored) {
        return {};
      }

      const parsed = JSON.parse(stored);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
      console.warn('Failed to load settings from storage:', error);
      return {};
    }
  }
}