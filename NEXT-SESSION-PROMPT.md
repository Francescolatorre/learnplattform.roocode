# Next Coding Session Prompt

## 🎯 **SESSION OBJECTIVE**

**Continue Modern Service Migration - Phase 2B: Component Migration**

Start systematic migration of high-traffic components from legacy service patterns to modern service architecture, beginning with CourseDetails component as the primary target.

---

## 📊 **CURRENT PROJECT STATUS**

### ✅ **COMPLETED (Phase 2A)**

- **5 Core Tasks Delivered**: 27 total story points
- **Services Modernized**: 5/5 (100% - all core services complete)
- **Stores Migrated**: 2/4 (50% - TaskStore + AuthStore complete)
- **Infrastructure**: Modern service architecture fully established

### 🔄 **READY FOR NEXT SESSION**

- **Phase 2B**: Component migration phase ready to begin
- **Architecture**: Complete modern infrastructure in place
- **Documentation**: Migration guides and patterns established
- **Testing**: Comprehensive test frameworks proven

---

## 🎯 **PRIMARY SESSION TARGET**

### **TASK-051: CourseDetails Component Migration** (5 story points)

**Priority**: HIGH - Most critical high-traffic component

**Scope**: Migrate CourseDetails component from legacy service calls to modern service architecture

**Why This Component First**:

- **High Traffic**: Core user journey component
- **Service Heavy**: Uses multiple services (course, enrollment, progress)
- **Integration Complexity**: Good test of modern architecture
- **User Impact**: Critical for student and instructor workflows

**Expected Deliverables**:

- [ ] CourseDetails component migrated to modern services
- [ ] All service calls updated to use modern architecture
- [ ] Tests updated and passing (100% compatibility)
- [ ] Performance validation (loading times, memory usage)
- [ ] Migration patterns documented for future components

---

## 📋 **SECONDARY TARGETS** (If Time Permits)

### **TASK-052: LoginForm Component Migration** (3 story points)

- **Priority**: HIGH - Authentication flow component
- **Benefits**: Uses new modern AuthStore
- **Impact**: Core user authentication experience

### **TASK-053: RegisterForm Component Migration** (3 story points)

- **Priority**: HIGH - User onboarding component
- **Benefits**: Leverages modern AuthStore patterns
- **Impact**: New user registration flow

### **TASK-054: UserProfileMenu Component Migration** (3 story points)

- **Priority**: MEDIUM - Navigation component
- **Benefits**: User profile management
- **Impact**: Header/navigation user experience

---

## 🏗️ **ARCHITECTURE FOUNDATION**

### **Modern Services Available** (Ready to Use)

```typescript
// Core Services (TASK-012)
import { modernCourseService } from '@/services/resources/modernCourseService';
import { modernLearningTaskService } from '@/services/resources/modernLearningTaskService';
import { modernEnrollmentService } from '@/services/resources/modernEnrollmentService';
import { modernProgressService } from '@/services/resources/modernProgressService';

// Authentication (TASK-050)
import { modernAuthService } from '@/services/auth/modernAuthService';

// Store Integration (TASK-027-B, TASK-049, TASK-050)
import { useTaskStore } from '@/store/taskStore'; // Modernized
import { useAuthStore } from '@/store/modernAuthStore'; // New modern store
```

### **Migration Patterns Established**

- **Service Factory**: Dependency injection and service instantiation
- **Error Handling**: `withManagedExceptions` for consistent error management
- **Store Integration**: Service-to-store integration patterns
- **Testing**: Mock strategies and test patterns proven

---

## 📖 **MIGRATION GUIDE REFERENCE**

### **Component Migration Pattern** (From TASK-048)

```typescript
// BEFORE (Legacy)
import { fetchCourses } from '@/services/resources/courseService';

// AFTER (Modern)
import { modernCourseService } from '@/services/resources/modernCourseService';
```

### **Service Call Updates**

```typescript
// Legacy Pattern
const courses = await fetchCourses(params);

// Modern Pattern
const courses = await modernCourseService.getCourses(params);
```

### **Error Handling Enhancement**

```typescript
// Modern Error Handling (automatic via withManagedExceptions)
try {
  const course = await modernCourseService.getCourseDetails(courseId);
  // Handle success
} catch (error) {
  // Error automatically handled by managed exceptions
  console.error('Course fetch failed:', error.message);
}
```

