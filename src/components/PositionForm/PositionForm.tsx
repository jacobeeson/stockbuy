import React, { useState, useCallback } from 'react';
import { CreatePositionParams } from '@/types/position';
import { ValidationResult } from '@/services/validation-service';

export interface PositionFormProps {
  onSubmit: (params: CreatePositionParams) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  validationErrors?: ValidationResult;
  className?: string;
}

export function PositionForm({
  onSubmit,
  onCancel,
  isLoading = false,
  validationErrors,
  className = '',
}: PositionFormProps): JSX.Element {
  const [ticker, setTicker] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [originalShares, setOriginalShares] = useState('');
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case 'ticker':
        if (!value) return 'Ticker symbol is required';
        if (!/^[A-Z]{1,5}$/.test(value)) return 'Ticker must be 1-5 uppercase letters only';
        break;
      case 'buyPrice':
        const price = parseFloat(value);
        if (!value || isNaN(price)) return 'Buy price is required';
        if (price <= 0) return 'Buy price must be positive';
        break;
      case 'originalShares':
        const shares = parseInt(value);
        if (!value || isNaN(shares)) return 'Number of shares is required';
        if (shares <= 0) return 'Number of shares must be positive';
        if (!Number.isInteger(shares)) return 'Shares must be whole numbers';
        break;
    }
    return '';
  }, []);

  const handleFieldChange = useCallback((field: string, value: string) => {
    const error = validateField(field, value);
    setLocalErrors(prev => ({ ...prev, [field]: error }));

    switch (field) {
      case 'ticker':
        setTicker(value.toUpperCase());
        break;
      case 'buyPrice':
        setBuyPrice(value);
        break;
      case 'originalShares':
        setOriginalShares(value);
        break;
    }
  }, [validateField]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors = {
      ticker: validateField('ticker', ticker),
      buyPrice: validateField('buyPrice', buyPrice),
      originalShares: validateField('originalShares', originalShares),
    };

    setLocalErrors(errors);

    // Check if any validation errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) return;

    // Submit if valid
    onSubmit({
      ticker,
      buyPrice: parseFloat(buyPrice),
      originalShares: parseInt(originalShares),
    });
  }, [ticker, buyPrice, originalShares, validateField, onSubmit]);

  const getFieldError = (field: string): string => {
    // Check local errors first, then prop errors
    if (localErrors[field]) return localErrors[field];
    if (validationErrors?.errors) {
      const error = validationErrors.errors.find(e => e.field === field);
      return error?.message || '';
    }
    return '';
  };

  const calculatePreview = () => {
    const price = parseFloat(buyPrice);
    const shares = parseInt(originalShares);

    if (price > 0 && shares > 0) {
      return {
        firstTarget: (price * 1.5).toFixed(2),
        secondTarget: (price * 2.0).toFixed(2),
        stopLoss: (price * 0.8).toFixed(2),
        sharesPerThird: Math.floor(shares / 3),
      };
    }
    return null;
  };

  const preview = calculatePreview();

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-dark-surface-primary border border-dark-border-primary rounded-financial p-6 space-y-6 ${className}`}
      role="form"
      aria-label="Create new position"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-dark-text-primary">
          Add New Position
        </h2>

        {/* Ticker Symbol */}
        <div>
          <label
            htmlFor="ticker"
            className="block text-sm font-medium text-dark-text-secondary mb-2"
          >
            Ticker Symbol
          </label>
          <input
            id="ticker"
            type="text"
            value={ticker}
            onChange={(e) => handleFieldChange('ticker', e.target.value)}
            placeholder="AAPL"
            maxLength={5}
            className={`w-full px-3 py-2 bg-dark-surface-secondary border rounded-financial text-dark-text-primary placeholder-dark-text-muted font-financial ${
              getFieldError('ticker')
                ? 'border-financial-loss'
                : 'border-dark-border-secondary focus:border-financial-target'
            } focus:outline-none focus:ring-1 focus:ring-financial-target`}
            aria-describedby="ticker-description ticker-error"
            disabled={isLoading}
          />
          <p id="ticker-description" className="mt-1 text-xs text-dark-text-muted">
            Enter 1-5 letter stock symbol
          </p>
          {getFieldError('ticker') && (
            <p id="ticker-error" className="mt-1 text-xs text-financial-loss" role="alert">
              {getFieldError('ticker')}
            </p>
          )}
        </div>

        {/* Buy Price */}
        <div>
          <label
            htmlFor="buyPrice"
            className="block text-sm font-medium text-dark-text-secondary mb-2"
          >
            Buy Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-dark-text-muted">$</span>
            <input
              id="buyPrice"
              type="number"
              step="0.01"
              min="0.01"
              value={buyPrice}
              onChange={(e) => handleFieldChange('buyPrice', e.target.value)}
              placeholder="150.00"
              className={`w-full pl-8 pr-3 py-2 bg-dark-surface-secondary border rounded-financial text-dark-text-primary placeholder-dark-text-muted font-financial ${
                getFieldError('buyPrice')
                  ? 'border-financial-loss'
                  : 'border-dark-border-secondary focus:border-financial-target'
              } focus:outline-none focus:ring-1 focus:ring-financial-target`}
              aria-describedby="buyPrice-description buyPrice-error"
              disabled={isLoading}
            />
          </div>
          <p id="buyPrice-description" className="mt-1 text-xs text-dark-text-muted">
            Price per share in dollars
          </p>
          {getFieldError('buyPrice') && (
            <p id="buyPrice-error" className="mt-1 text-xs text-financial-loss" role="alert">
              {getFieldError('buyPrice')}
            </p>
          )}
        </div>

        {/* Number of Shares */}
        <div>
          <label
            htmlFor="originalShares"
            className="block text-sm font-medium text-dark-text-secondary mb-2"
          >
            Number of Shares
          </label>
          <input
            id="originalShares"
            type="number"
            min="1"
            step="1"
            value={originalShares}
            onChange={(e) => handleFieldChange('originalShares', e.target.value)}
            placeholder="300"
            className={`w-full px-3 py-2 bg-dark-surface-secondary border rounded-financial text-dark-text-primary placeholder-dark-text-muted font-financial ${
              getFieldError('originalShares')
                ? 'border-financial-loss'
                : 'border-dark-border-secondary focus:border-financial-target'
            } focus:outline-none focus:ring-1 focus:ring-financial-target`}
            aria-describedby="originalShares-description originalShares-error"
            disabled={isLoading}
          />
          <p id="originalShares-description" className="mt-1 text-xs text-dark-text-muted">
            Whole number of shares
          </p>
          {getFieldError('originalShares') && (
            <p id="originalShares-error" className="mt-1 text-xs text-financial-loss" role="alert">
              {getFieldError('originalShares')}
            </p>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-dark-surface-secondary border border-dark-border-secondary rounded-financial p-4">
            <h3 className="text-sm font-medium text-dark-text-secondary mb-3">
              Sell-in-Thirds Preview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-dark-text-muted">First Target (+50%)</p>
                <p className="text-financial-target font-financial font-semibold">
                  ${preview.firstTarget}
                </p>
              </div>
              <div>
                <p className="text-dark-text-muted">Second Target (+100%)</p>
                <p className="text-financial-target font-financial font-semibold">
                  ${preview.secondTarget}
                </p>
              </div>
              <div>
                <p className="text-dark-text-muted">Stop-Loss (-20%)</p>
                <p className="text-financial-stopLoss font-financial font-semibold">
                  ${preview.stopLoss}
                </p>
              </div>
              <div>
                <p className="text-dark-text-muted">Shares per third</p>
                <p className="text-dark-text-primary font-financial font-semibold">
                  {preview.sharesPerThird}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-financial-target hover:bg-financial-target-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-financial transition-colors focus:outline-none focus:ring-2 focus:ring-financial-target focus:ring-offset-2 focus:ring-offset-dark-bg-primary"
        >
          {isLoading ? 'Creating Position...' : 'Create Position'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-dark-border-secondary text-dark-text-secondary hover:text-dark-text-primary hover:border-dark-border-primary rounded-financial transition-colors focus:outline-none focus:ring-2 focus:ring-dark-border-primary focus:ring-offset-2 focus:ring-offset-dark-bg-primary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}