import { StopLoss, StopLossStatus, StopLossHistoryEntry } from '@/types/stop-loss';

describe('StopLoss Type Definition', () => {
  it('should have all required fields', () => {
    const stopLoss: StopLoss = {
      price: 120.00,
      status: StopLossStatus.INITIAL,
      progressionHistory: [],
    };

    expect(stopLoss.price).toBeDefined();
    expect(stopLoss.status).toBeDefined();
    expect(stopLoss.progressionHistory).toBeDefined();
  });

  it('should support all stop-loss statuses', () => {
    const statuses = [
      StopLossStatus.INITIAL,
      StopLossStatus.BREAKEVEN,
      StopLossStatus.CUSTOM,
    ];

    statuses.forEach(status => {
      const stopLoss: StopLoss = {
        price: 120.00,
        status: status,
        progressionHistory: [],
      };

      expect(stopLoss.status).toBe(status);
    });
  });

  it('should track progression history', () => {
    const historyEntry: StopLossHistoryEntry = {
      price: 120.00,
      status: StopLossStatus.INITIAL,
      changedAt: new Date(),
      reason: 'Initial stop-loss set at -20%',
    };

    const stopLoss: StopLoss = {
      price: 150.00,
      status: StopLossStatus.BREAKEVEN,
      progressionHistory: [historyEntry],
    };

    expect(stopLoss.progressionHistory).toHaveLength(1);
    expect(stopLoss.progressionHistory[0]).toEqual(historyEntry);
  });

  it('should calculate initial stop-loss correctly', () => {
    // This test will fail until we implement calculation logic
    const buyPrice = 150.00;

    const stopLoss: StopLoss = {
      price: 0, // Should be buyPrice * 0.8 = 120.00
      status: StopLossStatus.INITIAL,
      progressionHistory: [],
    };

    // This should pass when calculation is implemented
    expect(stopLoss.price).toBe(120.00); // Will fail
  });

  it('should progress from initial to breakeven after first sale', () => {
    // This test will fail until we implement progression logic
    const buyPrice = 150.00;
    const initialStopLoss: StopLoss = {
      price: 120.00,
      status: StopLossStatus.INITIAL,
      progressionHistory: [],
    };

    // After first sale, should become:
    const progressedStopLoss: StopLoss = {
      price: 0, // Should be buyPrice = 150.00
      status: StopLossStatus.INITIAL, // Should be BREAKEVEN
      progressionHistory: [
        {
          price: 120.00,
          status: StopLossStatus.INITIAL,
          changedAt: new Date(),
          reason: 'Initial stop-loss set at -20%',
        },
      ],
    };

    // These should pass when progression logic is implemented
    expect(progressedStopLoss.price).toBe(150.00); // Will fail
    expect(progressedStopLoss.status).toBe(StopLossStatus.BREAKEVEN); // Will fail
  });

  it('should maintain breakeven after second sale', () => {
    // This test will fail until we implement progression logic
    const buyPrice = 150.00;

    const stopLossAfterSecondSale: StopLoss = {
      price: 0, // Should remain at buyPrice = 150.00
      status: StopLossStatus.INITIAL, // Should remain BREAKEVEN
      progressionHistory: [
        {
          price: 120.00,
          status: StopLossStatus.INITIAL,
          changedAt: new Date(),
          reason: 'Initial stop-loss set at -20%',
        },
        {
          price: 150.00,
          status: StopLossStatus.BREAKEVEN,
          changedAt: new Date(),
          reason: 'First third sold',
        },
      ],
    };

    // These should pass when progression logic is implemented
    expect(stopLossAfterSecondSale.price).toBe(150.00); // Will fail
    expect(stopLossAfterSecondSale.status).toBe(StopLossStatus.BREAKEVEN); // Will fail
  });

  it('should allow custom stop-loss adjustments', () => {
    // This test will fail until we implement custom adjustment logic
    const customStopLoss: StopLoss = {
      price: 140.00, // User-adjusted value
      status: StopLossStatus.CUSTOM,
      progressionHistory: [
        {
          price: 120.00,
          status: StopLossStatus.INITIAL,
          changedAt: new Date(),
          reason: 'Initial stop-loss set at -20%',
        },
        {
          price: 140.00,
          status: StopLossStatus.CUSTOM,
          changedAt: new Date(),
          reason: 'User adjustment',
        },
      ],
    };

    expect(customStopLoss.status).toBe(StopLossStatus.CUSTOM);
    expect(customStopLoss.progressionHistory).toHaveLength(2);
  });
});