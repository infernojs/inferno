// Jest environment using the jsdom version from package.json;
// jest-environment-jsdom would bring its own, older jsdom instead
import JSDOMEnvironment from '@jest/environment-jsdom-abstract';
import * as jsdom from 'jsdom';

export default class InfernoJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context, jsdom);
  }
}
