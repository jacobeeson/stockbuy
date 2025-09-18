import { CreatePositionParams } from '@/types/position';
import { RecordTradeParams } from '@/types/trade';
import type { Position } from '@/types/position';

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;

  /** Array of validation errors */
  errors: ValidationError[];
}

/**
 * Individual validation error
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string;

  /** Human-readable error message */
  message: string;

  /** Error code for programmatic handling */
  code: ValidationErrorCode;
}

/**
 * Validation error codes
 */
export enum ValidationErrorCode {
  REQUIRED = 'required',
  INVALID_FORMAT = 'invalid_format',
  OUT_OF_RANGE = 'out_of_range',
  INSUFFICIENT_SHARES = 'insufficient_shares',
  DUPLICATE_TICKER = 'duplicate_ticker',
}

/**
 * Input validation and business rule enforcement
 * Maps to FR-015, FR-016: Input validation requirements
 */
export class ValidationService {
  private readonly TICKER_PATTERN = /^[A-Z]{1,5}$/;
  private readonly MAX_PRICE = 999999.99;
  private readonly MAX_SHARES = 1000000;

  /**
   * Validate position creation parameters
   * Maps to FR-015: System MUST validate ticker symbols are properly formatted
   */
  validateCreatePosition(params: CreatePositionParams, existingTickers: string[] = []): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate ticker symbol
    if (!params.ticker) {
      errors.push({
        field: 'ticker',
        message: 'Ticker symbol is required',
        code: ValidationErrorCode.REQUIRED,
      });
    } else if (!this.TICKER_PATTERN.test(params.ticker)) {
      errors.push({
        field: 'ticker',
        message: 'Ticker must be 1-5 uppercase letters only',
        code: ValidationErrorCode.INVALID_FORMAT,
      });
    } else if (existingTickers.includes(params.ticker)) {
      errors.push({
        field: 'ticker',
        message: 'Position with this ticker already exists',
        code: ValidationErrorCode.DUPLICATE_TICKER,
      });
    }

    // Validate buy price
    if (!this.isValidNumber(params.buyPrice)) {
      errors.push({
        field: 'buyPrice',
        message: 'Buy price is required',
        code: ValidationErrorCode.REQUIRED,
      });
    } else if (params.buyPrice <= 0) {
      errors.push({
        field: 'buyPrice',
        message: 'Buy price must be positive',
        code: ValidationErrorCode.OUT_OF_RANGE,
      });
    } else if (params.buyPrice > this.MAX_PRICE) {
      errors.push({
        field: 'buyPrice',
        message: `Buy price cannot exceed $${this.MAX_PRICE.toLocaleString()}`,
        code: ValidationErrorCode.OUT_OF_RANGE,
      });
    }

