/**
 * Current stop-loss configuration with automatic progression
 * Maps to FR-003, FR-005, FR-006: Stop-loss management and progression
 */
export interface StopLoss {
  /** Current stop-loss trigger price */
  price: number;

  /** Current status of stop-loss progression */
  status: StopLossStatus;

  /** History of stop-loss changes */
  progressionHistory: StopLossHistoryEntry[];
}

/**
 * Status of stop-loss progression in sell-in-thirds strategy
 */
export enum StopLossStatus {
  /** Initial stop-loss at -20% of buy price */
  INITIAL = 'initial',

  /** Stop-loss moved to breakeven (buy price) after first sale */
  BREAKEVEN = 'breakeven',

  /** User-adjusted stop-loss (custom value) */
  CUSTOM = 'custom',
}

/**
 * Historical entry for stop-loss changes
 */
export interface StopLossHistoryEntry {
  /** Stop-loss price at this time */
  price: number;

  /** Status at this time */
  status: StopLossStatus;

  /** When this change occurred */
  changedAt: Date;

  /** Reason for the change */
  reason: string;
}