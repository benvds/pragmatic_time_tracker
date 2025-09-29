<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles: N/A
- Added sections: VI. Testing Strategy, VII. Security and Safety, VIII. User Experience Standards
- Removed sections: N/A
- Templates requiring updates:
  ✅ plan-template.md (Constitution Check section already references constitution file)
  ✅ spec-template.md (no constitution-specific updates needed)
  ✅ tasks-template.md (no constitution-specific updates needed)
- Follow-up TODOs: None
-->

# Pragmatic Time Tracker Constitution

## Core Principles

### I. Simplicity First

Every feature starts with the simplest possible implementation. Complexity must be explicitly justified and documented. YAGNI (You Aren't Gonna Need It) principles are strictly enforced. Dependencies should be minimal and well-established. When in doubt, choose the straightforward solution over the clever one.

### II. Test-Driven Development

TDD is mandatory for all new features. Tests must be written first, confirmed to fail, then implementation proceeds to make them pass. The Red-Green-Refactor cycle is strictly enforced. All code paths must have corresponding tests. No feature is complete without adequate test coverage.

### III. Component Composition

Components must be small, pure, and composable. Prefer composition over inheritance. Co-locate components, styles, and tests. Maintain clear separation between presentational and container concerns. Limit component props to essential inputs only.

### IV. Code Quality Standards

All code must pass formatting, linting, and type checking before commit. Use kebab-case for file names. Prefer absolute imports over relative paths. Use CSS modules and CSS variables for styling. No hard-coded values or colors. File-scoped checks are preferred over full project scans.

### V. Dependency Management

New dependencies require explicit approval. Prefer using existing project dependencies or writing small utility modules over adding new packages. When dependencies are needed, use the project's preferred libraries. Check package.json before adding any dependency.

### VI. Testing Strategy

Components MUST have comprehensive unit tests covering rendering, data display, edge cases, and user interactions. Critical user flows MUST have end-to-end tests verifying visual behavior and accessibility. External data generation MUST be mocked in unit tests for predictable testing. Mock strategies MUST isolate components from external dependencies while maintaining realistic test scenarios.

### VII. User Experience Standards

Empty states MUST provide meaningful displays when data is unavailable. Technical data MUST be presented in human-readable formats (duration formatting, date display). Semantic HTML structure and ARIA attributes MUST be implemented for accessibility. Data presentation MUST follow consistent patterns across the application.

## Development Workflow

All development follows a structured feature-based approach using the .specify system. Features begin with specifications, proceed through planning phases, and follow TDD implementation. Each feature must have clear acceptance criteria and be broken down into discrete, testable tasks.

Permission levels are enforced: read operations, formatting, linting, and single tests are allowed without prompting. Package installs, git operations, file deletions, and full builds require explicit approval.

## Quality Gates

Every pull request must satisfy the PR checklist: formatting and type checking must pass, unit tests must be green with new tests for new code paths, and diffs must be small with clear summaries. When uncertain, developers should ask clarifying questions or open draft PRs with notes.

All features follow the project structure with proper colocation. Domain-specific logic goes in features modules, while non-domain logic belongs in lib modules. The codebase maintains consistency through established patterns and conventions.

## Governance

This constitution supersedes all other development practices and guidelines. All code reviews and development decisions must verify compliance with these principles. Complexity deviations must be documented and justified in implementation plans.

Amendments to this constitution require documentation of the change rationale, impact assessment, and migration plan for affected code. The AGENTS.md file provides runtime development guidance that complements these constitutional principles.

**Version**: 1.1.0 | **Ratified**: 2025-09-27 | **Last Amended**: 2025-09-29
