# Admin Platform Task Implementation Plans

## Overview
Detailed implementation plans for all 8 admin platform tasks, designed for Django REST + React TypeScript architecture with modern service patterns.

---

## TASK-060: Real-Time Admin Dashboard Implementation Plan

### Technical Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │   WebSocket     │    │   Metrics       │
│   Frontend      │◄──►│   Gateway       │◄──►│   Collector     │
│   (React)       │    │   (Django       │    │   (Background   │
│                 │    │   Channels)     │    │   Tasks)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Widget        │    │   Real-time     │    │   System        │
│   Framework     │    │   Data Stream   │    │   Monitoring    │
│   (React)       │    │   (Redis)       │    │   (Metrics DB)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Development Phases

#### Phase 1: Backend Infrastructure (Week 1-2)
**Django Models & Services**:
```python
# apps/admin/models.py
class SystemMetric(models.Model):
    metric_type = models.CharField(max_length=100)
    metric_name = models.CharField(max_length=200)
    value = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict)

class DashboardWidget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    widget_type = models.CharField(max_length=100)
    position = models.JSONField(default=dict)
    config = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)

# apps/admin/services/dashboard_service.py
class DashboardService(BaseService):
    async def get_system_health(self) -> Dict[str, Any]:
        # Aggregate health metrics from multiple sources

    async def get_real_time_metrics(self) -> Dict[str, Any]:
        # Fetch live platform metrics

    async def create_alert(self, metric_data: Dict) -> None:
        # Generate alerts based on thresholds
```

**API Endpoints**:
```python
# apps/admin/urls.py
urlpatterns = [
    path('dashboard/health/', SystemHealthView.as_view()),
    path('dashboard/metrics/', DashboardMetricsView.as_view()),
    path('dashboard/widgets/', DashboardWidgetViewSet.as_view()),
    path('dashboard/alerts/', AlertViewSet.as_view()),
]

# WebSocket consumer for real-time updates
class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("dashboard", self.channel_name)

    async def receive(self, text_data):
        # Handle real-time metric requests
```

#### Phase 2: Real-Time Infrastructure (Week 2-3)
**WebSocket Setup**:
```python
# settings.py
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

# Celery tasks for metric collection
@shared_task
def collect_system_metrics():
    # Collect CPU, memory, disk usage
    # Collect application metrics
    # Broadcast to WebSocket consumers
```

#### Phase 3: Frontend Dashboard (Week 3-4)
**Modern Service Integration**:
```typescript
// frontend/src/services/admin/modernAdminDashboardService.ts
export class ModernAdminDashboardService extends BaseService {
  private websocket: WebSocket | null = null;

  async getSystemHealth(): Promise<SystemHealthData> {
    return this.apiClient.get(`${this.endpoints.admin.dashboard}/health/`);
  }

  async subscribeToMetrics(callback: MetricsCallback): Promise<void> {
    this.websocket = new WebSocket(`ws://localhost:8000/ws/dashboard/`);
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };
  }

  async saveWidgetLayout(widgets: DashboardWidget[]): Promise<void> {
    return this.apiClient.post(`${this.endpoints.admin.dashboard}/widgets/`, { widgets });
  }
}
```

**React Components**:
```typescript
// AdminDashboard/DashboardLayout.tsx
export const DashboardLayout: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const dashboardService = ServiceFactory.getInstance().getService(ModernAdminDashboardService);

  useEffect(() => {
    dashboardService.subscribeToMetrics(setMetrics);
    return () => dashboardService.disconnect();
  }, []);

  return (
    <DashboardGrid>
      {widgets.map(widget => (
        <WidgetContainer key={widget.id} widget={widget} metrics={metrics} />
      ))}
    </DashboardGrid>
  );
};

