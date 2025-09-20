# TASK-056: InstructorDashboard Modern Service Migration

**Type**: Component Migration - Auth Store + Service Integration
**Priority**: HIGH
**Story Points**: 4
**Sprint**: Phase 2B - Component Migration
**Created**: 2025-09-20
**Status**: ✅ COMPLETED

---

## Executive Summary

Migrate InstructorDashboard component from legacy useAuth hook to modern useAuthStore and update service integrations to use modern service architecture patterns. This establishes the template for complex dashboard components with multiple service dependencies.

## Requirement Classification

**Category**: Technical Debt Reduction + Service Modernization
**Type**: Component Migration
**Business Impact**: HIGH (affects instructor daily workflow)
**Technical Impact**: HIGH (establishes multi-service migration template)

---

## User Stories

### Primary User Story
**As an instructor accessing my dashboard**
I want course statistics and student progress to load efficiently with modern architecture
So that I can quickly overview my teaching responsibilities and student performance.

### Supporting User Stories

**As an instructor**
I want dashboard data to refresh reliably and display accurate statistics
So that I can make informed decisions about course management and student support.

**As a developer**
I want InstructorDashboard to use modern useAuthStore and service patterns
So that component architecture is consistent and maintainable.

**As a developer**
I want a multi-service migration template for complex components
So that future dashboard migrations follow proven patterns.

---

## Acceptance Criteria

### Functional Requirements
- [ ] **Dashboard Display**: All instructor dashboard sections render correctly
- [ ] **Auth Integration**: Uses modern useAuthStore for user authentication state
- [ ] **Service Integration**: progressService and courseService calls updated to modern patterns
- [ ] **Data Loading**: Dashboard data and instructor courses load via modern services
- [ ] **Statistics Display**: Course stats, student counts, completion rates display accurately
- [ ] **Navigation**: All dashboard links and actions work correctly
- [ ] **Zero Regressions**: Identical functionality to legacy implementation

### Technical Requirements
- [ ] **Auth Store Integration**: Replace `useAuth()` with `useAuthStore()`
- [ ] **Service Modernization**: Update progressService and courseService to modern patterns
- [ ] **Import Updates**: Remove legacy auth context imports
- [ ] **Type Safety**: Full TypeScript type coverage maintained
- [ ] **React Query**: Maintain existing React Query patterns
- [ ] **Performance**: No performance degradation
- [ ] **Error Handling**: Consistent error handling patterns

### Quality Requirements
- [ ] **Test Coverage**: 100% test coverage maintained
- [ ] **Code Quality**: Follows modern component patterns
- [ ] **Documentation**: Migration patterns documented
- [ ] **Accessibility**: WCAG 2.1 AA compliance maintained

---

## Technical Implementation Tasks

### Phase 1: Analysis and Preparation (1 hour)
- [ ] **Current Implementation Analysis**
  - Review InstructorDashboard.tsx auth and service usage patterns
  - Identify useAuth dependencies and service calls
  - Document progressService.fetchInstructorDashboardData() usage
  - Document courseService.fetchInstructorCourses() usage
  - Verify test coverage and current test patterns

### Phase 2: Auth Migration (1 hour)
- [ ] **Auth Store Integration**
  - Replace `useAuth()` import with `useAuthStore()`
  - Update component to destructure from useAuthStore
  - Remove legacy AuthContext import
  - Update user role checks and data display
  - Add debug logging for auth state verification

### Phase 3: Service Integration (1.5 hours)
- [ ] **Progress Service Integration**
  - Review progressService.fetchInstructorDashboardData() for modern patterns
  - Update to use modern service architecture if needed
  - Verify React Query integration works with modern services
  - Test dashboard statistics display

- [ ] **Course Service Integration**
  - Review courseService.fetchInstructorCourses() for modern patterns
  - Update to use modern service architecture if needed
  - Verify course listing and display functionality
  - Test course action buttons and navigation

