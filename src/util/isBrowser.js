"use strict";

let isBrowser = false;

if (typeof window != "undefined") {
  isBrowser = true;
}

export default isBrowser;
