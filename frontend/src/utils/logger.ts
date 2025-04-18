const isDebugEnabled = process.env.NODE_ENV !== 'production';

export const logger = {
    debug: (...args: any[]) => {
        if (isDebugEnabled) {
            console.debug(...args);
        }
    },
    info: (...args: any[]) => {
        console.info(...args);
    },
    warn: (...args: any[]) => {
        console.warn(...args);
    },
    error: (...args: any[]) => {
        console.error(...args);
    },
};
