import {vi} from 'vitest';

// Mock the ErrorNotifier hooks and context
vi.mock('../components/ErrorNotifier/useErrorNotifier', () => {
    const mockNotify = vi.fn();
    return {
        useNotification: () => mockNotify,
        useErrorNotifier: () => mockNotify
    };
});

vi.mock('../components/ErrorNotifier/ErrorProvider', () => {
    return {
        ErrorProvider: ({children}: {children: React.ReactNode}) => children,
        useErrorNotifierContext: vi.fn().mockReturnValue({
            addError: vi.fn(),
            dismissError: vi.fn()
        })
    };
});