// HealthOverview/SystemHealthWidget.tsx
export const SystemHealthWidget: React.FC<WidgetProps> = ({ metrics }) => {
  const healthStatus = useMemo(() => {
    if (!metrics) return 'unknown';
    return calculateOverallHealth(metrics);
  }, [metrics]);

  return (
    <Widget title="System Health">
      <HealthIndicator status={healthStatus} />
      <MetricsList metrics={metrics?.system} />
    </Widget>
  );
};
```

### Testing Strategy
```typescript
// __tests__/dashboard.test.ts
describe('Admin Dashboard', () => {
  test('loads system health metrics', async () => {
    const service = new ModernAdminDashboardService();
    const health = await service.getSystemHealth();
    expect(health.overall_status).toBeDefined();
  });

  test('real-time updates work correctly', (done) => {
    const service = new ModernAdminDashboardService();
    service.subscribeToMetrics((data) => {
      expect(data.timestamp).toBeDefined();
      done();
    });
  });
});
```

---

## TASK-061: Content Moderation Implementation Plan

### Technical Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Moderation    │    │   Workflow      │    │   Content       │
│   Queue UI      │◄──►│   Engine        │◄──►│   Analysis      │
│   (React)       │    │   (Django)      │    │   (AI Services) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Reviewer      │    │   Approval      │    │   External      │
│   Tools         │    │   Workflow      │    │   Services      │
│   (React)       │    │   (State Mgmt)  │    │   (Plagiarism)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Development Phases

#### Phase 1: Moderation Models & Workflow (Week 1-2)
```python
# apps/moderation/models.py
class ContentModerationRequest(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    status = models.CharField(max_length=50, choices=[
        ('pending', 'Pending Review'),
        ('in_review', 'In Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], default='pending')

    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(User, null=True, on_delete=SET_NULL)

    automated_analysis = models.JSONField(default=dict)
    reviewer_notes = models.TextField(blank=True)

    submitted_at = models.DateTimeField(auto_now_add=True)
    sla_deadline = models.DateTimeField()

class ModerationDecision(models.Model):
    request = models.ForeignKey(ContentModerationRequest, on_delete=models.CASCADE)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    decision = models.CharField(max_length=20)
    comments = models.TextField(blank=True)
    decided_at = models.DateTimeField(auto_now_add=True)

# Workflow service
class ModerationService(BaseService):
    def submit_for_review(self, content_object, submitted_by: User) -> ContentModerationRequest:
        # Create moderation request
        # Run automated analysis
        # Assign to reviewer based on workload

    def process_automated_analysis(self, content) -> Dict[str, Any]:
        # Text analysis for inappropriate content
        # Plagiarism detection
        # Accessibility compliance check

    def make_decision(self, request: ContentModerationRequest, decision: str) -> None:
        # Update request status
        # Notify content creator
        # Log decision for audit
```

#### Phase 2: Content Analysis Integration (Week 2-3)
```python
# apps/moderation/services/content_analysis_service.py
class ContentAnalysisService(BaseService):
    def analyze_text_content(self, text: str) -> Dict[str, Any]:
        analysis_results = {}

        # Language analysis
        analysis_results['language_check'] = self._check_language_appropriateness(text)

        # Plagiarism detection
        analysis_results['plagiarism_check'] = self._check_plagiarism(text)

        # Educational quality assessment
        analysis_results['quality_assessment'] = self._assess_educational_quality(text)

        return analysis_results

    def _check_language_appropriateness(self, text: str) -> Dict:
        # Integration with content filtering APIs
        # Custom word lists and patterns
        # Contextual analysis for educational content

    def _check_plagiarism(self, text: str) -> Dict:
        # Integration with plagiarism detection services
        # Similarity scoring
        # Source identification
```

#### Phase 3: Frontend Moderation Interface (Week 3-4)
```typescript
// frontend/src/services/admin/modernModerationService.ts
export class ModernModerationService extends BaseService {
  async getModerationQueue(filters?: ModerationFilters): Promise<ModerationRequest[]> {
    const url = this.buildUrl(`${this.endpoints.admin.moderation}/queue/`, filters);
    const response = await this.apiClient.get(url);
    return this.normalizeArrayResponse<ModerationRequest>(response);
  }

  async submitDecision(requestId: string, decision: ModerationDecision): Promise<void> {
    await this.apiClient.post(`${this.endpoints.admin.moderation}/decisions/`, {
      request_id: requestId,
      ...decision
    });
  }

  async bulkModerate(requestIds: string[], action: BulkAction): Promise<BulkResult> {
    return this.apiClient.post(`${this.endpoints.admin.moderation}/bulk-actions/`, {
      request_ids: requestIds,
      action
    });
  }
}

// ModerationDashboard/ModerationQueue.tsx
export const ModerationQueue: React.FC = () => {
  const [requests, setRequests] = useState<ModerationRequest[]>([]);
  const [filters, setFilters] = useState<ModerationFilters>({});
  const moderationService = ServiceFactory.getInstance().getService(ModernModerationService);

  const loadQueue = useCallback(async () => {
    const data = await moderationService.getModerationQueue(filters);
    setRequests(data);
  }, [filters]);

  return (
    <div className="moderation-queue">
      <QueueFilters filters={filters} onFiltersChange={setFilters} />
      <QueueList
        requests={requests}
        onDecision={(requestId, decision) => handleDecision(requestId, decision)}
      />
    </div>
  );
};
```

---

## TASK-062: User Management Implementation Plan

### Technical Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Search   │    │   Profile       │    │   Support       │
│   & Filters     │◄──►│   Management    │◄──►│   Ticketing     │
│   (React)       │    │   (Django)      │    │   (Django)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Bulk          │    │   Activity      │    │   Analytics     │
│   Operations    │    │   Tracking      │    │   & Insights    │
│   (Queue)       │    │   (Audit Log)   │    │   (Analytics)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Development Phases

#### Phase 1: Enhanced User Models (Week 1-2)
```python
# apps/support/models.py (extending User model)
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    account_status = models.CharField(max_length=50, choices=[
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('pending', 'Pending Activation'),
        ('disabled', 'Disabled'),
    ], default='active')

    status_reason = models.TextField(blank=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    risk_score = models.FloatField(default=0.0)
    support_priority = models.CharField(max_length=20, default='normal')

class SupportTicket(models.Model):
    ticket_id = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(User, null=True, on_delete=SET_NULL)

    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=20, default='normal')
    status = models.CharField(max_length=50, default='open')

    created_at = models.DateTimeField(auto_now_add=True)
    sla_deadline = models.DateTimeField()

class UserActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=100)
    activity_data = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)

# Services
class UserManagementService(BaseService):
    def get_user_profile_complete(self, user_id: int) -> Dict[str, Any]:
        # Comprehensive user data aggregation
        # Activity history
        # Enrollment and progress data
        # Support ticket history

    def calculate_user_risk_score(self, user: User) -> float:
        # Risk scoring based on activity patterns
        # Failed login attempts
        # Unusual access patterns
        # Support ticket history
```

#### Phase 2: Support Ticket System (Week 2-3)
```python
# apps/support/services/support_service.py
class SupportService(BaseService):
    def create_ticket(self, user: User, ticket_data: Dict) -> SupportTicket:
        # Auto-generate ticket ID
        # Set SLA deadline based on priority
        # Auto-assign based on workload
        # Send notification to assigned agent

    def update_ticket(self, ticket: SupportTicket, update_data: Dict) -> None:
        # Update ticket status and notes
        # Track response times
        # Send notifications
        # Log all changes for audit

    def auto_assign_ticket(self, ticket: SupportTicket) -> User:
        # Load balancing algorithm
        # Skill-based routing
        # Availability checking
        # Escalation rules

class BulkOperationsService(BaseService):
    def bulk_update_users(self, user_ids: List[int], updates: Dict) -> BulkOperation:
        # Create bulk operation record
        # Queue background job
        # Track progress
        # Handle errors gracefully
```

#### Phase 3: Frontend User Management (Week 3-4)
```typescript
// frontend/src/services/admin/modernUserManagementService.ts
export class ModernUserManagementService extends BaseService {
  async searchUsers(query: string, filters?: SearchFilters): Promise<User[]> {
    const searchParams = { q: query, ...filters };
    const url = this.buildUrl(`${this.endpoints.admin.users}/search/`, searchParams);
    return this.apiClient.get(url);
  }

  async getUserProfile(userId: string): Promise<UserProfileDetail> {
    return this.apiClient.get(`${this.endpoints.admin.users}/${userId}/profile/`);
  }

  async updateUserStatus(userId: string, status: string, reason: string): Promise<void> {
    await this.apiClient.patch(`${this.endpoints.admin.users}/${userId}/`, {
      account_status: status,
      status_reason: reason
    });
  }

  async createSupportTicket(ticketData: TicketCreateData): Promise<SupportTicket> {
    return this.apiClient.post(`${this.endpoints.admin.support}/tickets/`, ticketData);
  }

  async bulkUpdateUsers(userIds: string[], updates: BulkUpdates): Promise<BulkOperationResult> {
    return this.apiClient.post(`${this.endpoints.admin.users}/bulk-update/`, {
      user_ids: userIds,
      updates
    });
  }
}

// UserManagementDashboard/UserSearchInterface.tsx
export const UserSearchInterface: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const userService = ServiceFactory.getInstance().getService(ModernUserManagementService);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      const users = await userService.searchUsers(searchQuery, filters);
      setResults(users);
    }
  }, [searchQuery, filters]);

  const handleBulkAction = async (action: BulkAction) => {
    if (selectedUsers.length === 0) return;

    const operation = await userService.bulkUpdateUsers(selectedUsers, action.updates);
    // Show progress modal
    // Poll for completion
  };

  return (
    <div className="user-search">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
      />
      <FilterPanel filters={filters} onFiltersChange={setFilters} />
      <UserResults
        users={results}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
      />
      <BulkActionBar
        selectedCount={selectedUsers.length}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
};
```

---

## TASK-063: Educational Analytics Implementation Plan

### Technical Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Analytics     │    │   Data          │    │   Report        │
│   Dashboard     │◄──►│   Warehouse     │◄──►│   Generation    │
│   (React)       │    │   (ETL)         │    │   (Background)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Predictive    │    │   Learning      │    │   Export        │
│   Analytics     │    │   Events        │    │   Services      │
│   (ML Models)   │    │   (Time Series) │    │   (BI Tools)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Development Phases

#### Phase 1: Data Warehouse & Event Collection (Week 1-2)
```python
# apps/analytics/models.py
class LearningAnalyticsFact(models.Model):
    # Fact table for learning analytics
    student_id = models.IntegerField()
    course_id = models.IntegerField()
    task_id = models.IntegerField(null=True, blank=True)
    session_id = models.CharField(max_length=255)

    event_type = models.CharField(max_length=100)
    event_timestamp = models.DateTimeField()

    # Learning metrics
    time_spent = models.DurationField(null=True, blank=True)
    attempts_count = models.IntegerField(default=0)
    score = models.FloatField(null=True, blank=True)
    completion_status = models.CharField(max_length=50)

    # Engagement metrics
    interaction_count = models.IntegerField(default=0)
    resource_access_count = models.IntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['student_id', 'event_timestamp']),
            models.Index(fields=['course_id', 'event_type']),
        ]

