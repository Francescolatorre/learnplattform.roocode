# LLM Assessment Implementation Tasks

**Generated**: 2025-09-21
**Status**: Ready for Development
**Architecture Review**: ✅ APPROVED by learning-platform-architect
**Requirements**: Based on llm-assessment-requirements-analysis.md

---

## Phase 1: MVP Foundation (Weeks 1-3) - DETAILED TASKS

### Backend Tasks

#### TASK-LLM-001: Core Database Models and Migrations
**Story Points**: 5
**Priority**: Critical
**Dependencies**: None

**User Story:**
As a developer, I need database models for LLM assessment functionality so that the system can store prompts, queue items, batch jobs, and assessment results.

**Acceptance Criteria:**
- [ ] Create `LLMAssessmentPrompt` model with fields: task, prompt_template, system_instructions, model_name, temperature, max_tokens, created_by, is_active, version
- [ ] Create `LLMAssessmentQueue` model with fields: task_progress, prompt, submission_content, queue_status, priority, estimated_cost_cents, batch_id, queued_at, admin_notes
- [ ] Create `LLMBatchJob` model with fields: batch_id, job_count, total_tokens_estimated, total_cost_cents, status, created_by, created_at, submitted_at, completed_at, openai_batch_id, admin_notes
- [ ] Create `LLMAssessment` model with fields: queue_item, batch_job, llm_response, confidence_score, assessment_status, instructor_review_status, override_reason, actual_cost_cents, processing_time_ms, completed_at
- [ ] Add proper indexes for performance optimization
- [ ] Create Django migrations
- [ ] Add model admin interfaces for debugging

**Technical Specifications:**
```python
# Key model relationships
class LLMAssessmentPrompt(models.Model):
    task = models.OneToOneField(LearningTask, on_delete=models.CASCADE, related_name='llm_prompt')
    model_name = models.CharField(max_length=100, default='gpt-4o-mini', choices=[
        ('gpt-4o-mini', 'GPT-4o Mini (Recommended for testing)'),
        ('gpt-3.5-turbo', 'GPT-3.5 Turbo'),
        ('gpt-4o', 'GPT-4o'),
        ('gpt-4', 'GPT-4 (Premium)')
    ])

# Important indexes for queue performance
class Meta:
    indexes = [
        models.Index(fields=['queue_status', 'priority', 'queued_at']),
        models.Index(fields=['batch_id']),
        models.Index(fields=['task_progress']),
    ]
```

**Risk Assessment:**
- **Low Risk**: Standard Django model creation
- **Mitigation**: Follow existing model patterns from core/models.py

---

#### TASK-LLM-002: OpenAI Batch API Integration Service
**Story Points**: 8
**Priority**: Critical
**Dependencies**: TASK-LLM-001

**User Story:**
As an admin, I need integration with OpenAI's Batch API so that I can process learning task assessments cost-effectively using batch processing.

**Acceptance Criteria:**
- [ ] Create `OpenAIBatchService` class for API interactions
- [ ] Implement batch job creation with JSONL file upload
- [ ] Implement batch status monitoring and polling
- [ ] Implement batch result retrieval and parsing
- [ ] Add proper error handling for API failures, rate limits, and timeouts
- [ ] Add cost estimation before batch submission
- [ ] Add comprehensive logging for audit trails
- [ ] Add data anonymization layer for student privacy
- [ ] Implement retry logic with exponential backoff
- [ ] Add circuit breaker pattern for resilience

**Technical Specifications:**
```python
class OpenAIBatchService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.circuit_breaker = CircuitBreaker()

    async def create_batch_job(self, assessment_requests: List[dict]) -> str:
        # Create JSONL file with anonymized data
        # Upload to OpenAI
        # Create batch job
        # Return OpenAI batch ID

    async def get_batch_status(self, openai_batch_id: str) -> dict:
        # Poll OpenAI for batch status
        # Return status, progress, completion info

    async def retrieve_batch_results(self, openai_batch_id: str) -> List[dict]:
        # Download results file
        # Parse JSONL responses
        # Return structured assessment data

    def anonymize_submission_data(self, submission: dict) -> dict:
        # Remove PII while preserving educational content
        # Hash student identifiers
        # Return anonymized data safe for OpenAI
```

