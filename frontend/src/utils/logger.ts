// Logger-Interface definieren
interface ILogger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

// Konstante sicherer definieren
const isDebugEnabled = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

// Logger mit Interface implementieren
export const logger: ILogger = {
  debug: (...args: unknown[]) => {
    if (isDebugEnabled) {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]) => {
    console.info(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
