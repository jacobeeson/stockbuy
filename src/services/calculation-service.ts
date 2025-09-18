import { Position } from '@/types/position';
import { Trade } from '@/types/trade';
import { SellTargets } from '@/types/sell-targets';
import { StopLoss, StopLossStatus, StopLossHistoryEntry } from '@/types/stop-loss';

/**
 * Profit/loss metrics for a position at current price
 */
export interface ProfitLossMetrics {
  /** Current total value (remainingShares * currentPrice) */
  totalValue: number;

  /** Total cost basis (originalShares * buyPrice) */
  totalCost: number;

  /** Unrealized profit/loss on remaining shares */
  unrealizedProfit: number;

  /** Unrealized profit percentage */
  unrealizedProfitPercent: number;

  /** Realized profit from completed trades */
  realizedProfit: number;

  /** Total profit (realized + unrealized) */
  totalProfit: number;

  /** Total profit percentage */
  totalProfitPercent: number;
}

/**
 * Analysis of triggered price levels
 */
export interface TriggeredLevels {
  /** Whether current price >= first target */
  isAtFirstTarget: boolean;

  /** Whether current price >= second target */
  isAtSecondTarget: boolean;

  /** Whether current price <= stop-loss */
  isAtStopLoss: boolean;

  /** Recommended action based on current price */
  recommendedAction: RecommendedAction;

  /** All trigger prices for reference */
  triggerPrices: {
    firstTarget: number;
    secondTarget: number;
    stopLoss: number;
  };
}

/**
 * Recommended actions based on price analysis
 */
export enum RecommendedAction {
  /** Hold position, no targets triggered */
  HOLD = 'hold',

  /** First target reached, sell first third */
  SELL_FIRST_THIRD = 'sell_first_third',

  /** Second target reached, sell second third */
  SELL_SECOND_THIRD = 'sell_second_third',

  /** Stop-loss triggered, exit position */
  TRIGGER_STOP_LOSS = 'trigger_stop_loss',
}

/**
 * Pure calculation functions for financial operations
 * Maps to FR-002, FR-003, FR-008, FR-009: Calculations and analysis
 */
export class CalculationService {
  /**
   * Calculate sell targets for sell-in-thirds strategy
   * Maps to FR-002: System MUST automatically calculate sell targets at +50% and +100%
   */
  calculateSellTargets(buyPrice: number, originalShares: number): SellTargets {
    // Validate inputs
    if (buyPrice <= 0) {
      throw new Error('Buy price must be positive');
    }
    if (originalShares <= 0 || !Number.isInteger(originalShares)) {
      throw new Error('Original shares must be a positive integer');
    }

    // Calculate target prices
    const firstTarget = Number((buyPrice * 1.5).toFixed(2));
    const secondTarget = Number((buyPrice * 2.0).toFixed(2));

    // Calculate share allocations
    const firstTargetShares = Math.floor(originalShares / 3);
    const secondTargetShares = Math.floor(originalShares / 3);
    const remainingShares = originalShares - firstTargetShares - secondTargetShares;

    return {
      firstTarget,
      secondTarget,
      firstTargetShares,
      secondTargetShares,
      remainingShares,
    };
  }

  /**
   * Calculate initial stop-loss price at -20%
   * Maps to FR-003: System MUST set initial stop-loss at -20%
   */
  calculateInitialStopLoss(buyPrice: number): number {
    if (buyPrice <= 0) {
      throw new Error('Buy price must be positive');
    }

    return Number((buyPrice * 0.8).toFixed(2));
  }