**Risk Assessment:**
- **High Risk**: External API dependency, data privacy concerns
- **Mitigation**: Comprehensive error handling, data anonymization, circuit breaker pattern

---

#### TASK-LLM-003: Queue Management API Endpoints
**Story Points**: 6
**Priority**: High
**Dependencies**: TASK-LLM-001, TASK-LLM-002

**User Story:**
As an admin, I need API endpoints to manage the LLM assessment queue so that I can view, prioritize, and batch process queued assessments.

**Acceptance Criteria:**
- [ ] Create `LLMAssessmentPromptViewSet` with CRUD operations
- [ ] Create `LLMAssessmentQueueViewSet` with filtering and search
- [ ] Create `LLMBatchJobViewSet` with status monitoring
- [ ] Add admin-only permissions and authentication
- [ ] Implement filtering by course, instructor, submission date, priority
- [ ] Add bulk operations for queue item selection
- [ ] Add cost estimation endpoints
- [ ] Add queue statistics and analytics endpoints
- [ ] Follow existing API patterns and versioning

**Technical Specifications:**
```python
# API endpoint structure following existing patterns
urlpatterns = [
    path('admin/llm-prompts/', LLMAssessmentPromptViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('admin/llm-prompts/<uuid:pk>/', LLMAssessmentPromptViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
    path('admin/llm-queue/', LLMAssessmentQueueViewSet.as_view({'get': 'list'})),
    path('admin/llm-queue/<uuid:pk>/priority/', update_queue_priority),
    path('admin/llm-queue/<uuid:pk>/notes/', add_admin_notes),
    path('admin/llm-batches/', LLMBatchJobViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('admin/llm-batches/<uuid:pk>/submit/', submit_batch_job),
    path('admin/llm-batches/<uuid:pk>/status/', get_batch_status),
]

# Permission classes following existing patterns
class LLMAssessmentPromptViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = LLMAssessmentPrompt.objects.all()
    serializer_class = LLMAssessmentPromptSerializer
```

**Risk Assessment:**
- **Medium Risk**: Complex filtering and permissions
- **Mitigation**: Follow existing ViewSet patterns, comprehensive testing

---

#### TASK-LLM-004: Admin-Triggered Batch Processing Engine
**Story Points**: 7
**Priority**: High
**Dependencies**: TASK-LLM-001, TASK-LLM-002, TASK-LLM-003

**User Story:**
As an admin, I need a batch processing engine that I can manually trigger so that I can control when and how LLM assessments are processed while managing costs and quality.

**Acceptance Criteria:**
- [ ] Create `LLMBatchProcessor` class for orchestrating batch operations
- [ ] Implement manual batch creation from selected queue items
- [ ] Implement batch job submission to OpenAI
- [ ] Implement result processing and storage
- [ ] Add comprehensive error handling and recovery
- [ ] Add progress tracking and status updates
- [ ] Add cost calculation and budget checking
- [ ] Add audit logging for all operations
- [ ] Implement graceful handling of partial batch failures

**Technical Specifications:**
```python
class LLMBatchProcessor:
    def __init__(self):
        self.openai_service = OpenAIBatchService()
        self.audit_logger = AuditLogger()

    async def create_batch_from_queue(self, queue_item_ids: List[str], admin_user: User, notes: str = "") -> LLMBatchJob:
        # Validate queue items
        # Estimate costs
        # Create batch job record
        # Prepare OpenAI request format
        # Return batch job for admin review

    async def submit_batch_to_openai(self, batch_job: LLMBatchJob) -> None:
        # Submit to OpenAI Batch API
        # Update batch job with OpenAI batch ID
        # Set status to 'submitted'
        # Log submission details

    async def process_completed_batch(self, batch_job: LLMBatchJob) -> None:
        # Retrieve results from OpenAI
        # Parse and validate responses
        # Create LLMAssessment records
        # Update queue item statuses
        # Calculate actual costs
        # Notify relevant users

    async def handle_batch_failure(self, batch_job: LLMBatchJob, error: Exception) -> None:
        # Log failure details
        # Update batch job status
        # Determine if retry is appropriate
        # Notify administrators
```

