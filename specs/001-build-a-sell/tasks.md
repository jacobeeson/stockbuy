# Tasks: Sell-in-Thirds Trading Tracker

**Input**: Design documents from `/specs/001-build-a-sell/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → COMPLETE: React 18+ with TypeScript, Tailwind CSS, sessionStorage
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → Position, Trade, SellTargets, StopLoss
   → contracts/: position-service.ts, component-props.ts → test tasks
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: React/TypeScript project, dependencies, Tailwind config
   → Tests: service tests, component tests, integration tests
   → Core: types, services, hooks, components
   → Integration: storage service, calculation engine
   → Polish: accessibility, performance optimization
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root (per plan.md)
- TypeScript React application with session-only storage

## Phase 3.1: Setup
- [ ] T001 Create React TypeScript project structure with src/, tests/, public/ directories
- [ ] T002 Initialize package.json with React 18+, TypeScript 5.x, Tailwind CSS, Lucide React dependencies
- [ ] T003 [P] Configure Tailwind CSS for dark theme financial interface in tailwind.config.js
- [ ] T004 [P] Configure TypeScript with strict mode in tsconfig.json
- [ ] T005 [P] Configure Jest and React Testing Library in jest.config.js
- [ ] T006 [P] Setup ESLint with React/TypeScript rules in .eslintrc.js

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Type Definition Tests
- [ ] T007 [P] Type definition tests for Position interface in tests/types/position.test.ts
- [ ] T008 [P] Type definition tests for Trade interface in tests/types/trade.test.ts
- [ ] T009 [P] Type definition tests for SellTargets interface in tests/types/sell-targets.test.ts
- [ ] T010 [P] Type definition tests for StopLoss interface in tests/types/stop-loss.test.ts

### Service Contract Tests
- [ ] T011 [P] Position service contract tests in tests/services/position-service.test.ts
- [ ] T012 [P] Calculation service contract tests in tests/services/calculation-service.test.ts
- [ ] T013 [P] Storage service contract tests in tests/services/storage-service.test.ts
- [ ] T014 [P] Validation service contract tests in tests/services/validation-service.test.ts

### Component Tests
- [ ] T015 [P] PositionForm component tests in tests/components/PositionForm.test.tsx
- [ ] T016 [P] PositionList component tests in tests/components/PositionList.test.tsx
- [ ] T017 [P] PositionCard component tests in tests/components/PositionCard.test.tsx
- [ ] T018 [P] PriceSlider component tests in tests/components/PriceSlider.test.tsx
- [ ] T019 [P] TradeForm component tests in tests/components/TradeForm.test.tsx
- [ ] T020 [P] Dashboard component tests in tests/components/Dashboard.test.tsx

### Integration Tests (User Stories)
- [ ] T021 [P] Position creation integration test in tests/integration/create-position.test.tsx
- [ ] T022 [P] Price simulation integration test in tests/integration/price-simulation.test.tsx
- [ ] T023 [P] Trade recording integration test in tests/integration/record-trade.test.tsx
- [ ] T024 [P] Stop-loss progression integration test in tests/integration/stop-loss-progression.test.tsx
- [ ] T025 [P] Portfolio dashboard integration test in tests/integration/portfolio-dashboard.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Type Definitions
- [ ] T026 [P] Position interface and enums in src/types/position.ts
- [ ] T027 [P] Trade interface and enums in src/types/trade.ts
- [ ] T028 [P] SellTargets interface in src/types/sell-targets.ts
- [ ] T029 [P] StopLoss interface and enums in src/types/stop-loss.ts
- [ ] T030 [P] Portfolio interface in src/types/portfolio.ts

### Services Implementation
- [ ] T031 [P] Calculation service implementation in src/services/calculation-service.ts
- [ ] T032 [P] Validation service implementation in src/services/validation-service.ts
- [ ] T033 [P] Storage service implementation in src/services/storage-service.ts
- [ ] T034 Position service implementation in src/services/position-service.ts (depends on T031-T033)

### Custom Hooks
- [ ] T035 [P] usePositions hook in src/hooks/usePositions.ts
- [ ] T036 [P] usePortfolio hook in src/hooks/usePortfolio.ts
- [ ] T037 [P] usePriceSimulation hook in src/hooks/usePriceSimulation.ts

### Core Components
- [ ] T038 [P] PositionForm component in src/components/PositionForm/PositionForm.tsx
- [ ] T039 [P] PositionList component in src/components/PositionList/PositionList.tsx
- [ ] T040 [P] PositionCard component in src/components/PositionCard/PositionCard.tsx
- [ ] T041 [P] PriceSlider component in src/components/PriceSlider/PriceSlider.tsx
- [ ] T042 [P] TradeForm component in src/components/TradeForm/TradeForm.tsx
- [ ] T043 [P] FinancialDisplay component in src/components/FinancialDisplay/FinancialDisplay.tsx

### Layout Components
- [ ] T044 [P] Dashboard main component in src/components/Dashboard/Dashboard.tsx
- [ ] T045 [P] ResponsiveLayout component in src/components/Layout/ResponsiveLayout.tsx
- [ ] T046 [P] ThemeProvider component in src/components/Theme/ThemeProvider.tsx

## Phase 3.4: Integration
- [ ] T047 Connect PositionForm to position service in src/components/PositionForm/PositionForm.tsx
- [ ] T048 Connect PriceSlider to calculation service in src/components/PriceSlider/PriceSlider.tsx
- [ ] T049 Connect TradeForm to position service in src/components/TradeForm/TradeForm.tsx
- [ ] T050 Integrate storage service with position service for session persistence
- [ ] T051 Wire up Dashboard with all connected components

## Phase 3.5: Polish & Optimization
- [ ] T052 [P] Accessibility improvements (ARIA labels, keyboard navigation) in src/utils/accessibility.ts
- [ ] T053 [P] Performance optimization (memoization, debouncing) in src/utils/performance.ts
- [ ] T054 [P] Error boundary implementation in src/components/ErrorBoundary/ErrorBoundary.tsx
- [ ] T055 [P] Loading states and skeleton screens in src/components/Loading/LoadingSpinner.tsx
- [ ] T056 Main App component setup in src/App.tsx
- [ ] T057 Index file and app mounting in src/index.tsx
- [ ] T058 CSS dark theme styles in src/styles/globals.css
- [ ] T059 Run quickstart validation scenarios from quickstart.md
- [ ] T060 Performance testing (<100ms calculation requirement)

## Dependencies

### Critical Dependencies
- Setup (T001-T006) before all other tasks
- Tests (T007-T025) before implementation (T026-T051)
- Types (T026-T030) before services (T031-T034)
- Services (T031-T034) before hooks (T035-T037)
- Hooks (T035-T037) before components (T038-T046)
- Core components before integration (T047-T051)
- Integration before polish (T052-T060)

### File Dependencies
- T034 blocks T047, T049, T050 (position service used by multiple components)
- T031 blocks T048 (calculation service used by price slider)
- T033 blocks T050 (storage service integration)
- T056 blocks T057 (App component needed for index)

## Parallel Execution Examples

### Setup Phase (after T001-T002)
```bash
# Launch T003-T006 together:
Task: "Configure Tailwind CSS for dark theme financial interface in tailwind.config.js"
Task: "Configure TypeScript with strict mode in tsconfig.json"
Task: "Configure Jest and React Testing Library in jest.config.js"
Task: "Setup ESLint with React/TypeScript rules in .eslintrc.js"
```

### Test Phase (TDD)
```bash
# Launch type tests T007-T010 together:
Task: "Type definition tests for Position interface in tests/types/position.test.ts"
Task: "Type definition tests for Trade interface in tests/types/trade.test.ts"
Task: "Type definition tests for SellTargets interface in tests/types/sell-targets.test.ts"
Task: "Type definition tests for StopLoss interface in tests/types/stop-loss.test.ts"

