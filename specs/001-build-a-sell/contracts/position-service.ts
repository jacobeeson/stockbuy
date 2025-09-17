/**
 * Position Service Contract
 * Defines the interface for managing trading positions
 */

import { Position, Trade, SellTargets, StopLoss } from '../types';

export interface PositionService {
  /**
   * Create a new trading position
   * Maps to FR-001: System MUST allow users to create new stock positions
   */
  createPosition(params: CreatePositionParams): Promise<Position>;

  /**
   * Get all active positions
   * Maps to FR-010: System MUST display all active positions in portfolio view
   */
  getAllPositions(): Promise<Position[]>;

  /**
   * Get a specific position by ID
   */
  getPosition(id: string): Promise<Position | null>;

  /**
   * Update position with current market price for simulation
   * Maps to FR-007, FR-008: Interactive price slider and profit/loss calculation
   */
  updateCurrentPrice(positionId: string, currentPrice: number): Promise<Position>;

  /**
   * Record a trade (partial sale) for a position
   * Maps to FR-004: System MUST allow users to record partial sales
   */
  recordTrade(params: RecordTradeParams): Promise<{ position: Position; trade: Trade }>;

  /**
   * Delete a position and all associated trades
   */
  deletePosition(positionId: string): Promise<void>;

  /**
   * Calculate real-time metrics for all positions
   * Maps to FR-017: System MUST calculate position-level and portfolio-level risk metrics
   */
  calculatePortfolioMetrics(currentPrices: Record<string, number>): Promise<PortfolioMetrics>;
}

export interface CreatePositionParams {
  ticker: string;           // Stock symbol (validated: /^[A-Z]{1,5}$/)
  buyPrice: number;         // Purchase price per share (> 0)
  originalShares: number;   // Number of shares purchased (positive integer)
}

export interface RecordTradeParams {
  positionId: string;
  sharesSold: number;       // Must be <= position.remainingShares
  sellPrice: number;        // Sale price per share (> 0)
  tradeType?: TradeType;    // Optional, auto-detected based on price targets
}

export interface PortfolioMetrics {
  totalPositions: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercent: number;
  realizedProfit: number;
  unrealizedProfit: number;
  positionsAtTarget: number;        // Positions where current price >= first target
  positionsAtStopLoss: number;      // Positions where current price <= stop loss
  averageReturnPercent: number;
  calculatedAt: Date;
}

export enum TradeType {
  FIRST_TARGET = 'first_target',
  SECOND_TARGET = 'second_target',
  STOP_LOSS = 'stop_loss',
  MANUAL = 'manual'
}

/**
 * Calculation Service Contract
 * Pure functions for financial calculations
 */
export interface CalculationService {
  /**
   * Calculate sell targets for sell-in-thirds strategy
   * Maps to FR-002: System MUST automatically calculate sell targets at +50% and +100%
   */
  calculateSellTargets(buyPrice: number, originalShares: number): SellTargets;

  /**
   * Calculate initial stop-loss price
   * Maps to FR-003: System MUST set initial stop-loss at -20%
   */
  calculateInitialStopLoss(buyPrice: number): number;

  /**
   * Calculate profit/loss for a position at given current price
   * Maps to FR-008: System MUST calculate and display real-time profit/loss
   */
  calculateProfitLoss(position: Position, currentPrice: number): ProfitLossMetrics;

  /**
   * Determine which targets or stop-losses would be triggered at a given price
   * Maps to FR-009: System MUST show which targets or stop-losses would be triggered
   */
  analyzeTriggeredLevels(position: Position, currentPrice: number): TriggeredLevels;

  /**
   * Calculate new stop-loss after trade execution
   * Maps to FR-005, FR-006: Stop-loss progression rules
   */
  calculateProgressedStopLoss(position: Position, completedTrades: Trade[]): StopLoss;
}

export interface ProfitLossMetrics {
  totalValue: number;           // remainingShares * currentPrice
  totalCost: number;           // originalShares * buyPrice
  unrealizedProfit: number;    // totalValue - (remainingShares * buyPrice)
  unrealizedProfitPercent: number;
  realizedProfit: number;      // Sum of profits from completed trades
  totalProfit: number;         // realizedProfit + unrealizedProfit
  totalProfitPercent: number;
}

export interface TriggeredLevels {
  isAtFirstTarget: boolean;     // currentPrice >= firstTarget
  isAtSecondTarget: boolean;    // currentPrice >= secondTarget
  isAtStopLoss: boolean;       // currentPrice <= stopLoss.price
  recommendedAction: RecommendedAction;
  triggerPrices: {
    firstTarget: number;
    secondTarget: number;
    stopLoss: number;
  };
}

export enum RecommendedAction {
  HOLD = 'hold',
  SELL_FIRST_THIRD = 'sell_first_third',
  SELL_SECOND_THIRD = 'sell_second_third',
  TRIGGER_STOP_LOSS = 'trigger_stop_loss'
}

/**
 * Storage Service Contract
 * Manages sessionStorage persistence
 */
export interface StorageService {
  /**
   * Save positions to sessionStorage
   * Maps to FR-011: System MUST store position data in session-only storage
   */
  savePositions(positions: Position[]): Promise<void>;

  /**
   * Load positions from sessionStorage
   */
  loadPositions(): Promise<Position[]>;

  /**
   * Save trades to sessionStorage
   */
  saveTrades(trades: Trade[]): Promise<void>;

  /**
   * Load trades from sessionStorage
   */
  loadTrades(): Promise<Trade[]>;

  /**
   * Clear all data from sessionStorage
   */
  clearAll(): Promise<void>;

  /**
   * Check if storage is available and has space
   */
  checkStorageHealth(): Promise<StorageHealth>;
}

export interface StorageHealth {
  available: boolean;
  spaceUsed: number;        // In bytes
  spaceRemaining: number;   // In bytes
  quotaExceeded: boolean;
}

/**
 * Validation Service Contract
 * Input validation and business rule enforcement
 */
export interface ValidationService {
  /**
   * Validate position creation parameters
   * Maps to FR-015: System MUST validate ticker symbols are properly formatted
   */
  validateCreatePosition(params: CreatePositionParams): ValidationResult;

  /**
   * Validate trade recording parameters
   * Maps to FR-016: System MUST prevent users from selling more shares than they own
   */
  validateRecordTrade(params: RecordTradeParams, position: Position): ValidationResult;

  /**
   * Validate price input from slider
   * Maps to FR-012: System MUST accept manual price input via interactive slider
   */
  validatePriceInput(price: number): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: ValidationErrorCode;
}

export enum ValidationErrorCode {
  REQUIRED = 'required',
  INVALID_FORMAT = 'invalid_format',
  OUT_OF_RANGE = 'out_of_range',
  INSUFFICIENT_SHARES = 'insufficient_shares',
  DUPLICATE_TICKER = 'duplicate_ticker'
}