**Risk Assessment:**
- **Medium Risk**: Complex orchestration logic, error recovery
- **Mitigation**: Comprehensive testing, staged rollout, detailed logging

---

### Frontend Tasks

#### TASK-LLM-005: Modern LLM Service Integration
**Story Points**: 5
**Priority**: High
**Dependencies**: TASK-LLM-003

**User Story:**
As a developer, I need TypeScript services for LLM assessment functionality so that the frontend can interact with the backend APIs following our modern service architecture patterns.

**Acceptance Criteria:**
- [ ] Create `ModernLLMAssessmentService` extending `BaseService`
- [ ] Create `ModernLLMBatchService` extending `BaseService`
- [ ] Implement all CRUD operations for prompts, queue, and batches
- [ ] Add proper TypeScript interfaces and types
- [ ] Integrate with existing `ServiceFactory` pattern
- [ ] Add error handling using `withManagedExceptions`
- [ ] Add proper API client integration
- [ ] Follow existing service patterns and conventions

**Technical Specifications:**
```typescript
// Service interfaces following existing patterns
export interface ILLMPromptData {
  taskId: string;
  promptTemplate: string;
  systemInstructions?: string;
  modelName: 'gpt-4o-mini' | 'gpt-3.5-turbo' | 'gpt-4o' | 'gpt-4';
  temperature: number;
  maxTokens: number;
}

export interface ILLMQueueItem {
  id: string;
  taskProgress: string;
  prompt: string;
  submissionContent: string;
  queueStatus: 'queued' | 'selected' | 'processing' | 'completed' | 'failed' | 'skipped';
  priority: 'high' | 'normal' | 'low';
  estimatedCostCents: number;
  queuedAt: Date;
  adminNotes?: string;
}

export class ModernLLMAssessmentService extends BaseService {
  async createPrompt(promptData: ILLMPromptData): Promise<ILLMPrompt> {
    return withManagedExceptions(async () => {
      const response = await this.apiClient.post(apiConfig.llmAssessments.prompts, promptData);
      return response.data;
    }, 'Failed to create LLM assessment prompt');
  }

  async getQueueOverview(filters?: QueueFilters): Promise<IQueueOverview> {
    return withManagedExceptions(async () => {
      const response = await this.apiClient.get(apiConfig.llmAssessments.queue, { params: filters });
      return response.data;
    }, 'Failed to fetch queue overview');
  }
}
```

**Risk Assessment:**
- **Low Risk**: Following established patterns
- **Mitigation**: Comprehensive TypeScript typing, existing error handling patterns

---

#### TASK-LLM-006: Basic Prompt Management UI
**Story Points**: 6
**Priority**: High
**Dependencies**: TASK-LLM-005

**User Story:**
As an instructor, I need a user interface to create and manage LLM assessment prompts so that I can configure automated assessment for my learning tasks.

**Acceptance Criteria:**
- [ ] Create `LLMPromptManagement` component with Material UI
- [ ] Implement prompt creation form with validation
- [ ] Add rich text editor for prompt templates
- [ ] Implement variable insertion helpers (e.g., {student_submission}, {task_title})
- [ ] Add model selection dropdown with cost information
- [ ] Add prompt preview functionality
- [ ] Implement prompt editing and versioning
- [ ] Add prompt testing with sample submissions
- [ ] Follow existing UI patterns and accessibility standards