  /**
   * Calculate profit/loss metrics for a position at given current price
   * Maps to FR-008: System MUST calculate and display real-time profit/loss
   */
  calculateProfitLoss(position: Position, currentPrice: number, completedTrades: Trade[] = []): ProfitLossMetrics {
    if (currentPrice <= 0) {
      throw new Error('Current price must be positive');
    }

    // Calculate current values
    const totalValue = position.remainingShares * currentPrice;
    const totalCost = position.originalShares * position.buyPrice;

    // Calculate unrealized profit on remaining shares
    const unrealizedProfit = Number(((currentPrice - position.buyPrice) * position.remainingShares).toFixed(2));
    const unrealizedProfitPercent = Number((((currentPrice - position.buyPrice) / position.buyPrice) * 100).toFixed(2));

    // Calculate realized profit from completed trades
    const realizedProfit = completedTrades
      .filter(trade => trade.positionId === position.id)
      .reduce((sum, trade) => sum + trade.profit, 0);

    // Calculate total profit
    const totalProfit = Number((realizedProfit + unrealizedProfit).toFixed(2));
    const totalProfitPercent = Number(((totalProfit / totalCost) * 100).toFixed(2));

    return {
      totalValue: Number(totalValue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      unrealizedProfit,
      unrealizedProfitPercent,
      realizedProfit: Number(realizedProfit.toFixed(2)),
      totalProfit,
      totalProfitPercent,
    };
  }

  /**
   * Analyze which targets or stop-losses would be triggered at current price
   * Maps to FR-009: System MUST show which targets or stop-losses would be triggered
   */
  analyzeTriggeredLevels(position: Position, currentPrice: number): TriggeredLevels {
    if (currentPrice <= 0) {
      throw new Error('Current price must be positive');
    }

    const isAtFirstTarget = currentPrice >= position.sellTargets.firstTarget;
    const isAtSecondTarget = currentPrice >= position.sellTargets.secondTarget;
    const isAtStopLoss = currentPrice <= position.stopLoss.price;

    // Determine recommended action
    let recommendedAction: RecommendedAction;
    if (isAtStopLoss) {
      recommendedAction = RecommendedAction.TRIGGER_STOP_LOSS;
    } else if (isAtSecondTarget) {
      recommendedAction = RecommendedAction.SELL_SECOND_THIRD;
    } else if (isAtFirstTarget) {
      recommendedAction = RecommendedAction.SELL_FIRST_THIRD;
    } else {
      recommendedAction = RecommendedAction.HOLD;
    }

    return {
      isAtFirstTarget,
      isAtSecondTarget,
      isAtStopLoss,
      recommendedAction,
      triggerPrices: {
        firstTarget: position.sellTargets.firstTarget,
        secondTarget: position.sellTargets.secondTarget,
        stopLoss: position.stopLoss.price,
      },
    };
  }

  /**
   * Calculate new stop-loss after trade execution with progression rules
   * Maps to FR-005, FR-006: Stop-loss progression rules
   */
  calculateProgressedStopLoss(position: Position, completedTrades: Trade[]): StopLoss {
    const positionTrades = completedTrades.filter(trade => trade.positionId === position.id);
    const currentHistory = [...position.stopLoss.progressionHistory];

    // If no trades yet, return current stop-loss
    if (positionTrades.length === 0) {
      return position.stopLoss;
    }

    // Count target trades (excluding manual and stop-loss trades)
    const targetTrades = positionTrades.filter(
      trade => trade.tradeType === 'first_target' || trade.tradeType === 'second_target'
    );

    // If at least one target trade completed, move to breakeven
    if (targetTrades.length > 0 && position.stopLoss.status === StopLossStatus.INITIAL) {
      const newEntry: StopLossHistoryEntry = {
        price: position.buyPrice,
        status: StopLossStatus.BREAKEVEN,
        changedAt: new Date(),
        reason: 'First third sold - moved to breakeven',
      };

      return {
        price: position.buyPrice,
        status: StopLossStatus.BREAKEVEN,
        progressionHistory: [...currentHistory, newEntry],
      };
    }

    // If already at breakeven or custom, maintain current state
    return position.stopLoss;
  }

  /**
   * Helper method to round financial values consistently
   */
  private roundToFinancialPrecision(value: number): number {
    return Number(value.toFixed(2));
  }

  /**
   * Helper method to validate numerical inputs
   */
  private validatePositiveNumber(value: number, fieldName: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${fieldName} must be a positive number`);
    }
  }
}