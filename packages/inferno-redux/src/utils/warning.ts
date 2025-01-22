export const warning = (message: string): void => {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
};
