## Status

- IN_PROGRESS
- Updated: 2025-04-13T11:58:55+02:00
- Reason: Implementation and repair of all integration tests per canonical workflow and governance.

# TASK-INTEGRATION-TEST-WORKFLOW

## Canonical Guide: Vitest Multi-Project Configuration

---

### **Rationale**

To ensure robust, maintainable, and auditable testing, this project adopts a Vitest Multi-Project configuration. This setup:

- **Separates unit tests (with mocks) from integration tests (real API)**
- **Supports Windows, macOS, and Linux**
- **Enables clear onboarding and governance/audit traceability**
- **Scales for local and CI environments**

---

### **Recommended Project Structure**

```
/src
  /services
    authService.ts
    authService.test.ts         # Unit tests (with mocks)
    authService.int.test.ts     # Integration tests (real API)
/src/test-utils/
  setupTests.ts                 # Unit test setup (mocks)
  setupIntegrationTests.ts      # Integration test setup (no mocks)
/vitest.config.ts
/package.json
```

---

### **vitest.config.ts — Multi-Project Example**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Enables describe(), it(), expect() globally
  },
  projects: [
    {
      name: 'unit',
      test: {
        include: ['src/**/*.test.ts'],
        exclude: ['src/**/*.int.test.ts'],
        environment: 'jsdom', // Simulates browser environment
        setupFiles: './src/test-utils/setupTests.ts',
      },
    },
    {
      name: 'integration',
      test: {
        include: ['src/**/*.int.test.ts'],
        environment: 'node', // For real network access
        setupFiles: './src/test-utils/setupIntegrationTests.ts',
      },
    },
  ],
});
```

**Explanation:**

- `projects`: Defines two isolated test environments.
  - **unit**: Runs all `*.test.ts` files (except `*.int.test.ts`), uses `jsdom`, and loads mocks.
  - **integration**: Runs all `*.int.test.ts` files, uses real Node.js environment, and does not mock APIs.

---

### **Unit Test Setup: `setupTests.ts`**

```ts
// src/test-utils/setupTests.ts
import { vi } from 'vitest';
import axios from 'axios';

const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  request: vi.fn(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
  defaults: {},
};

const mockAxios = {
  create: vi.fn(() => mockAxiosInstance),
  ...mockAxiosInstance,
};

vi.mock('axios', () => ({
  __esModule: true,
  default: mockAxios,
}));

Object.assign(globalThis, { mockAxios, mockAxiosInstance });

console.log('🧪 Unit test setup loaded (axios mocked)');
```

**Purpose:**

- Mocks `axios` globally for all unit tests.
- Ensures no real network requests are made during unit testing.

---

### **Integration Test Setup: `setupIntegrationTests.ts`**

```ts
// src/test-utils/setupIntegrationTests.ts
console.log('🌐 Integration test setup loaded (real API used)');

// Optional: setup logging, auth tokens, etc.
```

**Purpose:**

- No mocks; tests interact with real backend/API.
- Place for integration-specific setup (e.g., environment variables, logging).

---

### **Example Unit Test: `authService.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import authService from './authService';

describe('authService (unit)', () => {
  it('should mock login', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { token: 'mockToken' } });
    const result = await authService.login('user', 'pass');
    expect(result.token).toBe('mockToken');
  });
});
```

- Uses the mocked `axios` from `setupTests.ts`.

---

### **Example Integration Test: `authService.int.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import authService from './authService';

describe('authService (integration)', () => {
  it('should call real login API', async () => {
    const result = await authService.login('user@example.com', 'password');
    expect(result).toHaveProperty('access');
    expect(typeof result.access).toBe('string');
  });
});
```

- Calls the real backend/API.
- **Note:** Use test credentials and backend URLs via `.env` or config.

---

### **package.json Scripts (Windows/macOS/Linux compatible)**

Install [`cross-env`](https://www.npmjs.com/package/cross-env) for Windows compatibility:

```bash
npm install --save-dev cross-env
```

Add scripts:

```json
"scripts": {
  "test": "vitest",
  "test:unit": "vitest run --project unit",
  "test:integration": "vitest run --project integration",
  "test:watch": "vitest watch"
}
```

- All commands work on Windows, macOS, and Linux.

---

### **Optional: Coverage Setup per Project**

Add to each project config block in `vitest.config.ts`:

```ts
coverage: {
  provider: 'istanbul',
  reporter: ['text', 'html'],
  reportsDirectory: `./coverage/${projectName}`, // e.g. ./coverage/unit/
  clean: true,
},
```

---

### **CI Parallelism**

- Run both test sets in parallel for speed:

  ```bash
  vitest run --project unit &
  vitest run --project integration
  ```

- Or run as separate CI steps for better caching and traceability.

---

### **Summary Table**

| Feature                     | Supported |
|-----------------------------|-----------|
| Unit tests with mocks       | ✅ Yes    |
| Real API integration tests  | ✅ Yes    |
| Isolated environments       | ✅ Yes    |
| Works on Windows            | ✅ Yes    |
| CI-ready                    | ✅ Yes    |

---

### **Traceability**

- This file is the canonical reference for Vitest Multi-Project setup.
- Reference: `memory_bank/tasks/TASK-INTEGRATION-TEST-WORKFLOW.md`
- Update this file for any future changes to test architecture.

---
