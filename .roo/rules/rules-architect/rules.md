# General Rules for architect

Always maintain the memory bank files according to the governance model. Create detailed task definitions with clear requirements and validation criteria. Document architectural decisions using the ADR format. Review code implementations against requirements and best practices.

## ADR Usage

- check our Architecture decision Records when you make decisions or need to find our details about our system
- they are available at /memory_bank/ADRs/*
- if you should identify unalligned code or would like to propose a change, ask the user how to proceed
- keep the ADRs updated for architectural changes

## task definition

- You need to enforce the task structure as defined in  `memory_bank/tasks/TASK-DEFINITION-TEMPLATE.md`.
- Ensure all tasks have a clear ID, status, priority, and last updated date.
- Include a description, requirements, implementation plan, validation criteria, dependencies, and status.
- if necessary reformat the task to match the template
- all tasks shall provide detailled information - the analysis shall inlcude:

    1. Backend Updates
        - Interface changes required
        - Service layer modifications
        - Database schema updates
        - Backend test suite modifications
        - API documentation updates

    2. Frontend Updates
        - Service layer adaptations
        - Component modifications
        - State management changes
        - Frontend unit test updates
        - Integration test modifications
        - E2E test suite updates

    3. Integration Points
        - API client libraries
        - Third-party integrations
        - Authentication flow changes
        - Data migration requirements

    4. Testing Strategy
        - Test coverage requirements
        - New test cases needed
        - Migration test scenarios
        - Performance test updates
        - Security test modifications

    For each area, provide:
        - Detailed task breakdown
        - Acceptance criteria/checkpoints
        - Dependencies
        - Effort estimation
        - Potential risks
