import { Position, CreatePositionParams, PositionStatus } from '@/types/position';
import { Trade, RecordTradeParams, TradeType } from '@/types/trade';
import { PortfolioMetrics } from '@/types/portfolio';
import { CalculationService, ProfitLossMetrics } from './calculation-service';
import { ValidationService } from './validation-service';
import { StorageService } from './storage-service';
import { StopLossStatus } from '@/types/stop-loss';

/**
 * Main service for managing trading positions
 * Maps to FR-001, FR-004, FR-010, FR-017: Position management and portfolio operations
 */
export class PositionService {
  private calculationService: CalculationService;
  private validationService: ValidationService;
  public storageService: StorageService; // Make public for hook access

  constructor() {
    this.calculationService = new CalculationService();
    this.validationService = new ValidationService();
    this.storageService = new StorageService();
  }

  /**
   * Create a new trading position
   * Maps to FR-001: System MUST allow users to create new stock positions
   */
  async createPosition(params: CreatePositionParams): Promise<Position> {
    // Load existing positions to check for duplicates
    const existingPositions = await this.storageService.loadPositions();
    const existingTickers = existingPositions.map(p => p.ticker);

    // Validate parameters
    const validation = this.validationService.validateCreatePosition(params, existingTickers);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Calculate sell targets and initial stop-loss
    const sellTargets = this.calculationService.calculateSellTargets(params.buyPrice, params.originalShares);
    const initialStopLoss = this.calculationService.calculateInitialStopLoss(params.buyPrice);

    // Create position object
    const position: Position = {
      id: this.generateId(),
      ticker: params.ticker,
      buyPrice: params.buyPrice,
      originalShares: params.originalShares,
      remainingShares: params.originalShares,
      sellTargets,
      stopLoss: {
        price: initialStopLoss,
        status: StopLossStatus.INITIAL,
        progressionHistory: [{
          price: initialStopLoss,
          status: StopLossStatus.INITIAL,
          changedAt: new Date(),
          reason: 'Initial stop-loss set at -20%',
        }],
      },
      createdAt: new Date(),
    };

    // Save to storage
    const updatedPositions = [...existingPositions, position];
    await this.storageService.savePositions(updatedPositions);

    return position;
  }

  /**
   * Get all active positions
   * Maps to FR-010: System MUST display all active positions in portfolio view
   */
  async getAllPositions(): Promise<Position[]> {
    return await this.storageService.loadPositions();
  }

  /**
   * Get a specific position by ID
   */
  async getPosition(id: string): Promise<Position | null> {
    const positions = await this.storageService.loadPositions();
    return positions.find(p => p.id === id) || null;
  }

