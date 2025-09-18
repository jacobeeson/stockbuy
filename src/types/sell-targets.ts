/**
 * Calculated sell target prices for the sell-in-thirds strategy
 * Maps to FR-002: System MUST automatically calculate sell targets at +50% and +100%
 */
export interface SellTargets {
  /** First sell target at +50% of buy price (buyPrice * 1.5) */
  firstTarget: number;

  /** Second sell target at +100% of buy price (buyPrice * 2.0) */
  secondTarget: number;

  /** Number of shares to sell at first target (Math.floor(originalShares / 3)) */
  firstTargetShares: number;

  /** Number of shares to sell at second target (Math.floor(originalShares / 3)) */
  secondTargetShares: number;

  /** Remaining shares after both target sales (originalShares - firstTargetShares - secondTargetShares) */
  remainingShares: number;
}