const useDebug = (...messages: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(...messages);
  }
};

export { useDebug };
