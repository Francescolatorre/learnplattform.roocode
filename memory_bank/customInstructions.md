# Custom Instructions for Learning Platform Project

## Memory Bank Guidelines

All project documentation is stored in the `memory_bank/` directory:

- `productContext.md` - Project purpose and goals
- `systemPatterns.md` - Architecture and technical decisions
- `techContext.md` - Technologies and development setup
- `progress.md` - Project status and roadmap

Before starting any task:
1. Check for Memory Bank files
2. If ANY files missing, stop and create them
3. Read ALL files before proceeding
4. Verify complete context
5. Begin development

## Project-Specific Guidelines

### Development Environment
- Python 3.10+
- Django 4.2 LTS
- Django REST Framework 3.14+
- Poetry for dependency management

### Code Quality Standards
- Follow PEP 8 style guide
- Use type hints consistently
- Implement comprehensive testing
- Document all significant changes

### Architecture Patterns
- Django MVT architecture
- REST API design principles
- Async support where beneficial
- Modular component structure

### Security Requirements
- CSRF protection enabled
- Environment variables for sensitive data
- Input validation and sanitization
- Robust authentication/authorization

### Performance Guidelines
- Optimize database queries
- Implement appropriate caching
- Use async views when beneficial
- Monitor and log performance metrics

### Testing Strategy
- Maintain high test coverage (>80%)
- Unit tests for core functionality
- Integration tests for APIs
- Performance testing for critical paths

### Documentation Standards
- Clear, concise code comments
- Up-to-date API documentation
- Regular Memory Bank updates
- Detailed commit messages

### Deployment Considerations
- CI/CD pipeline configuration
- Environment-specific settings
- Backup and recovery procedures
- Monitoring and logging setup

## Version Control
- Feature branch workflow
- Meaningful commit messages
- Regular integration with main branch
- Code review requirements

## Additional Resources
- Django Documentation
- Project Wiki
- Team Communication Channels
- Development Tools Guide