---
description: Handle Dependabot PRs with automated conflict resolution
allowed-tools: Bash(*), Read(*), WebFetch(*), TodoWrite(*)
---

Handle Dependabot PRs with automated conflict resolution.

**Target**: $ARGUMENTS (pr-number|all - defaults to analyzing all open Dependabot PRs)

Process includes:
1. Analyze dependencies and security implications
2. Resolve any merge conflicts automatically where safe
3. Run comprehensive test suite
4. Merge safely if all checks pass
5. Report any issues that require manual intervention

Ensures safe, automated dependency updates while maintaining code quality.