// Setup file for app smoke tests
// Suppress console warnings during tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('React.createElement')) return;
  originalWarn(...args);
};
