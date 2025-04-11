import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Suppress console warnings during tests
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