**Technical Specifications:**
```typescript
// Component structure following existing patterns
export const LLMPromptManagement: React.FC = () => {
  const llmService = ServiceFactory.getInstance().getService(ModernLLMAssessmentService);
  const [prompts, setPrompts] = useState<ILLMPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<ILLMPrompt | null>(null);

  return (
    <Container maxWidth="lg">
      <LLMPromptList prompts={prompts} onSelect={setSelectedPrompt} />
      <LLMPromptEditor prompt={selectedPrompt} onSave={handleSave} />
      <LLMPromptPreview prompt={selectedPrompt} />
    </Container>
  );
};

// Key subcomponents
const LLMPromptEditor: React.FC<{prompt: ILLMPrompt, onSave: Function}> = ({prompt, onSave}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <TextField label="Prompt Template" multiline rows={8} />
      <FormControl>
        <InputLabel>Model</InputLabel>
        <Select>
          <MenuItem value="gpt-4o-mini">GPT-4o Mini ($0.10/assessment)</MenuItem>
          <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo ($0.50/assessment)</MenuItem>
        </Select>
      </FormControl>
      <VariableInsertion onInsert={handleVariableInsert} />
    </Paper>
  );
};
```

**Risk Assessment:**
- **Medium Risk**: Complex UI with rich text editing
- **Mitigation**: Use proven Material UI components, follow existing patterns

---

#### TASK-LLM-007: Admin Queue Management Dashboard
**Story Points**: 8
**Priority**: High
**Dependencies**: TASK-LLM-005

**User Story:**
As an admin, I need a dashboard to view and manage the LLM assessment queue so that I can monitor pending assessments, adjust priorities, and create batches for processing.

**Acceptance Criteria:**
- [ ] Create `LLMQueueDashboard` component with comprehensive queue view
- [ ] Implement filtering by course, instructor, date, priority, status
- [ ] Add search functionality across submission content
- [ ] Implement bulk selection for batch creation
- [ ] Add priority adjustment controls
- [ ] Add admin notes functionality
- [ ] Display cost estimates and budget status
- [ ] Add queue statistics and analytics
- [ ] Implement real-time status updates
- [ ] Add export functionality for reporting

**Technical Specifications:**
```typescript
export const LLMQueueDashboard: React.FC = () => {
  const batchService = ServiceFactory.getInstance().getService(ModernLLMBatchService);
  const [queueItems, setQueueItems] = useState<ILLMQueueItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<QueueFilters>({});

  return (
    <Container maxWidth="xl">
      <QueueFilters filters={filters} onFiltersChange={setFilters} />
      <QueueStatistics items={queueItems} />
      <QueueTable
        items={queueItems}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onPriorityChange={handlePriorityChange}
      />
      <BatchCreationPanel
        selectedItems={Array.from(selectedItems)}
        onCreateBatch={handleCreateBatch}
      />
    </Container>
  );
};

// Key features
const QueueTable: React.FC = ({items, selectedItems, onSelectionChange}) => {
  return (
    <DataGrid
      rows={items}
      columns={[
        { field: 'taskTitle', headerName: 'Task', width: 200 },
        { field: 'studentName', headerName: 'Student', width: 150 },
        { field: 'priority', headerName: 'Priority', width: 100 },
        { field: 'queuedAt', headerName: 'Queued', width: 150 },
        { field: 'estimatedCost', headerName: 'Cost', width: 100 },
      ]}
      checkboxSelection
      onSelectionModelChange={onSelectionChange}
      filterMode="server"
    />
  );
};
```

**Risk Assessment:**
- **High Risk**: Complex data grid with real-time updates
- **Mitigation**: Use Material UI DataGrid, implement proper state management

---

### Admin Interface Tasks

#### TASK-LLM-008: Queue Overview Dashboard with Filtering
**Story Points**: 6
**Priority**: Medium
**Dependencies**: TASK-LLM-007

**User Story:**
As an admin, I need advanced filtering and search capabilities for the assessment queue so that I can efficiently find and manage specific assessments based on various criteria.

**Detailed Requirements:** See Section 7.2 of llm-assessment-requirements-analysis.md

---

#### TASK-LLM-009: Batch Creation and Management Interface
**Story Points**: 7
**Priority**: Medium
**Dependencies**: TASK-LLM-004, TASK-LLM-007

**User Story:**
As an admin, I need an interface to create, submit, and monitor batch jobs so that I can control the processing of LLM assessments and track their progress.

**Detailed Requirements:** See Section 7.3 of llm-assessment-requirements-analysis.md