class StudentProgressSnapshot(models.Model):
    # Aggregated daily snapshots for performance
    student_id = models.IntegerField()
    course_id = models.IntegerField()
    snapshot_date = models.DateField()

    total_tasks = models.IntegerField()
    completed_tasks = models.IntegerField()
    average_score = models.FloatField()
    total_time_spent = models.DurationField()

    # Risk indicators
    progress_rate = models.FloatField()
    engagement_trend = models.CharField(max_length=20)
    risk_score = models.FloatField()

# ETL Service
class AnalyticsETLService(BaseService):
    def collect_learning_event(self, user: User, event_data: Dict) -> None:
        # Real-time event collection
        # Data validation and enrichment
        # Store in fact table
        # Update aggregated snapshots

    def generate_daily_snapshots(self, date: datetime.date) -> None:
        # Daily aggregation job
        # Calculate progress metrics
        # Update risk scores
        # Generate alerts for at-risk students
```

#### Phase 2: Analytics Engine & Reporting (Week 2-3)
```python
# apps/analytics/services/analytics_service.py
class AnalyticsService(BaseService):
    def get_course_analytics(self, course_id: int, time_range: str) -> Dict[str, Any]:
        # Enrollment trends
        # Completion rates
        # Engagement metrics
        # Performance distributions

    def get_student_progress_analytics(self, student_id: int) -> Dict[str, Any]:
        # Learning progression
        # Time investment patterns
        # Performance trends
        # Comparative analysis

    def predict_student_success(self, student_id: int) -> Dict[str, Any]:
        # ML model predictions
        # Risk factor analysis
        # Intervention recommendations

    def generate_cohort_analysis(self, cohort_config: Dict) -> Dict[str, Any]:
        # Comparative performance
        # Retention analysis
        # Success factor identification

