/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

export const warning = (message: string) => {
  if (typeof console !== "undefined" && typeof console.error === "function") {
    // tslint:disable-next-line:no-console
    console.error(message);
  }

  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    // tslint:disable-next-line:no-empty
  } catch (e) {}
};
