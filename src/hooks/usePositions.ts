import { useState, useEffect, useCallback } from 'react';
import { Position, CreatePositionParams } from '@/types/position';
import { Trade, RecordTradeParams } from '@/types/trade';
import { PositionService } from '@/services/position-service';

/**
 * Custom hook for managing positions
 * Provides CRUD operations and real-time updates
 */
export function usePositions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const positionService = new PositionService();

  /**
   * Load positions and trades from storage
   */
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [loadedPositions, loadedTrades] = await Promise.all([
        positionService.getAllPositions(),
        positionService.storageService.loadTrades(),
      ]);

      setPositions(loadedPositions);
      setTrades(loadedTrades);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new position
   */
  const createPosition = useCallback(async (params: CreatePositionParams): Promise<Position> => {
    try {
      setError(null);
      const newPosition = await positionService.createPosition(params);
      setPositions(prev => [...prev, newPosition]);
      return newPosition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create position';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Update position with current price for simulation
   */
  const updatePositionPrice = useCallback(async (positionId: string, currentPrice: number): Promise<Position> => {
    try {
      setError(null);
      const updatedPosition = await positionService.updateCurrentPrice(positionId, currentPrice);

      // Update position in state (simulation only, not persisted)
      setPositions(prev =>
        prev.map(p => p.id === positionId ? updatedPosition : p)
      );

      return updatedPosition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update price';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Record a trade for a position
   */
  const recordTrade = useCallback(async (params: RecordTradeParams): Promise<{ position: Position; trade: Trade }> => {
    try {
      setError(null);
      const result = await positionService.recordTrade(params);

      // Update state
      setPositions(prev =>
        prev.map(p => p.id === result.position.id ? result.position : p)
      );
      setTrades(prev => [...prev, result.trade]);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record trade';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Delete a position
   */
  const deletePosition = useCallback(async (positionId: string): Promise<void> => {
    try {
      setError(null);
      await positionService.deletePosition(positionId);

      // Update state
      setPositions(prev => prev.filter(p => p.id !== positionId));
      setTrades(prev => prev.filter(t => t.positionId !== positionId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete position';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Get position by ID
   */
  const getPosition = useCallback((id: string): Position | undefined => {
    return positions.find(p => p.id === id);
  }, [positions]);

  /**
   * Get trades for a specific position
   */
  const getPositionTrades = useCallback((positionId: string): Trade[] => {
    return trades.filter(t => t.positionId === positionId);
  }, [trades]);

  /**
   * Clear all data
   */
  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await positionService.storageService.clearAll();
      setPositions([]);
      setTrades([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Refresh data from storage
   */
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Data
    positions,
    trades,
    isLoading,
    error,

    // Actions
    createPosition,
    updatePositionPrice,
    recordTrade,
    deletePosition,
    clearAllData,
    refreshData,

    // Getters
    getPosition,
    getPositionTrades,
  };
}