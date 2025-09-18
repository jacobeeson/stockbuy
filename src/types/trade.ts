/**
 * Represents a completed trade (partial sale) of a position
 * Maps to FR-004: System MUST allow users to record partial sales
 */
export interface Trade {
  /** Unique identifier for the trade */
  id: string;

  /** Reference to the parent position */
  positionId: string;

  /** Number of shares sold in this trade */
  sharesSold: number;

  /** Price per share at time of sale */
  sellPrice: number;

  /** Total value of the trade (sharesSold * sellPrice) */
  totalValue: number;

  /** Profit from this trade ((sellPrice - buyPrice) * sharesSold) */
  profit: number;

  /** Profit percentage ((sellPrice - buyPrice) / buyPrice * 100) */
  profitPercent: number;

  /** When the trade was executed */
  executedAt: Date;

  /** Type of trade (which target was hit or manual) */
  tradeType: TradeType;
}

/**
 * Type of trade based on sell-in-thirds strategy
 */
export enum TradeType {
  /** Sale at +50% target */
  FIRST_TARGET = 'first_target',

  /** Sale at +100% target */
  SECOND_TARGET = 'second_target',

  /** Sale triggered by stop-loss */
  STOP_LOSS = 'stop_loss',

  /** Manual sale by user */
  MANUAL = 'manual',
}

/**
 * Parameters for recording a trade
 * Maps to FR-004, FR-016: Trade recording with validation
 */
export interface RecordTradeParams {
  /** ID of the position to trade */
  positionId: string;

  /** Number of shares to sell (must be <= remainingShares) */
  sharesSold: number;

  /** Sale price per share (must be positive) */
  sellPrice: number;

  /** Optional trade type (auto-detected if not provided) */
  tradeType?: TradeType;
}