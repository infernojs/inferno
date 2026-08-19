import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replacePlugin from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { aliasPlugin } from './alias.js';
import babel from '@rollup/plugin-babel';
import assumptions from '../../babel/assumptions.json' with { type: 'json' };
import targets from '../../babel/targets.json' with { type: 'json' };

export function createPlugins(version, options) {
  const plugins = [
    aliasPlugin,
    nodeResolve({
      extensions: ['.js', '.json'],
      mainFields: ['module', 'main'],
      preferBuiltins: true
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ];

  plugins.push(
    babel({
      exclude: 'node_modules/**',
      sourceMaps: false,
      babelrc: false,
      presets: !options.esnext ? [['@babel/env', { modules: false, targets, exclude: ['transform-typeof-symbol'] }]] : null,
      babelHelpers: 'runtime',
      skipPreflightCheck: true,
      assumptions,
      plugins: ['@babel/plugin-transform-class-properties']
    })
  );

  const replaceValues = {
    preventAssignment: true,
    'process.env.INFERNO_VERSION': JSON.stringify(options.version)
  };

  if (options.replace) {
    replaceValues['process.env.NODE_ENV'] = JSON.stringify(options.env);
  }

  plugins.push(replacePlugin(replaceValues));

  if (options.minify) {
    plugins.push(
      terser({
        compress: {
          ecma: 5,
          inline: true,
          if_return: false,
          reduce_funcs: false,
          passes: 5,
          comparisons: false
        },
        ie8: false,
        mangle: {
          toplevel: true
        },
        parse: {
          html5_comments: false,
          shebang: false
        },
        toplevel: false,
        warnings: false
      })
    );
  }

  return plugins;
}
