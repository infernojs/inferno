import { join } from 'path';
import * as ts from 'typescript';

describe('published flag declarations', () => {
  it('allows runtime flag imports with verbatimModuleSyntax', () => {
    // No workspace path aliases: resolve the package's exports to dist/index.d.ts,
    // just as a consumer would after installing it.
    const program = ts.createProgram(
      [join(__dirname, 'fixtures/consumer.ts')],
      {
        noEmit: true,
        strict: true,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        isolatedModules: true,
        verbatimModuleSyntax: true,
        types: [],
      },
    );

    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .map(
        (diagnostic) =>
          `${diagnostic.code}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
      );

    expect(diagnostics).toEqual([]);
  });
});