class ReportingService(BaseService):
    def generate_standard_report(self, report_type: str, filters: Dict) -> bytes:
        # Pre-built report templates
        # Data aggregation
        # Visualization generation
        # Export formatting

    def schedule_report(self, report_config: Dict, schedule: Dict) -> None:
        # Automated report generation
        # Distribution management
        # Performance optimization
```

#### Phase 3: Predictive Analytics & ML Integration (Week 3-4)
```python
# apps/analytics/services/predictive_service.py
class PredictiveAnalyticsService(BaseService):
    def train_success_prediction_model(self, training_data: QuerySet) -> PredictiveModel:
        # Feature engineering
        # Model training (scikit-learn/TensorFlow)
        # Model validation
        # Model deployment

    def identify_at_risk_students(self, course_id: int) -> List[Dict]:
        # Apply prediction models
        # Risk threshold analysis
        # Intervention recommendations
        # Alert generation

    def analyze_learning_patterns(self, student_cohort: List[int]) -> Dict[str, Any]:
        # Engagement pattern analysis
        # Learning style identification
        # Performance prediction
        # Optimization recommendations

# Background tasks for model training
@shared_task
def update_prediction_models():
    # Retrain models with new data
    # Validate model performance
    # Deploy updated models
    # Generate performance reports
```

#### Phase 4: Frontend Analytics Dashboard (Week 4-5)
```typescript
// frontend/src/services/analytics/modernAnalyticsService.ts
export class ModernAnalyticsService extends BaseService {
  async getDashboardData(config: DashboardConfig): Promise<AnalyticsDashboard> {
    const url = this.buildUrl(`${this.endpoints.analytics.dashboard}/`, config);
    return this.apiClient.get(url);
  }