### Phase 4: Testing Updates (30 minutes)
- [ ] **Unit Test Migration**
  - Update InstructorDashboard.test.tsx to mock useAuthStore
  - Update service mocks for modern patterns
  - Verify test coverage remains at 100%
  - Add tests for modern auth integration patterns
  - Test React Query integration with modern services

### Phase 5: Validation and Documentation (30 minutes)
- [ ] **Integration Testing**
  - Manual testing with instructor authentication
  - Verify dashboard statistics display correctly
  - Test course creation and management workflows
  - Validate all navigation links and actions

- [ ] **Pattern Documentation**
  - Update Good Practices guide with InstructorDashboard patterns
  - Document multi-service migration template
  - Record service integration challenges and solutions

---

## Architecture Impact

### Modern Auth Integration
```typescript
// Before (Legacy Pattern)
import { useAuth } from '@context/auth/AuthContext';
const { user } = useAuth();

// After (Modern Pattern)
import { useAuthStore } from '@/store/modernAuthStore';
const { user } = useAuthStore();
```

### Service Architecture Analysis
**Current Service Usage**:
- `progressService.fetchInstructorDashboardData()` - Dashboard statistics
- `courseService.fetchInstructorCourses()` - Instructor's courses

**Migration Assessment**:
- Verify if these services already use modern patterns from TASK-012
- Update service calls if needed to use modern architecture
- Maintain React Query integration patterns

### Component Architecture
- **Auth State**: Modern useAuthStore for authentication and user data
- **Service Integration**: Modern service patterns for data fetching
- **React Query**: Maintain existing query patterns with modern services
- **Error Handling**: Consistent with modern service error patterns

---

## Dependencies

### Prerequisites
- ✅ **TASK-050**: Modern AuthStore implementation (COMPLETED)
- ✅ **TASK-055**: ProfilePage migration (establishes auth migration template)
- ✅ **TASK-012**: Modern Service Architecture (foundation services available)
- ✅ **progressService**: Available (may need modernization verification)
- ✅ **courseService**: Available (may need modernization verification)

### Dependency Impact
- **Templates**: Multi-service migration pattern for other dashboards
- **Enables**: Complex component migration patterns
- **Supports**: Phase 2B migration completion

---

## Service Integration Analysis

### Current Service Calls Analysis
**progressService.fetchInstructorDashboardData()**:
- Returns: `IInstructorDashboardData`
- Usage: Dashboard statistics and metrics
- Migration needed: Verify modern service compliance

**courseService.fetchInstructorCourses()**:
- Returns: `IPaginatedResponse<ICourse>`
- Usage: Instructor's course listing
- Migration needed: Verify modern service compliance

### React Query Integration
```typescript
// Current pattern (maintain if services are modern)
const { data, isLoading, error } = useQuery<IInstructorDashboardData>({
  queryKey: ['instructorDashboard', user?.id],
  queryFn: () => progressService.fetchInstructorDashboardData(),
  enabled: !!user?.id && (user?.role === 'instructor' || user?.role === 'admin'),
});
```

### Migration Strategy
1. **Service Verification**: Check if services use modern architecture patterns
2. **Selective Updates**: Update only services that need modernization
3. **React Query Compatibility**: Ensure modern services work with existing query patterns

---

## Testing Strategy

### Unit Testing Approach
```typescript
// Modern test mock pattern
import { useAuthStore } from '@/store/modernAuthStore';
import progressService from '@/services/resources/progressService';
import { courseService } from '@/services/resources/courseService';

jest.mock('@/store/modernAuthStore');
jest.mock('@/services/resources/progressService');
jest.mock('@/services/resources/courseService');

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
```

### Test Coverage Areas
- **Auth Integration**: User data from modern auth store
- **Dashboard Statistics**: progressService integration
- **Course Listing**: courseService integration
- **Loading States**: Multiple service loading coordination
- **Error Handling**: Service error scenarios
- **User Role Validation**: Instructor/admin role checks

