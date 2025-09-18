import { Position } from './position';

/**
 * Aggregate portfolio metrics and data
 * Maps to FR-010, FR-017: Portfolio view and risk metrics
 */
export interface Portfolio {
  /** All active positions */
  positions: Position[];

  /** Total current value of all positions */
  totalValue: number;

  /** Total cost basis of all positions */
  totalCost: number;

  /** Total profit/loss (totalValue - totalCost) */
  totalProfit: number;

  /** Total profit percentage ((totalProfit / totalCost) * 100) */
  totalProfitPercent: number;

  /** Profit from completed trades */
  realizedProfit: number;

  /** Profit from current position values */
  unrealizedProfit: number;

  /** When these metrics were calculated */
  calculatedAt: Date;
}

/**
 * Risk and performance metrics for portfolio analysis
 * Maps to FR-017: Position-level and portfolio-level risk metrics
 */
export interface PortfolioMetrics {
  /** Total number of positions */
  totalPositions: number;

  /** Total market value of all positions */
  totalValue: number;

  /** Total cost basis of all positions */
  totalCost: number;

  /** Total profit/loss */
  totalProfit: number;

  /** Total profit percentage */
  totalProfitPercent: number;

  /** Realized profit from completed trades */
  realizedProfit: number;

  /** Unrealized profit from current values */
  unrealizedProfit: number;

  /** Number of positions at or above first target */
  positionsAtTarget: number;

  /** Number of positions at or below stop-loss */
  positionsAtStopLoss: number;

  /** Average return percentage across all positions */
  averageReturnPercent: number;

  /** When these metrics were calculated */
  calculatedAt: Date;
}