    // Validate original shares
    if (!this.isValidNumber(params.originalShares)) {
      errors.push({
        field: 'originalShares',
        message: 'Number of shares is required',
        code: ValidationErrorCode.REQUIRED,
      });
    } else if (!Number.isInteger(params.originalShares)) {
      errors.push({
        field: 'originalShares',
        message: 'Number of shares must be a whole number',
        code: ValidationErrorCode.INVALID_FORMAT,
      });
    } else if (params.originalShares <= 0) {
      errors.push({
        field: 'originalShares',
        message: 'Number of shares must be positive',
        code: ValidationErrorCode.OUT_OF_RANGE,
      });
    } else if (params.originalShares > this.MAX_SHARES) {
      errors.push({
        field: 'originalShares',
        message: `Number of shares cannot exceed ${this.MAX_SHARES.toLocaleString()}`,
        code: ValidationErrorCode.OUT_OF_RANGE,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate trade recording parameters
   * Maps to FR-016: System MUST prevent users from selling more shares than they own
   */
  validateRecordTrade(params: RecordTradeParams, position: Position | null): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate position exists
    if (!position) {
      errors.push({
        field: 'positionId',
        message: 'Position not found',
        code: ValidationErrorCode.REQUIRED,
      });
      return { isValid: false, errors };
    }

    // Validate shares sold
    if (!this.isValidNumber(params.sharesSold)) {
      errors.push({
        field: 'sharesSold',
        message: 'Number of shares to sell is required',
        code: ValidationErrorCode.REQUIRED,
      });
    } else if (!Number.isInteger(params.sharesSold)) {
      errors.push({
        field: 'sharesSold',
        message: 'Number of shares must be a whole number',
        code: ValidationErrorCode.INVALID_FORMAT,
      });
    } else if (params.sharesSold <= 0) {
      errors.push({
        field: 'sharesSold',
        message: 'Number of shares to sell must be positive',
        code: ValidationErrorCode.OUT_OF_RANGE,
      });
    } else if (params.sharesSold > position.remainingShares) {
      errors.push({
        field: 'sharesSold',
        message: `Cannot sell ${params.sharesSold} shares. Only ${position.remainingShares} shares remaining.`,
        code: ValidationErrorCode.INSUFFICIENT_SHARES,
      });
    }

    // Validate sell price
    if (!this.isValidNumber(params.sellPrice)) {
      errors.push({
        field: 'sellPrice',
        message: 'Sell price is required',
        code: ValidationErrorCode.REQUIRED,
      });
    } else if (params.sellPrice <= 0) {
      errors.push({
        field: 'sellPrice',
        message: 'Sell price must be positive',
        code: ValidationErrorCode.OUT_OF_RANGE,
      });
    } else if (params.sellPrice > this.MAX_PRICE) {
      errors.push({
        field: 'sellPrice',
        message: `Sell price cannot exceed $${this.MAX_PRICE.toLocaleString()}`,
        code: ValidationErrorCode.OUT_OF_RANGE,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate price input from slider
   * Maps to FR-012: System MUST accept manual price input via interactive slider
   */
  validatePriceInput(price: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (!this.isValidNumber(price)) {
      errors.push({
        field: 'price',
        message: 'Price is required',
        code: ValidationErrorCode.REQUIRED,
      });
    } else if (price <= 0) {
      errors.push({
        field: 'price',
        message: 'Price must be positive',
        code: ValidationErrorCode.OUT_OF_RANGE,
      });
    } else if (price > this.MAX_PRICE) {
      errors.push({
        field: 'price',
        message: `Price cannot exceed $${this.MAX_PRICE.toLocaleString()}`,
        code: ValidationErrorCode.OUT_OF_RANGE,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate ticker symbol format
   */
  validateTickerFormat(ticker: string): boolean {
    return this.TICKER_PATTERN.test(ticker);
  }

  /**
   * Helper method to check if a value is a valid number
   */
  private isValidNumber(value: number): boolean {
    return Number.isFinite(value) && !Number.isNaN(value);
  }

  /**
   * Get validation error message for a specific error code
   */
  getErrorMessage(code: ValidationErrorCode, field: string, context?: any): string {
    switch (code) {
      case ValidationErrorCode.REQUIRED:
        return `${this.capitalizeField(field)} is required`;
      case ValidationErrorCode.INVALID_FORMAT:
        return this.getFormatErrorMessage(field);
      case ValidationErrorCode.OUT_OF_RANGE:
        return this.getRangeErrorMessage(field, context);
      case ValidationErrorCode.INSUFFICIENT_SHARES:
        return `Insufficient shares available for sale`;
      case ValidationErrorCode.DUPLICATE_TICKER:
        return `Position with ticker ${context} already exists`;
      default:
        return `Invalid ${field}`;
    }
  }

  /**
   * Get format-specific error message
   */
  private getFormatErrorMessage(field: string): string {
    switch (field) {
      case 'ticker':
        return 'Ticker must be 1-5 uppercase letters only';
      case 'originalShares':
      case 'sharesSold':
        return 'Must be a whole number';
      default:
        return `Invalid ${field} format`;
    }
  }

  /**
   * Get range-specific error message
   */
  private getRangeErrorMessage(field: string, context?: any): string {
    switch (field) {
      case 'buyPrice':
      case 'sellPrice':
      case 'price':
        return 'Must be a positive number';
      case 'originalShares':
      case 'sharesSold':
        return 'Must be a positive number';
      default:
        return `${this.capitalizeField(field)} is out of valid range`;
    }
  }

  /**
   * Capitalize field name for error messages
   */
  private capitalizeField(field: string): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
  }
}