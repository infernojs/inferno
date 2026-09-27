import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = `
  class DownleveledComponent extends Inferno.Component {
    constructor(props, context) {
      super(props, context);
      this.state = { label: props.label };
    }

    render() {
      return this.state.label;
    }
  }
`;

const compilers = {
  'TypeScript ES5': ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None }
  }).outputText,
  'Babel callable super': transformSync(source, {
    babelrc: false,
    configFile: false,
    assumptions: {
      noClassCalls: true,
      setClassMethods: true,
      superIsCallableConstructor: true
    },
    presets: [['@babel/preset-env', { targets: { ie: '11' }, modules: false }]]
  }).code
};

for (const filename of [
  'index.cjs',
  'index.min.cjs',
  'inferno.js',
  'inferno.min.js'
]) {
  for (const [compiler, compiled] of Object.entries(compilers)) {
    test(`${filename} supports a subclass downleveled by ${compiler}`, () => {
      const path = new URL(
        `../../packages/inferno/dist/${filename}`,
        import.meta.url
      );
      const Inferno = filename.endsWith('.cjs')
        ? require(fileURLToPath(path))
        : runInNewContext(`${readFileSync(path, 'utf8')}\nInferno;`, {
            console
          });
      const DownleveledComponent = runInNewContext(
        `${compiled}\nDownleveledComponent;`,
        { Inferno }
      );
      const props = { label: 'original' };
      const context = { theme: 'test' };
      const instance = new DownleveledComponent(props, context);

      assert.ok(instance instanceof Inferno.Component);
      assert.equal(instance.props, props);
      assert.equal(instance.context, context);
      assert.equal(instance.render(), 'original');
    });
  }
}
