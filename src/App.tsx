import React, { useState } from 'react';
import { usePositions } from '@/hooks/usePositions';
import { PositionForm } from '@/components/PositionForm/PositionForm';
import { CreatePositionParams } from '@/types/position';

export function App(): JSX.Element {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const {
    positions,
    trades,
    isLoading,
    error,
    createPosition,
    deletePosition,
  } = usePositions();

  const handleCreatePosition = async (params: CreatePositionParams) => {
    try {
      await createPosition(params);
      setShowCreateForm(false);
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to create position:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg-primary flex items-center justify-center">
        <div className="text-dark-text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg-primary text-dark-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-dark-text-primary mb-2">
            Sell-in-Thirds Trading Tracker
          </h1>
          <p className="text-dark-text-secondary">
            Manage your positions with automated target calculation and breakeven stop-loss progression
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-financial-loss/10 border border-financial-loss/20 rounded-financial p-4">
            <div className="flex">
              <div className="text-financial-loss text-sm">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Create Position Form */}
        {showCreateForm && (
          <div className="mb-8">
            <PositionForm
              onSubmit={handleCreatePosition}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Main Content */}
        <main>
          {positions.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="bg-dark-surface-primary border border-dark-border-primary rounded-financial p-8">
                <h2 className="text-xl font-semibold text-dark-text-primary mb-4">
                  No Positions Yet
                </h2>
                <p className="text-dark-text-secondary mb-6">
                  Create your first position to start tracking the sell-in-thirds strategy
                </p>
                {!showCreateForm && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-financial-target hover:bg-financial-target-dark text-white font-medium py-3 px-6 rounded-financial transition-colors focus:outline-none focus:ring-2 focus:ring-financial-target focus:ring-offset-2 focus:ring-offset-dark-bg-primary"
                  >
                    Add Position
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Positions List */
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-dark-text-primary">
                  Active Positions ({positions.length})
                </h2>
                {!showCreateForm && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-financial-target hover:bg-financial-target-dark text-white font-medium py-2 px-4 rounded-financial transition-colors focus:outline-none focus:ring-2 focus:ring-financial-target focus:ring-offset-2 focus:ring-offset-dark-bg-primary"
                  >
                    Add Position
                  </button>
                )}
              </div>

              {/* Positions Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {positions.map((position) => (
                  <div
                    key={position.id}
                    className="bg-dark-surface-primary border border-dark-border-primary rounded-financial p-6"
                  >
                    {/* Position Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-dark-text-primary font-financial">
                          {position.ticker}
                        </h3>
                        <p className="text-sm text-dark-text-muted">
                          Created {position.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deletePosition(position.id)}
                        className="text-dark-text-muted hover:text-financial-loss transition-colors p-1"
                        title="Delete position"
                      >
                        ×
                      </button>
                    </div>

                    {/* Position Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Buy Price:</span>
                        <span className="text-dark-text-primary font-financial">
                          ${position.buyPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Shares:</span>
                        <span className="text-dark-text-primary font-financial">
                          {position.remainingShares} / {position.originalShares}
                        </span>
                      </div>

                      <div className="border-t border-dark-border-secondary pt-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-dark-text-muted">First Target:</span>
                          <span className="text-financial-target font-financial">
                            ${position.sellTargets.firstTarget.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-dark-text-muted">Second Target:</span>
                          <span className="text-financial-target font-financial">
                            ${position.sellTargets.secondTarget.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-dark-text-muted">Stop-Loss:</span>
                          <span className="text-financial-stopLoss font-financial">
                            ${position.stopLoss.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="pt-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          position.remainingShares === position.originalShares
                            ? 'bg-financial-target/20 text-financial-target'
                            : position.remainingShares > 0
                            ? 'bg-financial-profit/20 text-financial-profit'
                            : 'bg-dark-text-muted/20 text-dark-text-muted'
                        }`}>
                          {position.remainingShares === position.originalShares
                            ? 'Active'
                            : position.remainingShares > 0
                            ? 'Partially Sold'
                            : 'Closed'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-dark-border-primary text-center text-dark-text-muted text-sm">
          <p>Sell-in-Thirds Trading Tracker - Session-only storage</p>
        </footer>
      </div>
    </div>
  );
}