---

## 🔍 **PRE-SESSION SETUP**

### **Codebase Context**

- **Branch**: Currently on `main` with all Phase 2A work merged
- **Status**: Clean working directory, all PRs merged
- **Architecture**: Modern service foundation complete

### **Key Files to Examine**

```bash
# Modern Services (Reference)
frontend/src/services/resources/modernCourseService.ts
frontend/src/services/auth/modernAuthService.ts
frontend/src/store/modernAuthStore.ts
frontend/src/store/taskStore.ts

# Migration Documentation
docs/MIGRATION-AuthContext-to-ModernAuthStore.md
memory_bank/workspace/analysis/Modern-Service-Migration-PRD.md

# Target Component (Primary)
frontend/src/components/courses/CourseDetails.tsx  # Find this component
frontend/src/components/courses/CourseDetails.test.tsx  # If exists
```

### **Discovery Tasks**

1. **Locate CourseDetails Component**: Find the actual CourseDetails component file
2. **Analyze Current Implementation**: Understand current service dependencies
3. **Identify Migration Scope**: Map all service calls to modern equivalents
4. **Plan Testing Strategy**: Ensure comprehensive test coverage

---

## 🚀 **SESSION EXECUTION PLAN**

### **Phase 1: Discovery & Analysis** (30 minutes)

1. **Find CourseDetails Component**: Locate in codebase
2. **Analyze Dependencies**: Map current service usage
3. **Plan Migration**: Create specific migration strategy
4. **Set Up Branch**: Create feature branch for TASK-051

### **Phase 2: Implementation** (60-90 minutes)

1. **Service Import Migration**: Update to modern services
2. **Service Call Updates**: Replace legacy calls with modern methods
3. **Error Handling**: Implement modern error patterns
4. **State Management**: Integrate with modern stores if needed

### **Phase 3: Testing & Validation** (30-45 minutes)

1. **Update Tests**: Migrate test mocks to modern services
2. **Component Testing**: Ensure all functionality works
3. **Integration Testing**: Validate with other components
4. **Performance Check**: Verify improvement metrics

### **Phase 4: Documentation & PR** (15-30 minutes)

1. **Update Migration Notes**: Document patterns used
2. **Create PR**: Comprehensive PR with migration details
3. **Update Progress**: Mark TASK-051 complete in tracking

---

## 📊 **SUCCESS CRITERIA**

### **Technical Success**

- [ ] CourseDetails component uses only modern services
- [ ] All tests pass (100% compatibility maintained)
- [ ] No regressions in component functionality
- [ ] Performance improves (memory usage, response times)

### **Process Success**

- [ ] Migration follows established patterns
- [ ] Code quality maintained (linting, TypeScript)
- [ ] Documentation updated appropriately
- [ ] PR ready for review with comprehensive details

### **Strategic Success**

- [ ] Component migration template refined
- [ ] Team confidence in migration process increased
- [ ] Path cleared for remaining component migrations
- [ ] Modern architecture adoption accelerated

---

## 🔄 **IF ISSUES ARISE**

### **Fallback Plan**

If CourseDetails proves more complex than expected:

1. **Scope Reduction**: Focus on core service calls first
2. **Alternative Target**: Switch to LoginForm (simpler, uses AuthStore)
3. **Partial Migration**: Complete what's possible, document remaining work

### **Support Resources**

- **Migration Guide**: `docs/MIGRATION-AuthContext-to-ModernAuthStore.md`
- **Service Examples**: All modern services have comprehensive examples
- **Test Patterns**: Proven testing approaches from TASK-048, TASK-049, TASK-050
- **Architecture Reference**: Complete PRD with all patterns documented

---

## 💡 **CONTEXT PROMPT FOR CLAUDE**

*"Continue the Modern Service Migration initiative. We've successfully completed Phase 2A (core infrastructure) with 5 tasks delivered (27 story points). Now starting Phase 2B - component migration phase. Primary target: TASK-051 CourseDetails Component Migration (5 story points). All modern services and stores are ready. Migration patterns are established. Focus on systematic, high-quality component migration following proven patterns from previous tasks."*

---

**Last Updated**: 2025-09-16
**Project Status**: 🟢 GREEN - Ready for Phase 2B
**Next Session Priority**: TASK-051 CourseDetails Component Migration
