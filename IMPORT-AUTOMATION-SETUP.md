# Automated Import Order Setup

## Current Setup ✅
The project already has import order rules configured in `eslint.config.mjs` that can auto-fix import violations:

```bash
# Auto-fix import order and other fixable ESLint issues
npm run lint -- --fix
```

## Enhanced Import Sorting (Optional)

For better automatic import sorting, you can add `eslint-plugin-simple-import-sort`:

### 1. Install the Plugin
```bash
cd frontend
npm install --save-dev eslint-plugin-simple-import-sort
```

### 2. Update ESLint Config
Add to `eslint.config.mjs`:

```javascript
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  // ... existing config
  {
    plugins: {
      // ... existing plugins
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Replace existing import/order rule with:
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // Remove: 'import/order': [...]
    },
  },
);
```

### 3. VS Code Auto-fix on Save
Add to `.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact"
  ]
}
```

### 4. Pre-commit Hook
Add to `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Available Commands

```bash
# Auto-fix all import order issues
npm run lint -- --fix

# Fix specific file
npx eslint src/path/to/file.ts --fix

# Check without fixing
npm run lint
```

## IDE Integration

Most IDEs support ESLint auto-fix:
- **VS Code**: ESLint extension + save actions
- **WebStorm**: Built-in ESLint integration
- **Vim/Neovim**: ALE, coc-eslint, or null-ls

This eliminates manual import sorting and prevents CI pipeline failures.