  async getStudentProgress(studentId: string, courseId?: string): Promise<StudentProgressData> {
    const params = courseId ? { course_id: courseId } : {};
    return this.apiClient.get(`${this.endpoints.analytics.students}/${studentId}/progress/`, params);
  }

  async generateReport(config: ReportConfig): Promise<ReportResult> {
    return this.apiClient.post(`${this.endpoints.analytics.reports}/generate/`, config);
  }

  async getCohortAnalysis(config: CohortConfig): Promise<CohortAnalysisData> {
    return this.apiClient.post(`${this.endpoints.analytics.cohort}/`, config);
  }

  async getPredictiveInsights(modelType: string, params: PredictionParams): Promise<PredictiveResults> {
    return this.apiClient.post(`${this.endpoints.analytics.predictions}/${modelType}/`, params);
  }
}

// AnalyticsReportingDashboard/AnalyticsDashboard.tsx
export const AnalyticsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboard | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const analyticsService = ServiceFactory.getInstance().getService(ModernAnalyticsService);

  const loadDashboard = useCallback(async () => {
    const config = { time_range: timeRange, filters };
    const data = await analyticsService.getDashboardData(config);
    setDashboardData(data);
  }, [timeRange, filters]);

  return (
    <div className="analytics-dashboard">
      <DashboardFilters
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <MetricsOverview metrics={dashboardData?.overview_metrics} />

      <div className="dashboard-widgets">
        <StudentProgressChart data={dashboardData?.student_progress} />
        <EngagementTrends data={dashboardData?.engagement_trends} />
        <CoursePerformance data={dashboardData?.course_performance} />
        <RiskIndicators data={dashboardData?.risk_indicators} />
      </div>

      <ReportActions onGenerateReport={handleReportGeneration} />
    </div>
  );
};
```

---

## Cross-Task Integration Points

### Shared Service Dependencies
```typescript
// All tasks depend on these core services
interface SharedAdminServices {
  authService: ModernAdminAuthService;
  auditService: ModernAuditService;
  permissionService: ModernPermissionService;
  notificationService: ModernNotificationService;
}

// Service factory configuration
export const adminServiceFactory = new ServiceFactory({
  apiClient: modernApiClient,
  endpoints: ADMIN_API_ENDPOINTS,
});
```

### Common Database Schemas
```sql
-- Shared across all admin tasks
CREATE TABLE admin_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth_user(id),
    session_key VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin_audit_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100),
    user_id INTEGER REFERENCES auth_user(id),
    target_type VARCHAR(100),
    target_id VARCHAR(100),
    changes JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

### API Integration Patterns
```python
# Consistent API structure across all admin tasks
class BaseAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser, HasAdminPermission]

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_admin_action('create', instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_admin_action('update', instance)

    def log_admin_action(self, action: str, instance: Any):
        AuditService().log_event({
            'event_type': f'{self.basename}_{action}',
            'user': self.request.user,
            'target_type': instance.__class__.__name__,
            'target_id': str(instance.id),
        })
```

This comprehensive implementation plan provides actionable development roadmaps for each admin task while ensuring proper integration and modern architecture alignment. Each task follows the established service patterns and includes detailed technical specifications for successful implementation.