### E2E Test Impact
**Affected Tests**:
- Instructor dashboard navigation tests
- Course statistics display tests
- Instructor course management flows
- Dashboard action button tests

**Note**: E2E tests will be updated after all component migrations are complete.

---

## Risk Assessment

### Technical Risks (Medium)
- **Service Dependencies**: Multiple service integrations
- **React Query Complexity**: Coordination of multiple queries
- **User Role Logic**: Instructor/admin permission handling

**Mitigation**:
- Follow established patterns from TASK-050 and TASK-055
- Use Good Practices guide for multi-service patterns
- Comprehensive testing of service integrations

### Business Risks (Medium)
- **Instructor Workflow**: Core daily workflow for instructors
- **Data Accuracy**: Dashboard statistics must remain accurate

**Mitigation**:
- Maintain 100% functional equivalence
- Thorough testing of data display and calculations
- Quick rollback capability maintained

---

## Performance Considerations

### Service Call Optimization
- **Query Coordination**: Ensure efficient loading of multiple data sources
- **Cache Management**: Leverage React Query caching for dashboard data
- **Error Isolation**: Prevent one service failure from blocking entire dashboard

### Memory Usage
- **Modern Services**: Leverage modern service efficiency gains
- **Component Optimization**: Maintain efficient render patterns

---

## Success Metrics

### Performance Targets
- **Load Time**: No performance degradation vs legacy implementation
- **Memory Usage**: Consistent with modern service patterns
- **Bundle Size**: No increase (potential decrease with modern imports)

### Quality Targets
- **Test Coverage**: Maintain 100% coverage
- **TypeScript**: 100% type safety
- **Functionality**: Zero regressions from legacy implementation

### Migration Template Success
- **Pattern Establishment**: Reusable multi-service migration template
- **Documentation**: Clear migration steps for complex components
- **Good Practices**: Updated with dashboard-specific learnings

---

## Implementation Checklist

### Auth Migration
- [ ] Replace `useAuth()` import with `useAuthStore()`
- [ ] Update user data destructuring
- [ ] Remove legacy auth context import
- [ ] Update user role checks in React Query enabled conditions
- [ ] Update user display in dashboard header

### Service Integration
- [ ] Verify progressService modern compliance
- [ ] Verify courseService modern compliance
- [ ] Update service calls if needed
- [ ] Maintain React Query integration patterns
- [ ] Test all dashboard data loading

### Testing Updates
- [ ] Update test mocks for useAuthStore
- [ ] Update service mocks if changed
- [ ] Verify all tests pass
- [ ] Add integration tests for modern patterns

---

## Definition of Done

- [ ] InstructorDashboard uses useAuthStore instead of useAuth
- [ ] All service integrations use modern patterns
- [ ] All tests pass with 100% coverage maintained
- [ ] Manual testing confirms identical functionality
- [ ] Dashboard statistics display accurately
- [ ] All navigation links and actions work correctly
- [ ] No TypeScript errors or warnings
- [ ] Performance metrics show no degradation
- [ ] Good Practices guide updated with multi-service patterns
- [ ] Multi-service migration template documented
- [ ] Code review completed and approved

---

## Notes

This task establishes the multi-service migration template for Phase 2B. InstructorDashboard is strategically chosen because:

1. **Complexity**: Combines auth migration with multiple service dependencies
2. **Business Impact**: Core instructor workflow component
3. **Template Value**: Creates pattern for other dashboard components
4. **Service Integration**: Tests modern service architecture in complex scenarios

Success here provides the foundation for migrating other complex components with multiple service dependencies, such as student dashboards and analytics pages.

The migration maintains React Query patterns while ensuring all underlying services use modern architecture, establishing a proven approach for complex component migrations.

---

**Prepared**: 2025-09-20 by Migration Team
**Next Review**: After implementation completion
**Template For**: Multi-service dashboard component migrations