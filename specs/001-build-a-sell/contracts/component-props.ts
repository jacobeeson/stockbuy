/**
 * React Component Props Contracts
 * Defines the interface for all React component props
 */

import { Position, Trade, Portfolio } from '../types';
import { ProfitLossMetrics, TriggeredLevels, ValidationResult } from './position-service';

/**
 * Dashboard Component Props
 * Main application container component
 */
export interface DashboardProps {
  className?: string;
}

/**
 * Position Form Component Props
 * Form for creating new trading positions
 * Maps to FR-001: System MUST allow users to create new stock positions
 */
export interface PositionFormProps {
  onSubmit: (params: CreatePositionParams) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  validationErrors?: ValidationResult;
  className?: string;
}

export interface CreatePositionParams {
  ticker: string;
  buyPrice: number;
  originalShares: number;
}

/**
 * Position List Component Props
 * Displays all active positions in a table/card layout
 * Maps to FR-010: System MUST display all active positions in portfolio view
 */
export interface PositionListProps {
  positions: Position[];
  onSelectPosition: (position: Position) => void;
  onDeletePosition: (positionId: string) => void;
  onUpdateCurrentPrice: (positionId: string, price: number) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Position Card Component Props
 * Individual position display within the list
 */
export interface PositionCardProps {
  position: Position;
  profitLossMetrics: ProfitLossMetrics;
  triggeredLevels: TriggeredLevels;
  onSelect: () => void;
  onDelete: () => void;
  onPriceUpdate: (price: number) => void;
  isSelected?: boolean;
  className?: string;
}

/**
 * Position Detail Component Props
 * Detailed view of a selected position with trade recording
 */
export interface PositionDetailProps {
  position: Position;
  trades: Trade[];
  profitLossMetrics: ProfitLossMetrics;
  triggeredLevels: TriggeredLevels;
  onRecordTrade: (params: RecordTradeParams) => void;
  onClose: () => void;
  onUpdateCurrentPrice: (price: number) => void;
  isLoading?: boolean;
  className?: string;
}

export interface RecordTradeParams {
  sharesSold: number;
  sellPrice: number;
  tradeType?: TradeType;
}

export enum TradeType {
  FIRST_TARGET = 'first_target',
  SECOND_TARGET = 'second_target',
  STOP_LOSS = 'stop_loss',
  MANUAL = 'manual'
}

/**
 * Price Slider Component Props
 * Interactive slider for scenario analysis
 * Maps to FR-007, FR-008: Interactive price slider and real-time profit/loss calculation
 */
export interface PriceSliderProps {
  position: Position;
  currentPrice: number;
  onPriceChange: (price: number) => void;
  minPrice?: number;        // Default: buyPrice * 0.5 (50% loss)
  maxPrice?: number;        // Default: buyPrice * 3.0 (200% gain)
  step?: number;           // Default: 0.01
  showTargets?: boolean;   // Default: true
  showStopLoss?: boolean;  // Default: true
  className?: string;
}

/**
 * Trade Form Component Props
 * Form for recording trade execution
 * Maps to FR-004: System MUST allow users to record partial sales
 */
export interface TradeFormProps {
  position: Position;
  onSubmit: (params: RecordTradeParams) => void;
  onCancel: () => void;
  suggestedTrade?: SuggestedTrade;
  validationErrors?: ValidationResult;
  isLoading?: boolean;
  className?: string;
}

export interface SuggestedTrade {
  sharesSold: number;
  sellPrice: number;
  tradeType: TradeType;
  reason: string;          // e.g., "First target reached at $225.00"
}

/**
 * Risk Visualization Component Props
 * Charts and metrics for risk management
 * Maps to FR-017: System MUST calculate position-level and portfolio-level risk metrics
 */
export interface RiskVisualizationProps {
  position: Position;
  profitLossMetrics: ProfitLossMetrics;
  triggeredLevels: TriggeredLevels;
  historicalPrices?: number[];  // For trend visualization (optional)
  showDetails?: boolean;        // Show detailed breakdown
  chartType?: ChartType;
  className?: string;
}

export enum ChartType {
  PROFIT_LOSS = 'profit_loss',
  TARGET_LEVELS = 'target_levels',
  RISK_REWARD = 'risk_reward'
}

/**
 * Portfolio Summary Component Props
 * Aggregate metrics across all positions
 */
export interface PortfolioSummaryProps {
  portfolio: Portfolio;
  positions: Position[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Trade History Component Props
 * List of completed trades for a position
 */
export interface TradeHistoryProps {
  trades: Trade[];
  position: Position;
  showProfitLoss?: boolean;
  maxItems?: number;        // Default: unlimited
  className?: string;
}

/**
 * Stop Loss Indicator Component Props
 * Visual indicator of current stop-loss status and progression
 */
export interface StopLossIndicatorProps {
  position: Position;
  currentPrice: number;
  isTriggered: boolean;
  onAdjustStopLoss?: (newPrice: number) => void;
  allowManualAdjustment?: boolean;
  className?: string;
}

/**
 * Responsive Layout Component Props
 * Container for responsive design across desktop and mobile
 * Maps to FR-014: System MUST be responsive across desktop and mobile devices
 */
export interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isMobile?: boolean;
  className?: string;
}

/**
 * Loading Spinner Component Props
 * Reusable loading state indicator
 */
export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  className?: string;
}

/**
 * Error Boundary Component Props
 * Error handling wrapper for component errors
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Theme Provider Component Props
 * Dark theme context provider
 * Maps to FR-013: System MUST implement dark theme optimized for financial data display
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark';
  storageKey?: string;      // SessionStorage key for theme preference
}

/**
 * Accessibility Props
 * Common accessibility props for WCAG 2.1 AA compliance
 * Maps to user requirement: WCAG 2.1 AA accessibility compliance
 */
export interface AccessibilityProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  role?: string;
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

/**
 * Financial Display Component Props
 * Standardized props for displaying financial data
 */
export interface FinancialDisplayProps {
  value: number;
  type: FinancialValueType;
  precision?: number;       // Decimal places (default: 2)
  showSign?: boolean;      // Show +/- prefix for profits/losses
  showCurrency?: boolean;  // Show $ symbol
  colorCode?: boolean;     // Green for positive, red for negative
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export enum FinancialValueType {
  CURRENCY = 'currency',    // $150.00
  PERCENTAGE = 'percentage', // 25.5%
  SHARES = 'shares',        // 100 shares
  RATIO = 'ratio'          // 1.25:1
}