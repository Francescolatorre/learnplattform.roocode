# Git Hooks

Custom git hooks for the Learning Platform project.

## Installation

To enable these hooks, run:

```bash
git config core.hooksPath .githooks
```

This tells git to use hooks from `.githooks/` instead of `.git/hooks/`.

## Available Hooks

### pre-commit

Runs before each commit to prevent common mistakes:

- ❌ **Blocks commits with hardcoded secrets** (passwords, API keys, etc.)
- ❌ **Blocks commits of .env files**
- ⚠️ **Warns about large files** (>5MB)
- ⚠️ **Warns about console.log statements** in production code

### Why Use Hooks?

- Catch mistakes before they reach version control
- Enforce code quality standards automatically
- Prevent security issues (exposed credentials)
- Save time in code review

## Bypass Hooks (Emergency Only)

If you need to bypass hooks temporarily:

```bash
git commit --no-verify -m "Your message"
```

**⚠️ Use with caution!** Bypassing hooks can lead to security issues or broken builds.

## Disable Hooks

To stop using these hooks:

```bash
git config --unset core.hooksPath
```

## Customization

Feel free to modify the hooks for your workflow. If you add a useful check, consider sharing it with the team!

## Troubleshooting

### Hook not running

1. Check if hooks are enabled:
   ```bash
   git config core.hooksPath
   ```
   Should return: `.githooks`

2. Verify hook is executable:
   ```bash
   ls -la .githooks/pre-commit
   ```
   Should show `x` permission: `-rwxr-xr-x`

3. Make it executable if needed:
   ```bash
   chmod +x .githooks/pre-commit
   ```

### Hook blocking valid commits

If the hook incorrectly blocks your commit:
1. Review the error message carefully
2. Fix the issue if possible
3. If it's a false positive, you can temporarily bypass with `--no-verify`
4. Report the issue so we can improve the hook