---

#### TASK-LLM-010: Cost Estimation and Monitoring Display
**Story Points**: 4
**Priority**: Medium
**Dependencies**: TASK-LLM-008, TASK-LLM-009

**User Story:**
As an admin, I need real-time cost monitoring and budget controls so that I can manage LLM assessment expenses and prevent budget overruns.

**Detailed Requirements:** See Section 4 of llm-assessment-requirements-analysis.md

---

## Phase 2: Enhanced Admin Features (Weeks 4-6) - USER STORIES

### Phase 2 Overview
**Goal**: Enhance the MVP with advanced admin capabilities, better cost controls, and improved user experience.
**Total Effort**: 22 story points
**Detailed Requirements**: See Section 6.2 of llm-assessment-requirements-analysis.md

### User Stories:

#### STORY-LLM-011: Advanced Cost Tracking and Budget Controls
**Epic**: Cost Management
**Story Points**: 3
**User Story**: As an admin, I want sophisticated budget controls and cost analytics so that I can optimize LLM assessment spending and prevent overruns.
**Details**: Implement real-time cost monitoring, automated budget alerts, provider cost comparison, and ROI analytics.

#### STORY-LLM-012: Instructor Review and Override System
**Epic**: Quality Assurance
**Story Points**: 3
**User Story**: As an instructor, I want to review and potentially override LLM assessments so that I can maintain quality control and address edge cases.
**Details**: Build instructor dashboard for assessment review, one-click approval/override, audit trail preservation.

#### STORY-LLM-013: Enhanced Queue Filtering and Search
**Epic**: Admin Experience
**Story Points**: 2
**User Story**: As an admin, I want advanced search and filtering capabilities so that I can quickly find specific assessments in large queues.
**Details**: Implement full-text search, advanced filters, saved filter presets, bulk operations.

#### STORY-LLM-014: Assessment Quality Analytics
**Epic**: Analytics & Reporting
**Story Points**: 2
**User Story**: As an admin, I want analytics on assessment quality and accuracy so that I can monitor system performance and optimize prompts.
**Details**: Quality metrics dashboard, confidence score analytics, instructor feedback aggregation.

#### STORY-LLM-015: Enhanced Prompt Management with Templates
**Epic**: User Experience
**Story Points**: 3
**User Story**: As an instructor, I want prompt templates and advanced editing tools so that I can create effective assessments more efficiently.
**Details**: Template library, A/B testing framework, prompt optimization suggestions.

#### STORY-LLM-016: Student Assessment Feedback Display
**Epic**: Student Experience
**Story Points**: 3
**User Story**: As a student, I want to view detailed LLM assessment feedback so that I can understand my performance and improve.
**Details**: Structured feedback display, improvement suggestions, historical progress tracking.

#### STORY-LLM-017: Advanced Admin Analytics Dashboard
**Epic**: Analytics & Reporting
**Story Points**: 2
**User Story**: As an admin, I want comprehensive analytics and reporting so that I can monitor system usage and make data-driven decisions.
**Details**: Usage analytics, performance metrics, cost trends, user adoption tracking.

#### STORY-LLM-018: ModernLearningTaskService Integration
**Epic**: Platform Integration
**Story Points**: 2
**User Story**: As a developer, I want seamless integration with the existing task service so that LLM assessment works naturally within the platform.
**Details**: Deep integration with modernLearningTaskService, unified API patterns, backward compatibility.

#### STORY-LLM-019: Email Notification System Integration
**Epic**: Communication
**Story Points**: 2
**User Story**: As a user, I want email notifications for assessment status changes so that I stay informed about processing progress.
**Details**: Notification templates, preference management, multi-channel delivery.

---

## Phase 3: Automation & Optimization (Weeks 7-9) - USER STORIES

### Phase 3 Overview
**Goal**: Add semi-automation, multi-provider support preparation, and advanced optimization features.
**Total Effort**: 18 story points
**Detailed Requirements**: See Section 6.3 of llm-assessment-requirements-analysis.md

### User Stories:

#### STORY-LLM-020: Scheduled Batch Processing
**Epic**: Automation
**Story Points**: 3
**User Story**: As an admin, I want to schedule recurring batch processing so that assessments are processed automatically at optimal times.
**Details**: Admin-configured scheduling, optimal timing recommendations, automatic batch composition.

#### STORY-LLM-021: Multi-Provider Cost Optimization Engine
**Epic**: Cost Optimization
**Story Points**: 3
**User Story**: As an admin, I want the system to select the most cost-effective provider so that I can minimize expenses while maintaining quality.
**Details**: Provider comparison algorithms, real-time cost analysis, quality vs cost optimization.

#### STORY-LLM-022: Assessment Appeal and Dispute Resolution
**Epic**: Quality Assurance
**Story Points**: 2
**User Story**: As a student, I want to appeal LLM assessment results so that I can request human review for disputed grades.
**Details**: Appeal workflow, instructor review process, resolution tracking.

#### STORY-LLM-023: Advanced Prompt Testing and Optimization Tools
**Epic**: Prompt Management
**Story Points**: 3
**User Story**: As an instructor, I want advanced tools to test and optimize my assessment prompts so that I can improve assessment quality.
**Details**: A/B testing framework, prompt performance analytics, optimization suggestions.

#### STORY-LLM-024: Comprehensive Cost and Performance Analytics
**Epic**: Analytics & Reporting
**Story Points**: 2
**User Story**: As an admin, I want detailed analytics on cost and performance so that I can optimize the entire assessment system.
**Details**: Advanced dashboards, predictive analytics, ROI calculations, optimization recommendations.

#### STORY-LLM-025: Mobile-Responsive Assessment Interfaces
**Epic**: User Experience
**Story Points**: 1
**User Story**: As a user, I want mobile-friendly interfaces so that I can manage LLM assessments from any device.
**Details**: Responsive design implementation, mobile-optimized workflows, touch-friendly interfaces.

#### STORY-LLM-026: Simple Scheduling System for Recurring Batches
**Epic**: Automation
**Story Points**: 2
**User Story**: As an admin, I want to set up recurring batch processing schedules so that routine assessments are handled automatically.
**Details**: Cron-like scheduling, recurring job management, schedule optimization.

#### STORY-LLM-027: Automatic Provider Selection Based on Cost/Performance
**Epic**: Optimization
**Story Points**: 2
**User Story**: As an admin, I want the system to automatically choose the best provider so that assessments are processed optimally without manual intervention.
**Details**: Intelligent provider routing, performance history analysis, cost-quality balance optimization.

---

## Success Metrics

### Phase 1 Success Criteria:
- [ ] MVP deployed and functional
- [ ] Admin can create prompts and process batches manually
- [ ] Cost tracking and basic monitoring operational
- [ ] Data privacy and security measures implemented
- [ ] <$500/month testing budget maintained

### Phase 2 Success Criteria:
- [ ] Instructor adoption rate >25%
- [ ] Assessment processing time <6 hours
- [ ] Quality score >4.0/5.0 from instructors
- [ ] Cost per assessment <$0.75 average

### Phase 3 Success Criteria:
- [ ] Semi-automated processing operational
- [ ] Multi-provider cost optimization functional
- [ ] Instructor adoption rate >40%
- [ ] 50% reduction in manual grading time achieved

---

## Risk Mitigation Summary

**High Priority Risks:**
1. **Data Privacy**: Anonymization layer, audit trails, retention policies
2. **Cost Overruns**: Budget controls, real-time monitoring, usage limits
3. **Quality Issues**: Instructor review system, confidence scoring, human oversight

**Technical Risks:**
1. **OpenAI API Failures**: Circuit breaker, retry logic, graceful degradation
2. **Performance Issues**: Queue optimization, batch sizing, monitoring
3. **Integration Complexity**: Existing service patterns, comprehensive testing

**Next Steps:**
1. Review and approve this implementation plan
2. Set up development environment and testing infrastructure
3. Begin Phase 1 implementation starting with TASK-LLM-001
4. Establish monitoring and cost tracking from day one