  /**
   * Update position with current market price for simulation
   * Maps to FR-007, FR-008: Interactive price slider and profit/loss calculation
   */
  async updateCurrentPrice(positionId: string, currentPrice: number): Promise<Position> {
    // Validate price input
    const priceValidation = this.validationService.validatePriceInput(currentPrice);
    if (!priceValidation.isValid) {
      throw new Error(`Invalid price: ${priceValidation.errors.map(e => e.message).join(', ')}`);
    }

    // Get position
    const position = await this.getPosition(positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    // Update current price (this is simulation only, not persisted)
    const updatedPosition: Position = {
      ...position,
      currentPrice,
    };

    return updatedPosition;
  }

  /**
   * Record a trade (partial sale) for a position
   * Maps to FR-004: System MUST allow users to record partial sales
   */
  async recordTrade(params: RecordTradeParams): Promise<{ position: Position; trade: Trade }> {
    // Get position
    const position = await this.getPosition(params.positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    // Validate trade parameters
    const validation = this.validationService.validateRecordTrade(params, position);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Calculate trade metrics
    const totalValue = Number((params.sharesSold * params.sellPrice).toFixed(2));
    const profit = Number(((params.sellPrice - position.buyPrice) * params.sharesSold).toFixed(2));
    const profitPercent = Number((((params.sellPrice - position.buyPrice) / position.buyPrice) * 100).toFixed(2));

    // Determine trade type if not specified
    let tradeType = params.tradeType;
    if (!tradeType) {
      if (params.sellPrice >= position.sellTargets.secondTarget) {
        tradeType = TradeType.SECOND_TARGET;
      } else if (params.sellPrice >= position.sellTargets.firstTarget) {
        tradeType = TradeType.FIRST_TARGET;
      } else if (params.sellPrice <= position.stopLoss.price) {
        tradeType = TradeType.STOP_LOSS;
      } else {
        tradeType = TradeType.MANUAL;
      }
    }

    // Create trade record
    const trade: Trade = {
      id: this.generateId(),
      positionId: params.positionId,
      sharesSold: params.sharesSold,
      sellPrice: params.sellPrice,
      totalValue,
      profit,
      profitPercent,
      executedAt: new Date(),
      tradeType,
    };

    // Update position
    const updatedPosition: Position = {
      ...position,
      remainingShares: position.remainingShares - params.sharesSold,
    };

    // Update stop-loss progression if needed
    const existingTrades = await this.storageService.loadTrades();
    const allTrades = [...existingTrades, trade];
    const newStopLoss = this.calculationService.calculateProgressedStopLoss(updatedPosition, allTrades);
    updatedPosition.stopLoss = newStopLoss;

    // Save to storage
    const positions = await this.storageService.loadPositions();
    const updatedPositions = positions.map(p => p.id === position.id ? updatedPosition : p);
    await this.storageService.savePositions(updatedPositions);
    await this.storageService.saveTrades(allTrades);

    return { position: updatedPosition, trade };
  }

  /**
   * Delete a position and all associated trades
   */
  async deletePosition(positionId: string): Promise<void> {
    // Remove position
    const positions = await this.storageService.loadPositions();
    const updatedPositions = positions.filter(p => p.id !== positionId);
    await this.storageService.savePositions(updatedPositions);

    // Remove associated trades
    const trades = await this.storageService.loadTrades();
    const updatedTrades = trades.filter(t => t.positionId !== positionId);
    await this.storageService.saveTrades(updatedTrades);
  }

  /**
   * Calculate real-time metrics for all positions
   * Maps to FR-017: System MUST calculate position-level and portfolio-level risk metrics
   */
  async calculatePortfolioMetrics(currentPrices: Record<string, number>): Promise<PortfolioMetrics> {
    const positions = await this.storageService.loadPositions();
    const trades = await this.storageService.loadTrades();

    let totalValue = 0;
    let totalCost = 0;
    let realizedProfit = 0;
    let positionsAtTarget = 0;
    let positionsAtStopLoss = 0;

    // Calculate metrics for each position
    for (const position of positions) {
      const currentPrice = currentPrices[position.ticker] || position.currentPrice;
      if (currentPrice) {
        // Calculate position metrics
        const positionMetrics = this.calculationService.calculateProfitLoss(position, currentPrice, trades);
        totalValue += positionMetrics.totalValue;
        realizedProfit += positionMetrics.realizedProfit;

        // Analyze triggered levels
        const triggeredLevels = this.calculationService.analyzeTriggeredLevels(position, currentPrice);
        if (triggeredLevels.isAtFirstTarget || triggeredLevels.isAtSecondTarget) {
          positionsAtTarget++;
        }
        if (triggeredLevels.isAtStopLoss) {
          positionsAtStopLoss++;
        }
      }

      // Add to total cost
      totalCost += position.originalShares * position.buyPrice;
    }

    // Calculate unrealized profit
    const unrealizedProfit = totalValue - (totalCost - this.getInvestedCapitalFromTrades(trades));

    // Calculate totals
    const totalProfit = realizedProfit + unrealizedProfit;
    const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const averageReturnPercent = positions.length > 0 ? totalProfitPercent / positions.length : 0;

    return {
      totalPositions: positions.length,
      totalValue: Number(totalValue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      totalProfitPercent: Number(totalProfitPercent.toFixed(2)),
      realizedProfit: Number(realizedProfit.toFixed(2)),
      unrealizedProfit: Number(unrealizedProfit.toFixed(2)),
      positionsAtTarget,
      positionsAtStopLoss,
      averageReturnPercent: Number(averageReturnPercent.toFixed(2)),
      calculatedAt: new Date(),
    };
  }

  /**
   * Get position status based on remaining shares
   */
  getPositionStatus(position: Position): PositionStatus {
    const soldShares = position.originalShares - position.remainingShares;
    const soldPercentage = (soldShares / position.originalShares) * 100;

    if (position.remainingShares === 0) {
      return PositionStatus.CLOSED;
    } else if (soldPercentage >= 66) {
      return PositionStatus.MOSTLY_SOLD;
    } else if (soldPercentage > 0) {
      return PositionStatus.PARTIALLY_SOLD;
    } else {
      return PositionStatus.ACTIVE;
    }
  }

  /**
   * Calculate profit/loss for a specific position
   */
  async calculatePositionMetrics(positionId: string, currentPrice: number): Promise<ProfitLossMetrics> {
    const position = await this.getPosition(positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    const trades = await this.storageService.loadTrades();
    return this.calculationService.calculateProfitLoss(position, currentPrice, trades);
  }

  /**
   * Helper method to calculate invested capital from trades
   */
  private getInvestedCapitalFromTrades(trades: Trade[]): number {
    return trades.reduce((sum, trade) => {
      // This represents the original capital that was returned from sales
      return sum + (trade.sharesSold * trade.sellPrice);
    }, 0);
  }

  /**
   * Generate unique ID for positions and trades
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}