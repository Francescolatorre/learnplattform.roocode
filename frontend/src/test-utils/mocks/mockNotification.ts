// test-utils/mocks/mockNotification.ts
import {vi} from 'vitest';

/**
 * Use this in your test file:
 * import { mockNotification } from '@/test-utils/mocks/mockNotification';
 * mockNotification();
 */
export function mockNotification() {
    vi.mock('@/components/Notifications/useNotification', () => {
        const notify = Object.assign(vi.fn(), {
            success: vi.fn(),
            error: vi.fn(),
            info: vi.fn(),
            warning: vi.fn(),
        });
        return {
            __esModule: true,
            default: () => notify,
        };
    });
}
