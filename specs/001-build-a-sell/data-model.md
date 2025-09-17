# Phase 1: Data Model Design

## Core Entities

### Position
Represents a stock holding with sell-in-thirds strategy calculations.

```typescript
interface Position {
  id: string;                    // UUID for unique identification
  ticker: string;                // Stock symbol (e.g., "AAPL")
  buyPrice: number;              // Purchase price per share
  originalShares: number;        // Initial number of shares purchased
  remainingShares: number;       // Current number of shares remaining
  sellTargets: SellTargets;      // Calculated sell target prices
  stopLoss: StopLoss;           // Current stop-loss configuration
  createdAt: Date;              // Position creation timestamp
  currentPrice?: number;        // Current simulated price from slider
}
```

**Validation Rules** (from FR-015, FR-016):
- `ticker`: Must match pattern `/^[A-Z]{1,5}$/` (1-5 uppercase letters)
- `buyPrice`: Must be positive number > 0, max 2 decimal places
- `originalShares`: Must be positive integer > 0
- `remainingShares`: Must be <= originalShares, >= 0
- `sellTargets`: Auto-calculated, read-only
- `stopLoss`: Must be positive number, can be modified by user

**State Transitions**:
1. Created → Active (initial state)
2. Active → Partially Sold (after first sale)
3. Partially Sold → Mostly Sold (after second sale)
4. Any state → Closed (when remainingShares = 0)

### SellTargets
Calculated sell target prices for the sell-in-thirds strategy.

```typescript
interface SellTargets {
  firstTarget: number;          // +50% of buy price (buyPrice * 1.5)
  secondTarget: number;         // +100% of buy price (buyPrice * 2.0)
  firstTargetShares: number;    // Math.floor(originalShares / 3)
  secondTargetShares: number;   // Math.floor(originalShares / 3)
  remainingShares: number;      // originalShares - firstTargetShares - secondTargetShares
}
```

**Calculation Formula**:
- `firstTarget = buyPrice * 1.5`
- `secondTarget = buyPrice * 2.0`
- `firstTargetShares = Math.floor(originalShares / 3)`
- `secondTargetShares = Math.floor(originalShares / 3)`
- `remainingShares = originalShares - firstTargetShares - secondTargetShares`

### StopLoss
Current stop-loss configuration with automatic progression.

```typescript
interface StopLoss {
  price: number;                          // Current stop-loss price
  status: StopLossStatus;                // Current progression status
  progressionHistory: StopLossHistoryEntry[]; // History of stop-loss changes
}

enum StopLossStatus {
  INITIAL = 'initial',        // -20% of buy price
  BREAKEVEN = 'breakeven',    // At buy price
  CUSTOM = 'custom'           // User-modified value
}

interface StopLossHistoryEntry {
  price: number;
  status: StopLossStatus;
  changedAt: Date;
  reason: string;             // e.g., "First third sold", "User adjustment"
}
```

**Progression Rules** (from FR-003, FR-005, FR-006):
1. Initial: `buyPrice * 0.8` (-20%), status = INITIAL
2. After first sale: `buyPrice` (breakeven), status = BREAKEVEN
3. After second sale: `buyPrice` (maintain breakeven), status = BREAKEVEN
4. User can override to CUSTOM at any time

### Trade
Represents a completed sell transaction.

```typescript
interface Trade {
  id: string;                   // UUID for unique identification
  positionId: string;           // Reference to parent position
  sharesSold: number;           // Number of shares sold in this trade
  sellPrice: number;            // Price per share at time of sale
  totalValue: number;           // sharesSold * sellPrice
  profit: number;               // (sellPrice - position.buyPrice) * sharesSold
  profitPercent: number;        // ((sellPrice - position.buyPrice) / position.buyPrice) * 100
  executedAt: Date;            // When the trade was recorded
  tradeType: TradeType;        // Which target was hit
}

enum TradeType {
  FIRST_TARGET = 'first_target',      // +50% target sale
  SECOND_TARGET = 'second_target',    // +100% target sale
  STOP_LOSS = 'stop_loss',           // Stop-loss triggered
  MANUAL = 'manual'                   // User-initiated sale
}
```

**Business Rules** (from FR-004, FR-016):
- `sharesSold` must be > 0 and <= position.remainingShares
- `sellPrice` must be > 0
- Trade execution automatically updates position.remainingShares
- Trade execution may trigger stop-loss progression

### Portfolio
Aggregate view of all positions for dashboard display.

```typescript
interface Portfolio {
  positions: Position[];
  totalValue: number;           // Sum of all position current values
  totalCost: number;           // Sum of all position costs (buyPrice * originalShares)
  totalProfit: number;         // totalValue - totalCost
  totalProfitPercent: number;  // (totalProfit / totalCost) * 100
  realizedProfit: number;      // Profit from completed trades
  unrealizedProfit: number;    // Profit from current position values
  calculatedAt: Date;          // When these metrics were calculated
}
```

## Data Flow

### Position Creation Flow
1. User inputs ticker, buyPrice, originalShares
2. Validate inputs according to business rules
3. Calculate sellTargets using formulas
4. Initialize stopLoss at -20%
5. Set remainingShares = originalShares
6. Store in sessionStorage

### Trade Execution Flow
1. User records sale (sharesSold, sellPrice)
2. Validate sale doesn't exceed remainingShares
3. Create Trade record
4. Update position.remainingShares -= sharesSold
5. Check if stop-loss progression needed
6. Update position.stopLoss if required
7. Update sessionStorage

### Price Simulation Flow
1. User adjusts price slider
2. Update position.currentPrice
3. Calculate real-time profit/loss
4. Determine which targets/stop-losses would trigger
5. Update UI indicators
6. No persistence required (simulation only)

## Storage Schema

### SessionStorage Structure
```json
{
  "trading_tracker_positions": {
    "position_uuid_1": { /* Position object */ },
    "position_uuid_2": { /* Position object */ }
  },
  "trading_tracker_trades": {
    "trade_uuid_1": { /* Trade object */ },
    "trade_uuid_2": { /* Trade object */ }
  },
  "trading_tracker_settings": {
    "darkMode": true,
    "lastUpdated": "2025-09-17T10:30:00Z"
  }
}
```

### Data Persistence Rules (from FR-011)
- Data stored in browser sessionStorage only
- Automatic cleanup on browser/tab close
- No server synchronization
- Manual export/import not required for v1.0

## Validation & Error Handling

### Input Validation
- Ticker symbols: Regex `/^[A-Z]{1,5}$/`
- Prices: Positive numbers, max 4 decimal places
- Shares: Positive integers only
- Trades: Cannot exceed available shares

### Error States
- Invalid ticker format
- Negative or zero prices/shares
- Insufficient shares for trade
- Calculation overflow errors
- Storage quota exceeded

### Data Recovery
- Graceful handling of corrupted sessionStorage data
- Default to empty portfolio if data invalid
- User notification of data loss scenarios

## Performance Considerations

### Calculation Optimization
- Memoize expensive profit/loss calculations
- Batch position updates during trade execution
- Debounce price slider updates (300ms)

### Memory Management
- Limit portfolio to reasonable size (suggested 50 positions max)
- Clean up completed positions after 30 days
- Efficient serialization for sessionStorage

## Next Phase
Phase 2: Generate specific implementation tasks based on this data model design.