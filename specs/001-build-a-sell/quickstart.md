# Quickstart Guide: Sell-in-Thirds Trading Tracker

## Overview
This guide provides step-by-step instructions to get the Sell-in-Thirds Trading Tracker application running and validates that all core functionality works as specified.

## Prerequisites
- Node.js 18+ installed
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Basic understanding of stock trading concepts

## Installation & Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd stockbuy
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Application should be available at `http://localhost:3000`

### 3. Verify Dark Theme
- ✅ Application loads with dark theme by default
- ✅ Financial data displays with high contrast colors
- ✅ Interface is optimized for financial data readability

## Core Functionality Validation

### Test Scenario 1: Create Position (FR-001, FR-002, FR-003)
**Objective**: Verify position creation with automatic target calculation

1. **Action**: Click "Add Position" button
2. **Input**:
   - Ticker: "AAPL"
   - Buy Price: $150.00
   - Shares: 300
3. **Click**: "Create Position"

**Expected Results**:
- ✅ Position created successfully
- ✅ First sell target calculated: $225.00 (+50%)
- ✅ Second sell target calculated: $300.00 (+100%)
- ✅ Initial stop-loss set: $120.00 (-20%)
- ✅ Shares allocated: 100 + 100 + 100 (one-third each)

### Test Scenario 2: Price Simulation (FR-007, FR-008, FR-009)
**Objective**: Verify interactive price slider and real-time calculations

1. **Action**: Select the AAPL position created above
2. **Action**: Move price slider to $200.00
3. **Observe**: Real-time updates

**Expected Results**:
- ✅ Current price updates to $200.00
- ✅ Unrealized profit shows: $15,000 (+33.33%)
- ✅ First target indicator shows "Almost reached" (89% to target)
- ✅ Stop-loss safe (well above $120)
- ✅ UI updates smoothly (<100ms response time)

### Test Scenario 3: First Sale & Stop-Loss Progression (FR-004, FR-005)
**Objective**: Verify trade recording and stop-loss adjustment

1. **Action**: Move price slider to $225.00 (first target)
2. **Action**: Click "Record Sale" button
3. **Input**:
   - Shares to sell: 100
   - Sell price: $225.00
4. **Click**: "Execute Trade"

**Expected Results**:
- ✅ Trade recorded successfully
- ✅ Remaining shares updated: 200
- ✅ Stop-loss adjusted to breakeven: $150.00
- ✅ Realized profit: $7,500 (+50% on sold shares)
- ✅ Trade appears in history

### Test Scenario 4: Second Sale (FR-006)
**Objective**: Verify second target sale and stop-loss maintenance

1. **Action**: Move price slider to $300.00 (second target)
2. **Action**: Click "Record Sale" button
3. **Input**:
   - Shares to sell: 100
   - Sell price: $300.00
4. **Click**: "Execute Trade"

**Expected Results**:
- ✅ Trade recorded successfully
- ✅ Remaining shares updated: 100
- ✅ Stop-loss maintained at breakeven: $150.00
- ✅ Additional realized profit: $15,000 (+100% on sold shares)
- ✅ Portfolio metrics updated correctly

### Test Scenario 5: Portfolio View (FR-010, FR-017)
**Objective**: Verify portfolio dashboard and risk metrics

1. **Action**: Navigate to portfolio dashboard
2. **Observe**: Aggregate metrics

**Expected Results**:
- ✅ All positions displayed in organized view
- ✅ Total portfolio value calculated correctly
- ✅ Total profit/loss percentages accurate
- ✅ Risk metrics show position-level and portfolio-level data
- ✅ Visual indicators for positions at targets/stop-losses

### Test Scenario 6: Data Persistence (FR-011)
**Objective**: Verify session-only storage behavior

1. **Action**: Refresh browser page
2. **Observe**: Data persistence

**Expected Results**:
- ✅ All positions and trades persist after refresh
- ✅ Current price simulations reset (not persisted)
- ✅ Portfolio state fully restored

3. **Action**: Close browser tab and reopen application
4. **Observe**: Data cleanup

**Expected Results**:
- ✅ All data cleared (session-only behavior)
- ✅ Fresh application state on new session

### Test Scenario 7: Input Validation (FR-015, FR-016)
**Objective**: Verify input validation and error handling

1. **Action**: Attempt to create position with invalid ticker "INVALID123"
2. **Expected**: Error message about ticker format

3. **Action**: Attempt to sell 500 shares when only 100 remain
4. **Expected**: Error preventing overselling

5. **Action**: Enter negative buy price
6. **Expected**: Validation error for price input

**Expected Results**:
- ✅ All invalid inputs properly rejected
- ✅ Clear error messages displayed
- ✅ Form remains functional after validation errors

### Test Scenario 8: Responsive Design (FR-014)
**Objective**: Verify mobile and desktop responsiveness

1. **Action**: Resize browser window to mobile width (375px)
2. **Observe**: Layout adaptation

**Expected Results**:
- ✅ Interface adapts to mobile layout
- ✅ All functionality remains accessible
- ✅ Touch-friendly controls for price slider
- ✅ Financial data remains readable

3. **Action**: Resize to desktop width (1200px)
4. **Observe**: Layout expansion

**Expected Results**:
- ✅ Interface expands to use available space
- ✅ Multi-column layout for efficiency
- ✅ All information visible without scrolling

### Test Scenario 9: Accessibility (WCAG 2.1 AA)
**Objective**: Verify accessibility compliance

1. **Action**: Navigate using only keyboard (Tab, Enter, Arrow keys)
2. **Expected**: Full functionality accessible via keyboard

3. **Action**: Test with screen reader
4. **Expected**: All financial data properly announced

**Expected Results**:
- ✅ All interactive elements keyboard accessible
- ✅ ARIA labels present for financial data
- ✅ High contrast maintained in dark theme
- ✅ Focus indicators clearly visible

## Performance Validation

### Calculation Performance (Target: <100ms)
1. **Action**: Move price slider rapidly across range
2. **Expected**: Smooth updates without lag
3. **Measure**: Calculation response time <100ms

### Memory Usage
1. **Action**: Create 20 positions with multiple trades each
2. **Expected**: Application remains responsive
3. **Monitor**: Browser memory usage stays reasonable

## Troubleshooting

### Common Issues

**Issue**: Position not saving after creation
- **Solution**: Check browser console for sessionStorage errors
- **Verify**: Storage quota not exceeded

**Issue**: Price slider not updating calculations
- **Solution**: Verify all props passed correctly to PriceSlider component
- **Check**: Event handlers properly bound

**Issue**: Responsive layout broken on mobile
- **Solution**: Verify Tailwind CSS mobile-first classes applied
- **Test**: Different device sizes in browser dev tools

## Success Criteria

Application passes quickstart validation when:
- ✅ All 9 test scenarios complete successfully
- ✅ No console errors during normal operation
- ✅ Performance targets met (<100ms calculations)
- ✅ Accessibility requirements satisfied
- ✅ Responsive design works across device sizes
- ✅ Session-only storage behavior confirmed

## Next Steps

After successful quickstart validation:
1. Run full test suite: `npm test`
2. Build production version: `npm run build`
3. Deploy application using preferred hosting service
4. Monitor application performance in production environment

## Support

For issues during quickstart:
- Check browser console for errors
- Verify Node.js version compatibility
- Review component prop types for TypeScript errors
- Confirm all dependencies installed correctly