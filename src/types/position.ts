import { SellTargets } from './sell-targets';
import { StopLoss } from './stop-loss';

/**
 * Represents a stock trading position in the sell-in-thirds strategy
 * Maps to FR-001, FR-010: Position creation and portfolio display
 */
export interface Position {
  /** Unique identifier for the position */
  id: string;

  /** Stock ticker symbol (1-5 uppercase letters) */
  ticker: string;

  /** Purchase price per share */
  buyPrice: number;

  /** Initial number of shares purchased */
  originalShares: number;

  /** Current number of shares remaining (after sales) */
  remainingShares: number;

  /** Calculated sell target prices and share allocations */
  sellTargets: SellTargets;

  /** Current stop-loss configuration and history */
  stopLoss: StopLoss;

  /** When the position was created */
  createdAt: Date;

  /** Current simulated price from slider (optional) */
  currentPrice?: number;
}

/**
 * Status of a position based on sales completed
 */
export enum PositionStatus {
  /** No sales completed yet */
  ACTIVE = 'active',

  /** First third has been sold */
  PARTIALLY_SOLD = 'partially_sold',

  /** First and second thirds have been sold */
  MOSTLY_SOLD = 'mostly_sold',

  /** All shares have been sold */
  CLOSED = 'closed',
}

/**
 * Parameters for creating a new position
 * Maps to FR-001: System MUST allow users to create new stock positions
 */
export interface CreatePositionParams {
  /** Stock ticker symbol (validated: /^[A-Z]{1,5}$/) */
  ticker: string;

  /** Purchase price per share (must be positive) */
  buyPrice: number;

  /** Number of shares purchased (must be positive integer) */
  originalShares: number;
}