# Launch service tests T011-T014 together:
Task: "Position service contract tests in tests/services/position-service.test.ts"
Task: "Calculation service contract tests in tests/services/calculation-service.test.ts"
Task: "Storage service contract tests in tests/services/storage-service.test.ts"
Task: "Validation service contract tests in tests/services/validation-service.test.ts"
```

### Implementation Phase
```bash
# Launch type definitions T026-T030 together:
Task: "Position interface and enums in src/types/position.ts"
Task: "Trade interface and enums in src/types/trade.ts"
Task: "SellTargets interface in src/types/sell-targets.ts"
Task: "StopLoss interface and enums in src/types/stop-loss.ts"
Task: "Portfolio interface in src/types/portfolio.ts"

# Launch service implementations T031-T033 together (T034 sequential):
Task: "Calculation service implementation in src/services/calculation-service.ts"
Task: "Validation service implementation in src/services/validation-service.ts"
Task: "Storage service implementation in src/services/storage-service.ts"
```

## Notes
- [P] tasks = different files, no dependencies between them
- All tests must fail before starting implementation (TDD requirement)
- Commit after each task completion
- Session-only storage means no backend/database setup required
- Dark theme and accessibility are critical requirements
- Performance target: <100ms for all calculations

## Task Generation Rules Applied

1. **From Contracts**:
   - position-service.ts → T011, T034
   - component-props.ts → T015-T020

2. **From Data Model**:
   - Position entity → T007, T026
   - Trade entity → T008, T027
   - SellTargets entity → T009, T028
   - StopLoss entity → T010, T029

3. **From User Stories**:
   - Create position story → T021
   - Price simulation story → T022
   - Trade recording story → T023
   - Portfolio view story → T025

4. **Ordering Applied**:
   - Setup → Tests → Types → Services → Components → Integration → Polish
   - TDD enforced: all tests before any implementation

## Validation Checklist

- [x] All contracts have corresponding tests (T011-T014)
- [x] All entities have model tasks (T026-T030)
- [x] All tests come before implementation (T007-T025 before T026+)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Integration tests match quickstart scenarios
- [x] Performance and accessibility requirements included